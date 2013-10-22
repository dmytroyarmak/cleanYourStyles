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
    console.log('Analyzing page ' + address + ' ...');
    var page = webpage.create();
    page.open(address, function (status) {
        if (status !== 'success') {
            callback('FAIL to load the address : ' + address);
        } else {
            callback(null, page.evaluate(unusedStylesGrabber.grabStyleSheets));
        }
        page.close();
    });
};

var getIntersectionOfStyleShetts = function(styleSheets) {
    return _.map(_.groupBy(_.flatten(styleSheets, true), _.first), function(rulesSets, styleSheetName) {
        return {
            name: styleSheetName,
            rules: _.intersection.apply(null, _.map(rulesSets, _.last))
        };
    });
};

var printResult = function(styleSheets) {
    console.log('************************************');
    _.each(styleSheets, function(styleSheet) {
        console.log('');
        console.log('========================');
        console.log(styleSheet.name);
        console.log('');
        _.each(styleSheet.rules, function(style) {
            console.log(style);
        });
    });
};

async.map(addresses, precessOnePage, function(err, results) {
    if (err) {
        console.log(err);
    } else {
        console.log('Processing all received data ...');
        printResult(getIntersectionOfStyleShetts(results));
    }
    phantom.exit();
});

