/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var Datepicker = require('./Datepicker');

    var mainContext = Engine.createContext();

    var datePicker = new Datepicker({
      size: [window.innerWidth, window.innerHeight],
      scroll: { direction: 1 },
      fontSize: 20
    });

    mainContext.add(new Modifier({
      origin: [0.5, 0.5],
      align: [0.5, 0.5]
    })).add(datePicker);
});
