define(function(require, exports, module) {
  'use strict';
  var Surface = require('famous/core/Surface');
  var SequentialLayout = require('famous/views/SequentialLayout');
  function AppView() {
    var color = '#627699';
    var layout = new SequentialLayout({ direction: 1 });
    var inputLayout = new SequentialLayout({ direction: 0 });

    var label = new Surface({
      content: '请选择日期: ',
      size: [100, 50],
      properties: {
        textAlign: 'center',
        lineHeight: '50px',
        fontSize: '16px',
        color: color
      }
    });
    layout.input = new Surface({
      content: '2005-01-01',
      size: [window.innerWidth - 120, 50],
      properties: {
        textAlign: 'center',
        lineHeight: '50px',
        fontSize: '20px',
        borderBottom: '1px solid ' + color,
        color: color
      }
    });
    inputLayout.sequenceFrom([label, layout.input]);
    var gap = new Surface({
      size: [window.innerWidth - 20, 10]
    });
    layout.button = new Surface({
      content: '确定',
      size: [window.innerWidth - 20, 50],
      properties: {
        textAlign: 'center',
        lineHeight: '50px',
        backgroundColor: color,
        color: 'white',
        borderRadius: '4px'
      }
    });

    layout.sequenceFrom([inputLayout, gap, layout.button]);
    return layout;
  }

  module.exports = AppView;
});
