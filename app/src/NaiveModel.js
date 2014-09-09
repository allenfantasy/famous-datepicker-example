define(function(require, exports, module) {
  var EventHandler = require('famous/core/EventHandler');

  function NaiveModel(obj) {
    this.__data = obj || {};
    this.__center = new EventHandler();
    this.__defaults = obj? _clone(obj) : {};
  }

  NaiveModel.prototype.get = function(key) {
    return this.__data[key];
  };

  NaiveModel.prototype.remove = function(key) {
    if (!(this.__data.hasOwnProperty(key))) return;

    var val = this.__data[key];
    delete this.__data[key];
    this.__center.emit('remove', [key, val]);
  };

  NaiveModel.prototype.clear = function() {
    this.__data = {};
  };

  // reset Model to default values
  NaiveModel.prototype.reset = function() {
    var __this = this;

    this.__data = _clone(this.__defaults);
    var keys = Object.keys(this.__defaults).filter(function(p) {
      return __this.__defaults.hasOwnProperty(p);
    });

    keys.forEach(function(p) {
      __this.__center.emit('change:'+p, ['']);
      __this.__center.emit('change', [p, '']);
    });
  };

  NaiveModel.prototype.set = function(key, value) {
    var __this = this;
    if (typeof key === 'object') {
      var obj = key;
      Object.keys(obj).filter(function(p) {
        return obj.hasOwnProperty(p);
      }).forEach(function(p) {
        __this.set(p, obj[p]);
      });
      return;
    }

    if (!(this.__data.hasOwnProperty(key))) {
      this.__center.emit('add', [key, value]);
    }

    var old = this.__data[key];
    if (old !== value) {
      this.__data[key] = value;
      this.__center.emit('change:'+key, [value]);
      this.__center.emit('change', [key, value]);
    }
  };

  NaiveModel.prototype.on = function(eventName, fn, thisObj) {
    var __this = this;
    this.__center.on(eventName, function(data) {
      fn.apply(thisObj || this, [__this].concat(data));
    });
  };

  NaiveModel.prototype.getData = function() {
    var result = {};
    var obj = this.__data;
    Object.keys(obj).forEach(function(key) {
      if (obj.hasOwnProperty(key)) result[key]=obj[key];
    });
    return result;
  };

  NaiveModel.prototype.getKeys = function() {
    return Object.keys(this.__data);
  };

  function _clone(obj) {
    if (obj == null || typeof obj !== 'object') return obj;

    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  module.exports = NaiveModel;
});
