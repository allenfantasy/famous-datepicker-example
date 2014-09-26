/* globals define */
define(function(require, exports, module) {
  'use strict';
  // import dependencies
  var Engine = require('famous/core/Engine');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var Transitionable = require('famous/transitions/Transitionable');
  var AppView = require('views/AppView');
  var DatepickerView = require('views/DatepickerView');

  var mainContext = Engine.createContext();

  var state = new Transitionable(0);

  var appView = new AppView();
  var datepickerView = new DatepickerView();

  // datepicker mask
  mainContext.add(new Modifier({
    transform: function() {
      return Transform.translate((1 - state.get())*window.innerWidth, 0, 0);
    }
  })).add(datepickerView);

  // appView
  mainContext.add(new Modifier({
    origin: [0.5, 0.5],
    align: [0.5, 0.5],
    transform: function() {
      return Transform.translate(-state.get()*window.innerWidth, 0, 0);
    }
  })).add(appView);

  // events
  appView.input.on('click', function() {
    state.set(1, { duration: 1000, curve: 'easeIn' });
  });

  datepickerView.on('confirm', function(date) {
    // set date
    state.set(0, { duration: 1000, curve: 'easeOut' });
    appView.input.setContent(date);
  });

  datepickerView.on('cancel', function() {
    state.set(0, { duration: 1000, curve: 'easeOut' });
  });

});
