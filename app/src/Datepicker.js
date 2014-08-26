define(function(require, exports, module) {
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Scrollview = require('famous/views/Scrollview');
  var View = require('famous/core/View');
  var SequentialLayout = require('famous/views/SequentialLayout');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');

  /**
   * @class Datepicker
   * @constructor
   *
   */
  function Datepicker(options) {
    this.width = options.size && options.size.length ? options.size[0] : 200;
    this.height = options.size && options.size.length ? options.size[1] : 300;
    this.scroll = options.scroll ? options.scroll : { direction: 1 };

    var container = new ContainerSurface({
      size: [this.width, this.height]
    });
    var layout = new SequentialLayout({ direction: 0 });

    var yearPicker = new Scrollview(this.scroll);
    var monthPicker = new Scrollview(this.scroll);
    var dayPicker = new Scrollview(this.scroll);

    var years = [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999];
    var months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];
    var days = [];

    for (var i = 0; i < 31; i++) {
      days.push(i+1);
    }

    var yearPicker = new Picker(years, this.width/3, this.height);
    var monthPicker = new Picker(months, this.width/3, this.height);
    var dayPicker = new Picker(days, this.width/3, this.height);

    layout.sequenceFrom([yearPicker, monthPicker, dayPicker]);
    container.add(new Modifier({
      size: [this.width, this.height]
    })).add(layout);

    return container;
  }

  Datepicker.prototype.constructor = Datepicker;

  /**
   * @class Picker
   * @constructor
   * @private
   *
   */
  function Picker(selections, width, height) {
    var container = new ContainerSurface({
      size: [width, height],
      properties: {
        overflow: 'hidden'
      }
    });

    var scroll = new Scrollview({ direction: 1 });  

    scroll.sequenceFrom(selections.map(function(selection) {
      // TODO: itemHeight
      return _selectionItem(selection, width, 20, scroll);
    }));
    container.add(scroll);

    return container;
  }
  /**
   * @private
   *
   * @param {String} content
   */
  function _selectionItem(content, width, height, scroll) {
    var s = new Surface({
      content: content,
      size: [width, height],
      properties: {
        textAlign: 'center'
      }
    });
    s.pipe(scroll);
    return s;
  }

  module.exports = Datepicker;
});
