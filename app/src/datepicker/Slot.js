define(function(require, exports, module) {
  var Surface = require('famous/core/Surface');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var Timer = require('famous/utilities/Timer');
  var Model = require('./helpers/NaiveModel');
  var Scrollview = require('./helpers/MyScrollview');

  function Slot(selections, width, height, range) {
    var container = new ContainerSurface({
      size: [width, height],
      properties: {
        overflow: 'hidden'
      }
    });

    this.width = width;
    this.height = height;
    this.range = range;
    this.itemHeight = this.height / this.range;
    this.gap = (this.range - 1) / 2;
    this.container = container;
    this.scroll = new Scrollview({
      direction: 1,
      paginated: true,
      margin: this.itemHeight,
      pageStopSpeed: 1,
      //pagePeriod: 1000,
      pageDamp: 1,
      pageSwitchSpeed: 0.1,
      friction: 0.0005,
      drag: 0.00005
    });
    this._defaultValue = selections.filter(function(s) {
      return !!s;
    })[0];
    this._model = new Model({
      value: this._defaultValue
    });
    this._innerItems = selections.map(function(selection) {
      return _selectionItem(selection, width, this.itemHeight, this.scroll);
    }, this);

    this.scroll.sequenceFrom(this._innerItems);
    this.container.add(this.scroll);

    this.scroll.on('pageChange', function() {
      Timer.after(function() {
        this.updateValue();
      }.bind(this), 30);
    }.bind(this));

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
    this.setValue(this.scroll.getActiveContent(this.gap));
    //console.log('get value: ' + this._model.get('value'));
    return this._model.get('value');
  };

  Slot.prototype.updateValue = Slot.prototype.getValue; // alias

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
