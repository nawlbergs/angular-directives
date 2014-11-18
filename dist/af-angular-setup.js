if (typeof console === "undefined") { var console = { log : function(){} }; }
;

//
//  THIS FILE CONTAINS ALL THE INFORMATION
//  NEEDED TO PROVIDE THE CLIENT WITH INFORMATION ABOUT ITS ENVIRONMENT
//
window.appEnv = {

  cache:null,

  // DEVELOPMENT OVERRIDES
  // index essentially provides node with the database
  dev:{
    localhost:{
      tenant:'actifi',
      index:'alpha2'
    },
    alpha:{
      tenant:'waddell',
      index:'alpha'
    },
    alpha2:{
      tenant:'td',
      index:'alpha2'
    }
  },


  // init
  init:function(){
    appEnv.cache = {}
    // subDomain
    appEnv.cache.subDomain = (window.location.host).split('.').shift().toLowerCase()
    // clean subDomain (with no -dev on it)
    appEnv.cache.subDomainClean = appEnv.cache.subDomain.split('-').shift()
    // isLocal?
    appEnv.cache.isLocal = false;
    if(appEnv.cache.subDomainClean === 'localhost')           appEnv.cache.isLocal = true;
    if(appEnv.cache.subDomainClean === 'dev')                 appEnv.cache.isLocal = true;
    if(appEnv.cache.subDomainClean.indexOf('192.168.') === 0) appEnv.cache.isLocal = true;
    // environment
    appEnv.cache.env = 'prod';
    if(appEnv.cache.isLocal)                            appEnv.cache.env = 'dev';
    if(appEnv.cache.subDomain.indexOf('alpha') === 0)   appEnv.cache.env = 'dev';
    if(appEnv.cache.subDomain.indexOf('-dev') >= 0)     appEnv.cache.env = 'dev';

    // load tenant
    if(appEnv.cache.isLocal)                        appEnv.cache.tenant = appEnv.dev.localhost.tenant;
    if(appEnv.cache.subDomainClean == 'alpha')      appEnv.cache.tenant = appEnv.dev.alpha.tenant;
    if(appEnv.cache.subDomainClean == 'alpha2')     appEnv.cache.tenant = appEnv.dev.alpha2.tenant;
    if(appEnv.cache.subDomainClean == 'tdai')       appEnv.cache.tenant = 'td';     // special case
    if(appEnv.cache.subDomainClean == 'apps')       appEnv.cache.tenant = 'actifi'; // special case
    if(!appEnv.cache.tenant)  appEnv.cache.tenant = appEnv.cache.subDomainClean;    // defaults to subDomain

    // load tenant index (db uid)
    if(appEnv.isLocal())                            appEnv.cache.index = appEnv.dev.localhost.index;
    if(appEnv.cache.subDomainClean == 'alpha')      appEnv.cache.index = appEnv.dev.alpha.index;
    if(appEnv.cache.subDomainClean == 'alpha2')     appEnv.cache.index = appEnv.dev.alpha2.index;
    if(appEnv.cache.subDomainClean == 'tdai')       appEnv.cache.index = 'td'; // special case
    if(appEnv.cache.subDomainClean == 'waddell')    appEnv.cache.index = 'wr'; // special case
    if(!appEnv.cache.tenant)  appEnv.cache.index =  appEnv.cache.tenant; // defaults to tenant

    // set app... mainly for logging/sentry tagging etc...
    appEnv.cache.app = ''
    var parts = window.location.pathname.split('/');
    if (parts.length >= 2) appEnv.cache.app = parts[1].toLowerCase();

    if(typeof console !== 'undefined') console.log(appEnv.cache.env.toUpperCase()+' Env Loaded', appEnv.cache)
  },


  //
  // GETTERS
  //
  isProd : function(){
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.env !== 'dev';
  },
  isDev : function(){
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.env === 'dev';
  },
  isLocal : function(){
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.isLocal;
  },
  subDomain : function(){
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.subDomain;
  },
  subDomainClean:function(){
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.subDomainClean; // returns domain with -dev stripped off
  },
  env : function(){
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.env;
  },
  tenant : function() {
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.tenant;
  },
  index : function() {
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.index;
  },
  app : function() {
    if(!appEnv.cache) appEnv.init()
    return appEnv.cache.app;
  }
}
;
//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//



//
// SENTRY
//
var afCatch = {

  config: {
    prod: 'https://c62072b6aefc4bf1bd217382b9b7dad5@app.getsentry.com/27961', // PROD : nalberg@actifi.com
    dev: 'https://656d24f28bbd4037b64638a4cdf6d61d@app.getsentry.com/26791', // DEV : alberg.nate@actifi.com
    options:  {
      whitelistUrls:[ 'actifi.com/' ],
      ignoreUrls: [ /extensions\//i, /^chrome:\/\//i ]
    }
  },


  // util
  log:function(msg){ if(typeof console !== 'undefined') console.log(msg); },
  loaded:function(){ return (typeof Raven !== "undefined"); },

  //
  // INITIALIZE
  //
  init:function(){
    if(!afCatch.loaded()) alert('Cannot initialize Sentry. Raven not defined.')
    var url = afCatch.config.prod;
    if(appEnv.env() === 'dev') url = afCatch.config.dev;
    Raven.config(url, afCatch.config.options).install();
    afCatch.log('Sentry - '+appEnv.env()+' env: ' + url)
  },


  //
  // METHODS
  //
  // send error
  throw:function(message, extra, tags){
    if(!afCatch.loaded()) return afCatch.log('Sentry Not Loaded. Unable to log issue: ' + message)

    // build options
    var options = {
      extra:extra || {},
      tags:tags || {}
    }
    // url error occurred.
    options.extra.url = extra.url || window.location.url;
    // tags
    options.tags.app = tags.app || appEnv.app();
    options.tags.env = tags.env || appEnv.env();
    options.tags.tenant = tags.tenant || appEnv.tenant();
    options.tags.index = tags.index || appEnv.index();
    options.tags.subDomain = tags.subDomain || appEnv.subDomain();
    Raven.captureMessage(message, options)
  },

  
  setUser:function(user){
    if(!afCatch.loaded()) return;
    if(user){
      Raven.setUser(user)
    } else {
      afCatch.clearUser();
    }
  },
  clearUser:function(){
    if(!afCatch.loaded()) return;
    Raven.setUser(); // clears out any current user
  }

}
;
//
// THIS IS GLOBALLY scoped on window because we need it before angular even loads..
//



//
// MIXPANEL LIB
//
(function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config people.set people.set_once people.increment people.append people.track_charge people.clear_charges people.delete_user".split(" ");
    for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);


var afTrack = {
  config: {
    prod: 'd0695354d367ec464143a4fc30d25cd5', // PROD
    dev:  'c783e4625a55094cbf9d91c94d285242'  // DEV
  },

  // util
  log:function(msg){ if(typeof console !== 'undefined') console.log(msg); },
  loaded:function(){ return (typeof mixpanel !== "undefined"); },

  init : function(){
    var token = afTrack.config.prod;
    if(appEnv.env() === 'dev') token = afTrack.config.dev;
    window.mixpanel.init(token);
    window.mixpanel.register({
      domain:appEnv.subDomain(),
      env:appEnv.env()
    });
    afTrack.log('Mixpanel - '+appEnv.env()+' env: ' + token)
  }
}