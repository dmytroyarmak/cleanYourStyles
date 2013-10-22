exports.grabStyleSheets = function () {
    function each(array, func) {
        Array.prototype.forEach.call(array, func);
    }

    var styleSheets = Object.create(null);

    each(document.styleSheets, function(styleSheet){
        var styleSheetName = styleSheet.href || document.location.href + '[Inline StyleSheet]',
            unusedStyles = [];

        each(styleSheet.rules, function recusriveCheckStyleUsing(rule) {
            var findedElements;
            if (rule.type === 1) {
                try {
                    findedElements = document.querySelector(rule.selectorText);
                } catch(e) {
                    unusedStyles.push('Invalid Selector: ' + rule.selectorText);
                    return;
                }
                if (!findedElements) {
                    unusedStyles.push(rule.selectorText);
                }
            } else if (rule.type === 4) { // Current rule is Media Query
                each(rule.cssRules, recusriveCheckStyleUsing);
            }
        });

        if (unusedStyles.length) {
            styleSheets[styleSheetName] = unusedStyles;
        }
    });

    return styleSheets;
};
