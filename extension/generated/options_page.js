(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.optionsPage = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Config = require('../scripts/Config');

$(function () {
  console.log('extension/options_page/options_page.js:4:14:\'opening config page\'', 'opening config page');
  // popups for Storage setting input fields
  $('#sitemapDb').popover({
    title: 'Database for sitemap storage',
    html: true,
    content: 'CouchDB database url<br /> http://example.com/scraper-sitemaps/',
    placement: 'bottom'
  }).blur(function () {
    $(this).popover('hide');
  });

  $('#dataDb').popover({
    title: 'Database for scraped data',
    html: true,
    content: 'CouchDB database url. For each sitemap a new DB will be created.<br />http://example.com/',
    placement: 'bottom'
  }).blur(function () {
    $(this).popover('hide');
  });

  // switch between configuration types
  $('select[name=storageType]').change(function () {
    var type = $(this).val();

    if (type === 'couchdb') {
      $('.form-group.couchdb').show();
    } else {
      $('.form-group.couchdb').hide();
    }
  });

  // Extension configuration
  var config = new Config();

  // load previously synced data
  config.loadConfiguration(function () {
    $('#storageType').val(config.storageType);
    $('#sitemapDb').val(config.sitemapDb);
    $('#dataDb').val(config.dataDb);

    $('select[name=storageType]').change();
  });

  // Sync storage settings
  $('form#storage_configuration').submit(function () {
    var sitemapDb = $('#sitemapDb').val();
    var dataDb = $('#dataDb').val();
    var storageType = $('#storageType').val();

    var newConfig;

    if (storageType === 'local') {
      newConfig = {
        storageType: storageType,
        sitemapDb: ' ',
        dataDb: ' '
      };
    } else {
      newConfig = {
        storageType: storageType,
        sitemapDb: sitemapDb,
        dataDb: dataDb
      };
    }

    config.updateConfiguration(newConfig);
    return false;
  });
});

},{"../scripts/Config":2}],2:[function(require,module,exports){
var Config = function () {};

Config.prototype = {

  sitemapDb: '<use loadConfiguration()>',
  dataDb: '<use loadConfiguration()>',

  defaults: {
    storageType: 'local',
    // this is where sitemap documents are stored
    sitemapDb: 'scraper-sitemaps',
    // this is where scraped data is stored.
    // empty for local storage
    dataDb: ''
  },

  /**
   * Loads configuration from chrome extension sync storage
   */
  loadConfiguration: function (callback) {
    chrome.storage.sync.get(['sitemapDb', 'dataDb', 'storageType'], function (items) {
      this.storageType = items.storageType || this.defaults.storageType;
      if (this.storageType === 'local') {
        this.sitemapDb = this.defaults.sitemapDb;
        this.dataDb = this.defaults.dataDb;
      } else {
        this.sitemapDb = items.sitemapDb || this.defaults.sitemapDb;
        this.dataDb = items.dataDb || this.defaults.dataDb;
      }

      callback();
    }.bind(this));
  },

  /**
   * Saves configuration to chrome extension sync storage
   * @param {type} items
   * @param {type} callback
   * @returns {undefined}
   */
  updateConfiguration: function (items, callback) {
    chrome.storage.sync.set(items, callback);
  }
};

module.exports = Config;

},{}]},{},[1])(1)
});