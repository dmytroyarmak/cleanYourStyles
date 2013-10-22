var page = require('webpage').create(),
    system = require('system'),
    _ = require('underscore'),
    unusedStylesGrabber = require('./unusedStylesGrabber.js'),
    address;

if (system.args.length === 1) {
    console.log('Usage: cleanYourStyles <URL ...>');
    phantom.exit();
}

address = system.args[1];

page.open(address, function (status) {
    var styleSheets;
    if (status !== 'success') {
        console.log('FAIL to load the address : ' + address);
    } else {
      styleSheets = page.evaluate(unusedStylesGrabber.grabStyleSheets);
      _.each(styleSheets, function(styles, styleSheetName) {
          console.log('');
          console.log('========================');
          console.log(styleSheetName);
          console.log('');
          _.each(styles, function(style) {
              console.log(style);
          });
      });
    }
    phantom.exit();
});
