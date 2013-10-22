exports.grabStyleSheets = function () {
    function each(array, func) {
        Array.prototype.forEach.call(array, func);
    }

    function cleanSelector(selector) {
        var cleanedSelector = selector
            .replace(/:?:(after|before|selection)/g, '')
            .replace(/:(link|visited|hover|active|focus|first-letter|first-line)/, '');
        return cleanedSelector || '*';
    }

    var styleSheets = [];

    each(document.styleSheets, function(styleSheet){
        var styleSheetName = styleSheet.href || document.location.href + '[Inline StyleSheet]',
            unusedStyles = [];

        each(styleSheet.rules, function recusriveCheckStyleUsing(rule) {
            var findedElements;
            if (rule.type === 1) {
                try {
                    findedElements = document.querySelector(cleanSelector(rule.selectorText));
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
            styleSheets.push([styleSheetName, unusedStyles]);
        }
    });

    return styleSheets;
};

exports.getAllLinks = function() {
    var links = document.links,
        currentHost = document.location.host,
        result = [],
        link, len, i;

    for(i = 0, len = links.length; i < len; i++) {
        link = links.item(i);
        if (link.host === currentHost) {
            result.push(link.href.replace(/#.*$/, ''));
        }
    }

    return result;
};
