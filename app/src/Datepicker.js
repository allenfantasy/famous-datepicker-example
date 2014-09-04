define(function(require, exports, module) {
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Scrollview = require('famous/views/Scrollview');
  var SequentialLayout = require('famous/views/SequentialLayout');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');

  Scrollview.prototype.getActiveIndex = function() {
    var direction = this.options.direction;

    var renderables = this._node._.array;
    //var parent = renderables[0]._currTarget.parentNode;
    //var temp = parent.style['-webkit-transform'].split(',');
    /*var parentOffset = parseInt(temp[temp.length - (direction === 0 ? 4 : 3)].trim());
    if (parentOffset !== 0) {
      parentOffset = (Math.floor(Math.abs(parentOffset) / 30) + 1) * -30;
    }*/

    var offsets = renderables.map(function(r) {
      //return r._matrix[direction === 0 ? 12 : 13] + (parentOffset ? -30: 0);
      //return r._matrix[direction === 0 ? 12 : 13] + parentOffset;
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

  Scrollview.prototype.getActiveContent = function() {
    var index = this.getActiveIndex();
    return this._node._.array[index + 2].getContent();
  };

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

    var scroll = new Scrollview({ direction: 1, paginated: true });

    scroll.sequenceFrom(selections.map(function(selection) {
      // TODO: itemHeight
      return _selectionItem(selection, width, 30, scroll);
    }));
    container.add(scroll);

    // TODO: update Day for Year & Month
    // TODO: sometimes the index is not correct
    scroll.on('pageChange', function() {
      window.console.log('activeContent: ' + scroll.getActiveContent());
      window.console.log('===========');
    });

    container.scroll = scroll;

    return container;
  }

  /**
   * @class Datepicker
   * @constructor
   *
   */
  function Datepicker(options) {
    this.width = (options.size && options.size.length) ? options.size[0] : 200;
    this.height = (options.size && options.size.length) ? options.size[1] : 300;
    this.scroll = options.scroll ? options.scroll : { direction: 1 };

    var container = new ContainerSurface({
      size: [this.width, this.height]
    });
    var layout = new SequentialLayout({ direction: 0 });

    var years = [null, null, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, null, null];
    var months = [null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, null, null];
    var days = [null, null];

    for (var i = 0; i < 31; i++) {
      days.push(i+1);
    }
    days.push(null);
    days.push(null);

    var yearPicker = new Picker(years, this.width/3, this.height);
    var monthPicker = new Picker(months, this.width/3, this.height);
    var dayPicker = new Picker(days, this.width/3, this.height);

    window.yearPicker = yearPicker;
    window.monthPicker = monthPicker;
    window.dayPicker = dayPicker;

    layout.sequenceFrom([yearPicker, monthPicker, dayPicker]);
    container.add(new Modifier({
      size: [this.width, this.height]
    })).add(layout);

    return container;
  }

  Datepicker.prototype.constructor = Datepicker;

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
        textAlign: 'center',
        lineHeight: height + 'px'
      }
    });
    s.pipe(scroll);
    return s;
  }

  module.exports = Datepicker;
});
