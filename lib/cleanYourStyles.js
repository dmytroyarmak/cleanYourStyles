var system = require('system'),
    recursivePageScaner = require('./recursivePageScaner');

function getScanSiteOptions (args) {
    var options = {},
        matchMaxDepth, matchMaxPages, i;
    for (i = 3; i < 5; i += 1) {
        if (args[i]) {
            matchMaxDepth = args[i].match(/^--maxDepth=([0-9]+)$/);
            if (matchMaxDepth) {
                options.maxDepth = +matchMaxDepth[1];
            } else {
                matchMaxPages = args[i].match(/^--maxPages=([0-9]+)$/);
                if (matchMaxPages) {
                    options.maxPages = +matchMaxPages[1];
                }
            }
        }
    }

    return options;
}

if (system.args.length === 1) {
    console.log('Usages:');
    console.log('\tcleanYourStyles <command> [<arg>...]');
    console.log('Commands:');
    console.log('\t 1. Scan one or few pages: \n\t\tcleanYourStyles scan URL...');
    console.log('\t 2. Scan full site: \n\t\tcleanYourStyles scanSite URL [--maxDepth=<number>] [--maxPages=<number>]');
    phantom.exit();
}

switch(system.args[1]) {
    case 'scan':
        recursivePageScaner.scan(system.args.slice(2), {maxDepth: 0});
        break;

    case 'scanSite':
        recursivePageScaner.scan(system.args[2], getScanSiteOptions(system.args));
        break;

    default:
        console.log('Error: There is no such command');
        phantom.exit();
}
