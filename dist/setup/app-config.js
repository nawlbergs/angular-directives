//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//

//
// CONFIG
//
var appConfig = {

  //
  // METHODS
  //
  // send error
  get:function(path, makePlural) {
    if (!window.config) return null;
    if (!path) return window.config; // return whole config if no path
    var value = appConfig.getPathValue(window.config, path);
    if (makePlural) {
      var pluralValue = appConfig.getPathValue(window.config, path + '_plural');
      if(pluralValue) return pluralValue;
      return appConfig.makePlural(value);
    }
    return value;
  },


  //
  // UTIL
  //

  // checks if enabled flag is true on an object
  enabled:function(path){
    return appConfig.get(path+'.enabled') === true
  },

  makePlural:function(value){
    if(!value) return value;
    if(!_.isString(value)) return value;
    var lastChar = value.charAt(value.length - 1).toLowerCase();
    var lastTwoChar = value.slice(value.length - 2).toLowerCase();
    // special cases...
    if (lastChar === 'y')     return value.slice(0, value.length - 1) + 'ies';
    if (lastTwoChar === 'ch') return value + 'es';
    return value + 's';
  },
  getPathValue:function(object, path) {
    var parts = (''+path).split('.');
    if (parts.length === 1) return object[parts[0]];
    var child = object[parts.shift()];
    if (!child) return child;
    return appConfig.getPathValue(child, parts.join('.'));
  }
}