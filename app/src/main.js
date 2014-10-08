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

  var color = '#627699';

  var appView = new AppView(color);
  var datepickerView = new DatepickerView();
  var toggler = require('views/togglerView');

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

  // toggler
  mainContext.add(new Modifier({
    origin: [0.5, 0],
    align: [0.5, 0],
    transform: function() {
      return Transform.translate(-state.get()*window.innerWidth, 10, 0);
    }
  })).add(toggler);

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

  toggler.submit.on('click', function() {
    var startYear = parseInt(toggler.getStartYear());
    var endYear = parseInt(toggler.getEndYear());
    datepickerView.datePicker.setYears(startYear, endYear);
  });

});
