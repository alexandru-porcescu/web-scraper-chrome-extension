var SpiderSelector = function (selectors) {

};

SpiderSelector.selectorsExcept = function(doneSelectors) {
	var selectors = {};
	var availableSelectors = this.SelectorList;

	for (var selectorId in availableSelectors) {
	  if (!availableSelectors.hasOwnProperty(selectorId)) {
	    continue;
	  }
	  if (doneSelectors.indexOf(selectorId) > -1) {
	  	continue;
	  }

	  // if element resides inside a container element check if parent was configured
	  if (this.insideContainerElement(selectorId)) {
	  		var containerElem = this.getPossibleContainerSelectorId(selectorId);
	  		if (!(doneSelectors.indexOf(containerElem) > -1)) {
	  			continue;
	  		}
	  }

	  var selectorGroup = this.getSelectorGroup(selectorId);
	  if (!(selectorGroup in selectors)) {
	  		selectors[selectorGroup] = {
	  			"group": selectorGroup,
	  			"selectors": []
	  		}
	  }

	  selectors[selectorGroup]["selectors"].push({
	  	"id": selectorId,
	  	"label": availableSelectors[selectorId].label
	  })
	}

	var selectorsValues = new Array;

	for(var s in selectors) {
	    selectorsValues.push(selectors[s]);
	}

	return selectorsValues;
};

SpiderSelector.getSelectorGroup = function(selectorId) {
	var defaultGroup = "Other";

	if (!selectorId) { return defaultGroup; }

	var path = selectorId.split(".");
	
	if (path.length == 1) {
		return defaultGroup;
	}

	return path[0];
}

SpiderSelector.insideContainerElement = function(selectorId) {
	if (!selectorId) { return false; }
	var isContainerElement = this.isContainerElement(selectorId);
	var isInParentContainer = this.getPossibleContainerSelectorId(selectorId) in this.SelectorList;
	return !isContainerElement && isInParentContainer;
};

SpiderSelector.isContainerElement = function(selectorId) {
	if (!selectorId) { return false};
	return selectorId.indexOf("container") !== -1;
};


SpiderSelector.getPossibleContainerSelectorId = function(selectorId) {
	// convention: if there is a selector id with the same prefix and container key
	var path = selectorId.split(".");
	path.pop();
	path.push("container");
	return path.join(".");
};

SpiderSelector.getParentSelectors = function(newSelectorId, currentParentSelectorId) {
	if (!currentParentSelectorId) {
		currentParentSelectorId = "_root";
	}

	if (this.insideContainerElement(newSelectorId)) {
		return [this.getPossibleContainerSelectorId(newSelectorId)];
	}

	return [currentParentSelectorId];
};

SpiderSelector.getSelectorBySelectorId = function(selectorId, parentSelectorId) {
	if (!this.isContainerElement(selectorId)) {
		
		var selector = new Selector({
			id : selectorId,
			parentSelectors: this.getParentSelectors(selectorId, parentSelectorId),
			type: 'SelectorText',
			multiple: false
		});

		return selector;
	}

	return this.getContainerSelectorBySelectorId(selectorId, parentSelectorId)
}

SpiderSelector.getContainerSelectorBySelectorId = function(selectorId, parentSelectorId) {
	var selector = new Selector({
		id : selectorId,
		parentSelectors: this.getParentSelectors(selectorId, parentSelectorId),
		type: 'SelectorElement',
		multiple: true
	});

	return selector;
}



SpiderSelector.getAvailableSelectorTypesBySelectorId = function(selectorId) {
	if (this.isContainerElement(selectorId)) {
		return [
			{
				type: 'SelectorElement',
				title: 'Element'
			}
		];
	}

	return this.SelectorTypes;
}

SpiderSelector.getPriceStyles = function(selectedPrice) {
	if (!selectedPrice) {return this.PriceStyles;}

	var priceStyles = JSON.parse(JSON.stringify(this.PriceStyles));
	for (var i = priceStyles.length - 1; i >= 0; i--) {
		if (priceStyles[i].id === selectedPrice) {
			priceStyles[i].selected = true;
		}
	}

	return priceStyles;
}

