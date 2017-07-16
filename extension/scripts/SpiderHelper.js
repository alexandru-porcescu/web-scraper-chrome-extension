var SpiderHelper = function (selectors) {

};

SpiderHelper.getFormValuesObject = function($form, keyMap) {
	keyMap = keyMap || {};
	var data = {}, inputElement, inputKey;
	
	if (!$form) { return data;}

	var elementsArray = $form.serializeArray();

	  /* Because serializeArray() ignores unset checkboxes and radio buttons: */
    elementsArray = elementsArray.concat(
        $form.find('input[type=checkbox]:not(:checked)').map(
            function() {
                return {"name": this.name, "value": false}
            }).get()
    );

	for (var i = elementsArray.length - 1; i >= 0; i--) {
		inputElement = elementsArray[i];
		inputKey = inputElement['name'];
		
		if (inputKey in keyMap) {
			inputKey = keyMap[inputKey];
		};

		data[inputKey]  = inputElement['value'];
	}

	return data;
}


SpiderHelper.elementHasAttr = function($element, attribute) {
	var attr = $element.attr(attribute);

	// For some browsers, `attr` is undefined; for others, `attr` is false. Check for both.
	return (typeof attr !== typeof undefined && attr !== false);
}

module.exports = SpiderHelper