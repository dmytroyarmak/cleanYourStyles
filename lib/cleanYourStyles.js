var webpage = require('webpage'),
    system = require('system'),
    _ = require('underscore'),
    async = require('async'),
    unusedStylesGrabber = require('./unusedStylesGrabber.js'),
    addresses;

if (system.args.length === 1) {
    console.log('Usage: cleanYourStyles <URL ...>');
    phantom.exit();
}

addresses = system.args.slice(1);

var precessOnePage = function(address, callback) {
    var page = webpage.create();
    page.open(address, function (status) {
        if (status !== 'success') {
            callback('FAIL to load the address : ' + address);
        } else {
            callback(null, page.evaluate(unusedStylesGrabber.grabStyleSheets));
        }
    });
};

var printResult = function(styleSheets) {
    console.log('************************************');
    _.each(styleSheets, function(styles, styleSheetName) {
        console.log('');
        console.log('========================');
        console.log(styleSheetName);
        console.log('');
        _.each(styles, function(style) {
            console.log(style);
        });
    });
};

async.map(addresses, precessOnePage, function(err, results) {
    if (err) {
        console.log(err);
    } else {
        _.each(results, printResult);
    }
    phantom.exit();
});

