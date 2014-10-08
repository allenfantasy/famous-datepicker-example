define(function(require, exports, module) {
  'use strict';
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var View = require('famous/core/View');
  var Transform = require('famous/core/Transform');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var Datepicker = require('famous-datepicker/Datepicker');

  var BAR_HEIGHT = 44;

  function DatepickerView() {
    View.apply(this, arguments);

    var datePickerHeight = window.innerHeight/2 - BAR_HEIGHT;

    this.container = new ContainerSurface();

    this.datePicker = new Datepicker({
      size: [window.innerWidth, datePickerHeight],
      scroll: { direction: 1 },
      range: 3,
      fontSize: 20
    });

    window.datePicker = this.datePicker;

    var bar = _createBar.call(this);

    this.container.add(new Modifier({
      origin: [0.5, 1],
      align: [0.5, 1]
    })).add(this.datePicker);
    this.container.add(new Modifier({
      origin: [0.5, 1],
      align: [0.5, 1],
      transform: Transform.translate(0, -datePickerHeight, 0)
    })).add(bar);

    this.add(this.container);

    return this;
  }
  DatepickerView.prototype = Object.create(View.prototype);
  DatepickerView.prototype.constructor = DatepickerView;

  DatepickerView.prototype.on = function on(eventName, fn, thisObj) {
    this._eventOutput.on(eventName, fn);
  };

  DatepickerView.prototype.emit = function emit(eventName, event) {
    this._eventOutput.emit(eventName, event);
  };

  function _createBar() {
    var container = new ContainerSurface({
      size: [window.innerWidth, BAR_HEIGHT],
      classes: ['dp-bar']
    });
    this.cancelButton = new Surface({
      content: 'Cancel',
      size: [60, 30],
      properties: {
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bolder',
        lineHeight: '30px',
        backgroundColor: 'black',
        color: 'white',
        borderRadius: '2px'
      }
    });
    this.confirmButton = new Surface({
      content: 'Done',
      size: [45, 30],
      properties: {
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bolder',
        lineHeight: '30px',
        backgroundColor: '#375481',
        color: 'white',
        borderRadius: '2px'
      }
    });
    container.add(new Modifier({
      origin: [0, 0.5],
      align: [0, 0.5],
      transform: Transform.translate(10, 0, 0)
    })).add(this.cancelButton);
    container.add(new Modifier({
      origin: [1, 0.5],
      align: [1, 0.5],
      transform: Transform.translate(-10, 0, 0)
    })).add(this.confirmButton);

    this.cancelButton.on('click', function() {
      this.emit('cancel');
    }.bind(this));
    this.confirmButton.on('click', function() {
      this.emit('confirm', this.datePicker.getDate());
    }.bind(this));

    return container;
  }

  module.exports = DatepickerView;
});