SpiderSelector.getResultForSelector = function(selector) {
	
	var defaultResult = "text";

	switch (selector.type) {
	  case 'SelectorHTML':
	    return 'html';
	    break;
	  case 'SelectorText':
	    return 'text';
	    break;
	  case 'SelectorLink':
	    return 'href';
	    break;
	  case 'SelectorElementAttribute':
	    return selector.extractAttribute ? selector.extractAttribute : defaultResult;
	    break;
	  default:
	    return defaultResult;
	}
}

SpiderSelector.getSectorTypeByResultInput = function(selectorResult, previousType) {
	selectorResult = selectorResult.trim().toLowerCase();
	// container case or empty
	if (!selectorResult) {
		return previousType ? previousType : 'SelectorText';
	}

	switch (selectorResult) {
	  case 'html':
	    return 'SelectorHTML';
	    break;
	  case 'text':
	    return 'SelectorText';
	    break;
	  case 'href':
	    return 'SelectorLink';
	    break;
	  default:
	    return 'SelectorElementAttribute';
	}
}

SpiderSelector.getSelectorBreadcrumbById = function(selectorId) {
	var defaultValue = "";
	if (!selectorId) {return defaultValue;}
	var selectorData = this.SelectorList[selectorId];
	return selectorData && selectorData.breadcrumb ? selectorData.breadcrumb : defaultValue;
}

SpiderSelector.selectorToSpiderRule = function(selector) {
	selector = selector || {};

	return {
		selector: selector.selector || "",
		result: SpiderSelector.getResultForSelector(selector),
		remove: selector.selectorRemove || "",
	};
}

SpiderSelector.generateRegexRules = function(sitemap) {

	var selectors = sitemap.getSitemapSelectors();
	var regexes = {};
	
	for (var i = selectors.length - 1; i >= 0; i--) {
		var selector = selectors[i];
		var regexRules = selector.regexReplace || [];
		var spiderSelector = this.getSelectorSpiderName(selector.id);
		;

		for (var j = regexRules.length - 1; j >= 0; j--) {
			var selectorRegexRule = regexRules[j];

			if (!selectorRegexRule.regex.trim()) { continue };
			if (!(spiderSelector in regexes)) { regexes[spiderSelector] = {};}

			var regexLiteral = "/" + selectorRegexRule.regex + "/" + selectorRegexRule.options;
			regexes[spiderSelector][regexLiteral] = selectorRegexRule.replacement;
		}
	}

	return regexes;
}

SpiderSelector.getSelectorSpiderName = function(selectorId) {
	var path = selectorId.split(".");

	return path[path.length-1];
}

SpiderSelector.generateSelectorsForPath = function(sitemap, startsWith, exclude) {
	var data = {};
	exclude = exclude || [];

	var selectorObj;
	// 
	var availableSelectors = this.SelectorList;

	for (var selectorId in availableSelectors) {
	  if (!availableSelectors.hasOwnProperty(selectorId)) {
	    continue;
	  }

	  // selector does not start with
	  if (selectorId.substring(0, startsWith.length) !== startsWith) {
	  	continue;
	  } 

	  // excluded
	  if (exclude.indexOf( selectorId ) > -1) {
	  	continue;
	  } 
	  
	  selectorObj = sitemap.getSelectorById(selectorId);
	  if (selectorObj) {
	  	data[this.getSelectorSpiderName(selectorId)] = this.selectorToSpiderRule(selectorObj);
	  }

	}

	return data;

}

