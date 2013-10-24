cleanYourStyles
===============

Command line utility to determine unused CSS styles. 

## How to install

* install node.js with npm
* install `cleanyourstyles` npm module (localy or global)
```
npm install -g cleanyourstyles
```

## How to use

### Scan one or few pages
```
cleanYourStyles scan URL...
```

Example:
```
cleanYourStyles scan http://uawebchallenge.com http://uawebchallenge.com/partners
```

### Scan full site
```
cleanYourStyles scanSite URL [--maxDepth=<number>] [--maxPages=<number>]
```

Example:
```
cleanYourStyles scanSite http://uawebchallenge.com
cleanYourStyles scanSite http://uawebchallenge.com --maxDepth=5 --maxPages=200
```

### Show help
To show help write in console `cleanYourStyles`

### Local installation
If you install package locally (`npm install cleanyourstyles`) instead of using global bin `cleanYourStyles` you should use local version in `node_modules` folder:
```
node_modules/cleanyourstyles/bin/cleanYourStyles scanSite http://uawebchallenge.com
```
