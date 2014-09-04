define(function(require, exports, module) {
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Scrollview = require('famous/views/Scrollview');
  var SequentialLayout = require('famous/views/SequentialLayout');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');

  // TODO: options manager for Datepicker & Picker
  // TODO: UI Interface
  // TODO: refactor events

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
    var Picker = this.constructor.Picker;

    this.options = {};

    this.width = (options.size && options.size.length) ? options.size[0] : 200;
    this.height = (options.size && options.size.length) ? options.size[1] : 300;
    this.scroll = options.scroll ? options.scroll : { direction: 1 };
    this.range = options.range ? options.range : 5;
    if (typeof this.range !== 'number' || this.range % 2 !== 1) this.range = 5; // force to default value when invalid

    this.gap = (this.range - 1) / 2;

    this.options.year = options.year ? options.year : _getDefaultYearRange();

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

    var years = _getYDMItems(this.options.year.start, this.options.year.end, this.gap);
    var months = _getYDMItems(1, 12, this.gap);
    var days = _getYDMItems(1, 31, this.gap);

    this._year = years[this.gap];
    this._month = months[this.gap];
    this._day = days[this.gap];

    this.yearPicker = new Picker(years, this.width/3, this.height, this.range);
    this.monthPicker = new Picker(months, this.width/3, this.height, this.range);
    this.dayPicker = new Picker(days, this.width/3, this.height, this.range);

    //window.datePicker = this;

    var surfaces = [this.yearPicker, this.monthPicker, this.dayPicker].map(function(picker) {
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

    // setup events
    this.yearPicker.onUpdate(function() {
      this._year = this.yearPicker.getValue();

      var numOfDays = _getDays(this.yearPicker.getValue(), this.monthPicker.getValue());
      this.dayPicker.update(_getYDMItems(1, numOfDays, this.gap));
      //window.alert('你选择了: ' + this.getDate());
    }.bind(this));

    this.monthPicker.onUpdate(function() {
      this._month = this.monthPicker.getValue();

      var numOfDays = _getDays(this.yearPicker.getValue(), this.monthPicker.getValue());
      this.dayPicker.update(_getYDMItems(1, numOfDays, this.gap));
      //window.alert('你选择了: ' + this.getDate());
    }.bind(this));

    this.dayPicker.onUpdate(function() {
      this._day = this.dayPicker.getValue();
      //window.alert('你选择了: ' + this.getDate());
    }.bind(this));

    return container;
  }

  Datepicker.prototype.constructor = Datepicker;

  Datepicker.Picker = function Picker(selections, width, height, range) {
    var container = new ContainerSurface({
      size: [width, height],
      properties: {
        overflow: 'hidden'
      }
    });

    var scroll = new Scrollview({ direction: 1, paginated: true, margin: 10000, pageDamp: 1 });

    this.width = width;
    this.height = height;
    this.range = range;
    this.gap = (this.range - 1) / 2;
    this.container = container;
    this.scroll = scroll;
    this._value = selections.filter(function(s) {
      return !!s;
    })[0];

    this.scroll.sequenceFrom(selections.map(function(selection) {
      return _selectionItem(selection, width, height / range, scroll);
    }));
    this.container.add(scroll);

    this.scroll.on('pageChange', this.updateValue.bind(this));

    return this;
  };

  /**
   * register a callback function when updated
   * @method onUpdate
   * @param {Function} callback The callback function
   */
  Datepicker.Picker.prototype.onUpdate = function onUpdate(callback) {
    this._callback = callback;
  };

  Datepicker.Picker.prototype.setValue = function setValue(value) {
    this._value = value;
  };

  Datepicker.Picker.prototype.getValue = function getValue() {
    return this._value;
  };

  Datepicker.Picker.prototype.updateValue = function updateValue() {
    this.setValue(this.scroll.getActiveContent(this.gap));

    // run callback function if needed
    if (this._callback && typeof this._callback === 'function') {
      this._callback();
    }
  };

  Datepicker.Picker.prototype.update = function update(selections) {
    this.scroll.sequenceFrom(selections.map(function(selection) {
      return _selectionItem(selection, this.width, this.height / this.range, this.scroll);
    }, this));
  };

  Datepicker.prototype.getDate = function() {
    return this._year + '年' + this._month + '月' + this._day + '日';
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

  /**
   * Get the number of days in yyyy/mm
   *
   * Get the last day of this month, and extract the `day` part
   *
   * @private
   * @return {Number} the number of days
   *
   */
  function _getDays(year, month) {
    var d = new Date([month<10?'0'+month:month, '01', year].join('/'));
    if (d.getMonth()>10) d.setFullYear(d.getFullYear()+1);
    d.setMonth((d.getMonth()+1)%12); // next month
    d.setDate(0); // back one day
    return parseInt(d.getDate());
  }

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
