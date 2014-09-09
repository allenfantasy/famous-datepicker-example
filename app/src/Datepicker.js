define(function(require, exports, module) {
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Scrollview = require('famous/views/Scrollview');
  var SequentialLayout = require('famous/views/SequentialLayout');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var Picker = require('./Picker');
  var Model = require('./NaiveModel');

  // TODO: options manager for Datepicker & Picker
  // TODO: UI Interface

  Scrollview.prototype.getActiveIndex = function() {
    var direction = this.options.direction;

    var renderables = this._node._.array;
    var offsets = renderables.map(function(r, index, array) {
      return r._matrix[direction === 0 ? 12 : 13];
    });

    var index;
    var minOffset = Infinity;
    for (var i = 0; i < offsets.length; i++) {
      if (Math.abs(offsets[i]) < minOffset) {
        minOffset = Math.abs(offsets[i]);
        index = i;
      }
    }
    return index;
  };

  Scrollview.prototype.getActiveContent = function(offset) {
    var index = this.getActiveIndex();
    return this._node._.array[index + offset].getContent();
  };

  /**
   * @class Datepicker
   * @constructor
   *
   */
  function Datepicker(options) {
    this.options = {};

    this.width = (options.size && options.size.length) ? options.size[0] : 200;
    this.height = (options.size && options.size.length) ? options.size[1] : 300;
    this.scroll = options.scroll ? options.scroll : { direction: 1 };
    this.range = options.range ? options.range : 5;
    if (typeof this.range !== 'number' || this.range % 2 !== 1) this.range = 5; // force to default value when invalid

    this.gap = (this.range - 1) / 2;

    this.options.year = options.year ? options.year : _getDefaultYearRange();

    var data = {};
    data.years = _getYDMItems(this.options.year.start, this.options.year.end, this.gap);
    data.months = _getYDMItems(1, 12, this.gap);
    data.days = _getYDMItems(1, 31, this.gap);

    this._model = new Model({
      year: data.years[this.gap],
      month: data.months[this.gap],
      day: data.days[this.gap]
    });

    this._pickers = {};
    this._model.getKeys().forEach(function(key) {
      this._pickers[key] = new Picker(data[key + 's'], this.width/3, this.height, this.range);
    }, this);

    var container = new ContainerSurface({
      size: [this.width, this.height],
      properties: {
        background: '-webkit-radial-gradient(50%, ' + this.width + 'px ' + (this.height/this.range) + 'px' + ', white 50%, #eee 70%, #ccc 95%)'
      }
    });
    var layout = new SequentialLayout({ direction: 0 });

    var mask = new Surface({
      size: [this.width, this.height/this.range],
      properties: {
        border: '1px solid #ccc'
      }
    });

    var surfaces = Object.keys(this._pickers).map(function(key) {
      return this._pickers[key];
    }, this).map(function(picker) {
      return picker.container;
    });

    layout.sequenceFrom(surfaces);
    container.add(new Modifier({
      size: [this.width, this.height]
    })).add(layout);
    container.add(new Modifier({
      origin: [.5, .5],
      align: [.5, .5]
    })).add(mask);

    this._setupEvent();

    return container;
  }

  Datepicker.prototype.constructor = Datepicker;

  Datepicker.prototype.getDate = function() {
    return this._model.get('year') + '年' + this._model.get('month') + '月' + this._model.get('day') + '日';
  };

  Datepicker.prototype._setupEvent = function _setupEvent() {
    // setup events
    Object.keys(this._pickers).forEach(function(key) {
      var picker = this._pickers[key];
      picker.on('change', function() {
        this._model.set(key, picker.getValue());
        if (key !== 'day') {
          this._pickers.day.update(_getYDMItems(1, this._getDays(), this.gap));
        }
        window.console.log('你选择了: ' + this.getDate());
      }, this);
    }, this);
  };

  /**
   * Get the number of days based on current year & month
   *
   * Get the last day of this month, and extract the `day` part
   *
   * @private
   * @return {Number} the number of days
   *
   */
  Datepicker.prototype._getDays = function _getDays() {
    var year = this._pickers.year.getValue();
    var month = this._pickers.month.getValue();

    var d = new Date([month<10?'0'+month:month, '01', year].join('/'));
    if (d.getMonth()>10) d.setFullYear(d.getFullYear()+1);
    d.setMonth((d.getMonth()+1)%12); // next month
    d.setDate(0); // back one day
    return parseInt(d.getDate());
  };

  function _getDefaultYearRange(range) {
    if (typeof range !== 'number') range = 10;
    range = range || 10;
    var d = parseInt(new Date().getFullYear());
    return {
      start: d - range + 1,
      end: d + range - 1
    };
  }

  // return the array of year/month/day
  function _getYDMItems(start, end, range) {
    if (start > end) return [];
    var array = [];
    for (var i = start; i <= end; i++) array.push(i);
    for (var j = 0; j < range; j++) {
      array.unshift(null);
      array.push(null);
    }
    return array;
  }

  module.exports = Datepicker;
});
