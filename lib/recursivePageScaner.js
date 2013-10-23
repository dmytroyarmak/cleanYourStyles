var unusedStylesGrabber = require('./unusedStylesGrabber.js'),
    webpage = require('webpage'),
    async = require('async'),
    _ = require('underscore');

exports.scan = function(addresses, options) {
    options = options || {};
    var maxLevel = options.maxDepth == null ? 5 : options.maxDepth;
    var maxPages = options.maxPages == null ? 100: options.maxPages;

    if (!_.isArray(addresses)) {
        addresses = [addresses];
    }

    var precessOnePage = function(address, callback) {
        console.log('Analyzing page ' + address + ' ...');
        var page = webpage.create();
        page.open(address, function (status) {
            if (status !== 'success') {
                console.log('FAIL to load the address : ' + address);
                callback(null, {
                    styleSheets: [],
                    links: []
                });
            } else {
                processedPagesCount += 1;
                page.onConsoleMessage = function (msg) {
                    console.log(msg);
                };
                callback(null, {
                    styleSheets: page.evaluate(unusedStylesGrabber.grabStyleSheets),
                    links: page.evaluate(unusedStylesGrabber.getAllLinks)
                });
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
        _.each(styleSheets, function(styleSheet) {
            if (styleSheet.rules.length) {
                console.log('');
                console.log('========================');
                console.log(styleSheet.name);
                console.log('');
                _.each(styleSheet.rules, function(style) {
                    console.log(style);
                });
            }
        });
    };

    var allResults = [];
    var level = 0;
    var processedPagesCount = 0;
    var processedPages = [];

    var asyncProcessPages = function asyncProcessPages(addresses) {
        processedPages = processedPages.concat(addresses);
        async.mapLimit(addresses, 25, precessOnePage, function(err, results) {
            var newAddresses = [],
                pagesTodoCount = maxPages - processedPagesCount;
            if (err) {
                console.log(err);
                phantom.exit();
            } else {
                allResults = allResults.concat(_.pluck(results, 'styleSheets'));
                level += 1;
                if (results.length && level < maxLevel && processedPagesCount < maxPages) {
                    _.each(results, function(result){
                        _.each(result.links, function(link) {
                            if (newAddresses.length < pagesTodoCount && !_.contains(newAddresses, link) && !_.contains(processedPages, link)) {
                                newAddresses.push(link);
                            }
                        });
                    });

                    asyncProcessPages(_.first(newAddresses, pagesTodoCount));
                } else {
                    console.log('Processing all collected data ...');
                    console.log('Max depth level: ', level);
                    console.log('Pages processed: ', processedPagesCount);
                    console.log('List of unused styles: ');
                    printResult(getIntersectionOfStyleShetts(allResults));
                    phantom.exit();
                }
            }
        });
    };

    asyncProcessPages(addresses);
};
