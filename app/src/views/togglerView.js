define(function(require, exports, module) {
  'use strict';
  var Surface = require('famous/core/Surface');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var View = require('famous/core/View');
  var GridLayout = require('famous/views/GridLayout');
  var InputSurface = require('famous/surfaces/InputSurface');

  var toggleColor = '#41bb3a';

  var toggler = new View();
  var startYear = new InputSurface({
    size: [100, 30],
    placeholder: '起始年份',
    properties: {
      color: toggleColor,
      borderBottom: '1px solid ' + toggleColor
    }
  });
  var endYear = new InputSurface({
    size: [100, 30],
    placeholder: '结束年份',
    properties: {
      color: toggleColor,
      borderBottom: '1px solid ' + toggleColor
    }
  });

  toggler.inputs = new GridLayout({
    dimensions: [2,1]
  });
  toggler.inputs.sequenceFrom([startYear, endYear]);

  toggler.submit = new Surface({
    content: '设置年份',
    size: [100, 30],
    properties: {
      textAlign: 'center',
      lineHeight: '30px',
      backgroundColor: toggleColor,
      color: 'white',
      borderRadius: '4px'
    }
  });

  var node = toggler.add(new Modifier({
    origin: [.5, 0],
    align: [.5, 0]
  }));
  node.add(toggler.inputs);
  node.add(new Modifier({
    transform: Transform.translate(0, 50, 0)
  })).add(toggler.submit);

  toggler.getStartYear = function() {
    return startYear.getValue();
  };
  toggler.getEndYear = function() {
    return endYear.getValue();
  };

  module.exports = toggler;
});
