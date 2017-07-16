var Selector = require('../../../extension/scripts/Selector')
const utils = require('./../../utils')
const assert = require('chai').assert
const globals = require('../../globals')

describe('HTML Selector', function () {
  let $
let document
let window
  beforeEach(function () {
    $ = globals.$
document = globals.document
window = globals.window

    document.body.innerHTML = utils.getTestHTML()
  })

  it('should extract single html element', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorHTML',
      multiple: false,
      selector: 'div'
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-html-single-html')[0])
    dataDeferred.then(function (data) {
      assert.equal(data.length, 1)
      var expected = [
        {
          a: 'aaa<b>bbb</b>ccc'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should extract multiple html elements', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorHTML',
      multiple: true,
      selector: 'div'
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-html-multiple-html')[0])
    dataDeferred.then(function (data) {
      assert.equal(data.length, 2)
      var expected = [
        {
          a: 'aaa<b>bbb</b>ccc'
        },
        {
          a: 'ddd<b>eee</b>fff'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should extract null when there are no elements', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorHTML',
      multiple: false,
      selector: 'div'
    }, {$, document, window})
    console.log(document.querySelectorAll('#selector-html-single-not-exist'))
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-html-single-not-exist')[0])
    dataDeferred.then(function (data) {
      assert.equal(data.length, 1)
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
      type: 'SelectorHTML',
      multiple: false,
      selector: 'div',
      regexReplace: [{"regex": "wontmatch", "options": "", "replacement": "wontmatch" }]
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-html-single-html')[0])
    dataDeferred.then(function (data) {
      assert.equal(data.length, 1)
      var expected = [
        {
          a: 'aaa<b>bbb</b>ccc'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should replace div tags using regex replace', function (done) {
    var selector = new Selector({
      id: 'a',
      type: 'SelectorHTML',
      multiple: false,
      selector: 'div',
      regexReplace: [{"regex": "<div>|<\/div>|<b>|<\/b>", "options": "gm", "replacement": "" }]
    }, {$, document, window})
    var dataDeferred = selector.getData(document.querySelectorAll('#selector-html-single-html')[0])
    dataDeferred.then(function (data) {
      assert.equal(data.length, 1)
      var expected = [
        {
          a: 'aaabbbccc'
        }
      ]
      assert.deepEqual(data, expected)
      done()
    })
  })

  it('should return only one data column', function () {
    var selector = new Selector({
      id: 'id',
      type: 'SelectorHTML',
      multiple: true,
      selector: 'div'
    }, {$, document, window})

    var columns = selector.getDataColumns()
    assert.deepEqual(columns, ['id'])
  })
})
