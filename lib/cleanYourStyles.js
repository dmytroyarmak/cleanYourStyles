var page = require('webpage').create(),
    system = require('system'),
    t, address;

if (system.args.length === 1) {
    console.log('Usage: cleanYourStyles <some URL>');
    phantom.exit();
}

address = system.args[1];

page.onConsoleMessage = function (msg) {
    console.log(msg);
};

page.open(address, function (status) {
    if (status !== 'success') {
        console.log('FAIL to load the address');
    } else {
      page.evaluate(function () {
        var each = Array.prototype.forEach;
        each.call(document.styleSheets, function(styleSheet){
            var recusriveCheckStyleUsing = function recusriveCheckStyleUsing(rule) {
                var findedElements;
                if (rule.type === 1) {
                    try {
                        findedElements = document.querySelector(rule.selectorText);
                    } catch(e) {
                        console.log('Invalid Selector: ' + rule.selectorText);
                        return;
                    }
                    if (!findedElements) {
                        console.log(rule.selectorText);
                    }
                } else if (rule.type === 4) { // Current rule is Media Query
                    each.call(rule.cssRules, recusriveCheckStyleUsing);
                }
            };

            console.log('=====================');
            console.log(styleSheet.href || 'Inline StyleSheet');
            each.call(styleSheet.rules, recusriveCheckStyleUsing);
        });
      });
    }
    phantom.exit();
});
