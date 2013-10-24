var unusedStylesGrabber = require('./unusedStylesGrabber.js'),
    webpage = require('webpage'),
    async = require('async'),
    _ = require('underscore');

function getIntersectionOfStyleShetts(styleSheets) {
    return _.map(_.groupBy(_.flatten(styleSheets, true), _.first), function(rulesSets, styleSheetName) {
        return {
            name: styleSheetName,
            rules: _.intersection.apply(null, _.map(rulesSets, _.last))
        };
    });
}

function printResult(styleSheets, level, processedPagesCount) {
    console.log('Processing all collected data ...');
    console.log('Max depth level: ', level);
    console.log('Pages processed: ', processedPagesCount);
    console.log('List of unused styles: ');
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
}

function precessOnePage(address, callback) {
    console.log('Analyzing page ' + address + ' ...');
    var page = webpage.create();
    page.open(address, function (status) {
        if (status !== 'success') {
            console.log('FAIL to load the address : ' + address);
            callback();
        } else {
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
}

function collectNewAddreses(results, processedPages, pagesTodoCount) {
    var newAddresses = [];

    _.each(results, function(result){
        _.each(result.links, function(link) {
            if (newAddresses.length < pagesTodoCount && !_.contains(newAddresses, link) && !_.contains(processedPages, link)) {
                newAddresses.push(link);
            }
        });
    });

    return _.first(newAddresses, pagesTodoCount);
}

function scanPages(addresses, maxDepthLevel, maxPages) {
    var processedPagesCount = 0,
        processedPages = [],
        allResults = [],
        depthLevel = 0;

    function asyncProcessPages(addresses) {
        processedPages = processedPages.concat(addresses);

        async.mapLimit(addresses, 25, precessOnePage, function(err, results) {
            results = _.compact(results);
            processedPagesCount += results.length;
            if (err) {
                console.log(err);
                phantom.exit();
            } else {
                allResults = allResults.concat(_.pluck(results, 'styleSheets'));
                depthLevel += 1;
                if (results.length && depthLevel < maxDepthLevel && processedPagesCount < maxPages) {
                    asyncProcessPages(collectNewAddreses(results, processedPages, maxPages - processedPagesCount));
                } else {
                    printResult(getIntersectionOfStyleShetts(allResults), depthLevel, processedPagesCount);
                    phantom.exit();
                }
            }
        });
    }

    asyncProcessPages(addresses);
}

exports.scan = function(addresses, options) {
    options = options || {};

    var maxDepthLevel = options.maxDepth == null ? 5 : options.maxDepth,
        maxPages = options.maxPages == null ? 100: options.maxPages;

    if (!_.isArray(addresses)) {
        addresses = [addresses];
    }

    scanPages(addresses, maxDepthLevel, maxPages);
};
