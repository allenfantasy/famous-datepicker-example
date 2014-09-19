define(function(require, exports, module) {
  var Surface = require('famous/core/Surface');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var Scrollview = require('famous/views/Scrollview');
  var Model = require('./NaiveModel');

  function Slot(selections, width, height, range) {
    var container = new ContainerSurface({
      size: [width, height],
      properties: {
        overflow: 'hidden'
      }
    });

    var scroll = new Scrollview({
      direction: 1,
      paginated: true,
      margin: 10000,
      pageStopSpeed: 1,
      pagePeriod: 1000,
      pageDamp: 0.9,
      pageSwitchSpeed: 1
    });

    this.width = width;
    this.height = height;
    this.range = range;
    this.gap = (this.range - 1) / 2;
    this.container = container;
    this.scroll = scroll;
    this._defaultValue = selections.filter(function(s) {
      return !!s;
    })[0];
    this._model = new Model({
      value: this._defaultValue
    });
    this._innerItems = selections.map(function(selection) {
      return _selectionItem(selection, width, height / range, scroll);
    });

    this.scroll.sequenceFrom(this._innerItems);
    this.container.add(scroll);

    this.scroll.on('pageChange', this.updateValue.bind(this));

    return this;
  }

  /**
   * register a callback function when updated
   * @method on
   * @param {String} eventName event name
   * @param {Function} fn The callback function
   * @param {Object} thisObj the object as `this`
   */
  Slot.prototype.on = function on(eventName, fn, thisObj) {
    this._model.on(eventName, fn, thisObj);
  };

  Slot.prototype.setValue = function setValue(value) {
    this._model.set('value', value);
  };

  Slot.prototype.getValue = function getValue() {
    return this._model.get('value');
  };

  Slot.prototype.updateValue = function updateValue() {
    this.setValue(this.scroll.getActiveContent(this.gap));
  };

  Slot.prototype.addItems = function addItems(start, end) {
    if (!start) return;
    end = end || start;
    var days = [];
    var i;
    for (i = start; i <= end; i++) days.push(i);

    days = days.filter(function(day) {
      return !itemExists(day, this);
    }, this);
    var items = days.map(function(day) {
      return _selectionItem(day, this.width, this.height/this.range, this.scroll);
    }, this);

    var index = days[0] + this.gap - 1;
    Array.prototype.splice.apply(this._innerItems, [index, 0].concat(items));
  };

  Slot.prototype.removeItems = function removeItems(start, end) {
    if (!start) return;
    end = end || start;
    var days = [];
    var i;
    for (i = start; i <= end; i++) days.push(i);

    days.forEach(function(day) {
      // remove the first existing item
      var index = this._innerItems.map(function(item) {
        return item.getContent();
      }).indexOf(day);

      if (index > -1) this._innerItems.splice(index, 1);
    }, this);
  };
  Slot.prototype.getItemCount = function getItemCount() {
    return this._innerItems.length - this.gap * 2;
  };

  /**
   * @private
   * @param {String} content
   * @return {Surface} a Surface conveys the content
   *
   */
  function _selectionItem(content, width, height, scroll) {
    var s = new Surface({
      content: content,
      size: [width, height],
      properties: {
        textAlign: 'center',
        lineHeight: height + 'px'
      }
    });
    s.pipe(scroll);
    return s;
  }

  function itemExists(day, thisObj) {
    return thisObj._innerItems.some(function(item) {
      return item.getContent() === day;
    });
  }

  module.exports = Slot;
});
