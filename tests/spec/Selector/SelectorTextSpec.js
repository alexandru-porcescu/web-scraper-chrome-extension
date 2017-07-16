var Selector = require('../../../extension/scripts/Selector')
const utils = require('./../../utils')
const assert = require('chai').assert
const globals = require('../../globals')

describe('Text Selector', function () {
  let $
let document
let window
  beforeEach(function () {
    $ = globals.$
document = globals.document
window = globals.window
    document.body.innerHTML = utils.getTestHTML()

  })

  it('should extract single text record', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorText',
      multiple: false,
      selector: 'div'
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-single-text')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          a: 'a'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should extract multiple text records', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorText',
      multiple: true,
      selector: 'div'
    }, {$, document, window})

    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-multiple-text')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          a: 'a'
        },
        {
          a: 'b'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should extract null when there are no elements', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorText',
      multiple: false,
      selector: 'div'
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-single-not-exist')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          a: null
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should return the same element when there is no regex replace match', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorText',
      multiple: false,
      selector: 'div',
      regexReplace: [{"regex": "wontmatch", "options": "", "replacement": "wontmatch" }]
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-single-regex')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          a: 'aaaaaaa11113123aaaaa11111'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should extract text using regex', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorText',
      multiple: false,
      selector: 'div',
      regexReplace: [{"regex": "[0-9]+", "options": "gm", "replacement": "" }]
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-single-regex')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          a: 'aaaaaaaaaaaa'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should return only one data column', function () {
    var selector = new Selector({
      id: 'id',
      type: 'SelectorText',
      multiple: true,
      selector: 'div'
    }, {$, document, window})

    var columns = selector.getDataColumns()
    assert.deepEqual(columns, ['id'])
  })

  it('should ignore script tag content', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorText',
      multiple: false,
      selector: 'div'
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-ignore-script')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          a: 'aaa'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should replace br tags with newlines', function (done) {
    var selector = new Selector({
      id: 'p',
      type: 'SelectorText',
      multiple: false,
      selector: 'p'
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-text-newlines')[0])
    dataDeferred.then(function (data) {
      var expected = [
        {
          p: 'aaa\naaa\naaa\naaa\naaa'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

//    it("should extract records with url", function () {
//
//        var selector = new Selector({
//            id: 'a',
//            type: 'SelectorText',
//            multiple: true,
//            selector: "a"
//        });
//
//        var data = selector.getData($("#selector-text-url-multiple-text"));
//        expect(data).toEqual([
//            {
//                a: "a",
//                'a-href': "http://aa/"
//            },
//            {
//                a: "b",
//                'a-href': "http://bb/"
//            }
//        ]);
//    });
})