SpiderSelector.generateSpiderRulesFromSitemap = function(sitemap, options) {
	var $ = options.$

	var customRules = {};
	customRules['site_default_url'] = sitemap.getSiteUrl();
	// customRules['page_verifier'] = sitemap.getPageVerifier();
	// customRules['page_not_found'] = sitemap.getPageNotFound();
	// customRules['price_style'] = sitemap.getPriceStyle();
	
	$.extend(customRules, this.generateSelectorsForPath(sitemap, 'pagination'));

	var product = {};

	// selectors
	$.extend(product, this.generateSelectorsForPath(sitemap, 'category.container'));

	// container
	var containerSelector = sitemap.getSelectorById('category.container');

	if (containerSelector) {
		product['container'] = containerSelector.selector;
	}

	product['info'] = this.generateSelectorsForPath(sitemap, 'category', ['category.container']);
	product['product_page'] = this.generateSelectorsForPath(sitemap, 'product');

	product['replace'] = this.generateRegexRules(sitemap);
	//replace

	customRules['product'] = product;

	return customRules;

}

SpiderSelector.SelectorTypes = [
		{
			type: 'SelectorText',
			title: 'Text'
		},
		{
			type: 'SelectorLink',
			title: 'Link'
		},
		// {
		// 	type: 'SelectorImage',
		// 	title: 'Image'
		// },
		// {
		// 	type: 'SelectorTable',
		// 	title: 'Table'
		// },
		{
			type: 'SelectorElementAttribute',
			title: 'Element attribute'
		},
		{
			type: 'SelectorHTML',
			title: 'HTML'
		},
		{
			type: 'SelectorElement',
			title: 'Element'
		},
		// {
		// 	type: 'SelectorPopupLink',
		// 	title: 'Popup Link'
		// },
		// {
		// 	type: 'SelectorElementScroll',
		// 	title: 'Element scroll down'
		// },
		// {
		// 	type: 'SelectorElementClick',
		// 	title: 'Element click'
		// },
		// {
		// 	type: 'SelectorGroup',
		// 	title: 'Grouped'
		// }
];

SpiderSelector.SelectorList = {
	"category.container": {"label": "Product container", "breadcrumb": ["category page", "container"]},
	"category.source_id": {"label": "Product identifier", "breadcrumb": ["category page", "product identifier"]},
	"category.product": {"label": "Product name", "breadcrumb": ["category page", "product name"]},
	"category.link": {"label": "Product link", "breadcrumb": ["category page", "product link"]},
	"category.price": {"label": "Product discount price", "breadcrumb": ["category page", "discount price"]},
	"category.fullPrice": {"label": "Product full price", "breadcrumb": ["category page", "full price"]},
	"category.availability": {"label": "Product availability", "breadcrumb": ["category page", "product availability"]},
	"category.model": {"label": "Product model", "breadcrumb": ["category page", "product model"]},
	"category.manufacturer": {"label": "Product manufacturer", "breadcrumb": ["category page", "product manufacturer"]},
	"category.reviews": {"label": "Product reviews", "breadcrumb": ["category page", "product reviews"]},
	"category.rating": {"label": "Product rating", "breadcrumb": ["category page", "product rating"]},
	"product.source_id": {"label": "Product identifier", "breadcrumb": ["product page", "product identifier"]},
	"product.product": {"label": "Product name", "breadcrumb": ["product page", "product name"]},
	"product.link": {"label": "Product link", "breadcrumb": ["product page", "product link"]},
	"product.price": {"label": "Product discount price", "breadcrumb": ["product page", "product discount price"]},
	"product.fullPrice": {"label": "Product full price", "breadcrumb": ["product page", "product full price"]},
	"product.availability": {"label": "Product availability", "breadcrumb": ["product page", "product availability"]},
	"product.model": {"label": "Product model", "breadcrumb": ["product page", "product model"]},
	"product.manufacturer": {"label": "Product manufacturer", "breadcrumb": ["product page", "product manufacturer"]},
	"product.reviews": {"label": "Product reviews", "breadcrumb": ["product page", "product reviews"]},
	"product.rating": {"label": "Product rating", "breadcrumb": ["product page", "product rating"]},
	"pagination": {"label": "Pagination", "breadcrumb": ["pagination"]}

}

SpiderSelector.PriceStyles = [
	{id: "ro_RO", label: "ro_RO" },
	{id: "en_US", label: "en_US" },
	{id: "bg_BG", label: "bg_BG" },
	{id: "hu_HU", label: "hu_HU" },
]

module.exports = SpiderSelector