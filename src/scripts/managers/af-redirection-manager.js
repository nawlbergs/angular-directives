//
// RETURNS LIST OF ENABLED/DISABLED MODULES IN THE SYSTEM
//
angular.module('af.redirectionManager', ['_', 'af.locationUtil', 'af.env', 'af.catch', 'af.moduleManager', 'af.authManager'])

    .service('afRedirectionManager', function($q, $window, $httpParamSerializer, _, afLocationUtil, afEnv, afCatch, afModuleManager, afAuthManager) {

      var go = function(url, options){
        options = options || {}; // { body, replace, newWindow }
        if(options.replace)
          $window.location.replace(url); // no history state...
        if(options.newWindow)
          afLocationUtil.postFormData(url, options.body, true); // new window...
        else
          $window.location.href = url;
      };

      var missingParams = function(searchParams, requiredParams){
        var missingParams = [];
        _.each(requiredParams, function(requiredParam){
          if(!_.has(searchParams, requiredParam))
            missingParams.push(requiredParam);
        });
        if(missingParams.length)
          return missingParams.join(',');
        return false
      };

      var convertToHttpParams = function(searchParams, searchParamsToAdd){
        searchParams = _.extend({ from:afEnv.APP() }, searchParamsToAdd, searchParams);
        // return nothing if searchParams is empty...
        return _.keys(searchParams).length ? '?'+$httpParamSerializer(searchParams):'';
      };



      var afRedirectionManager;
      return afRedirectionManager = {

        //
        // MAIN REDIRECT FUNCTIONS
        //
        redirect:function(redirectKey, searchParams, options) {
          var defer = $q.defer();
          redirectKey = ('' + redirectKey).toLowerCase();


          if(searchParams && searchParams.debug)
            alert('debug'); // pause js execution for debugging...

          var queryString = '';
          // PUBLIC REDIRECTS
          if(redirectKey == 'auth'){
            queryString = convertToHttpParams(searchParams);
            go('/auth/#/login'+queryString, options);


          // MUST BE LOGGED IN....
          } else if(!afAuthManager.isLoggedIn()) {

            // whoops.. need to be logged in...
            var error = 'Invalid Session. Redirect to '+redirectKey+' failed.';
            afCatch.send(error);
            // send them to login page....
            afRedirectionManager.invalidSession({ redirect:redirectKey || '' });

          } else {

            switch(redirectKey) {

              //
              // PORTAL -> standard login
              case 'roadmap':
                queryString = convertToHttpParams(searchParams);
                go('/portal/login-window.php#/'+queryString, options);
                break;

              // METRICS
              // eg. /metrics/#/login?from=auth&sessionToken=abc123
              case 'metrics':
                queryString = convertToHttpParams(searchParams, { sessionToken: afAuthManager.sessionToken() });
                go('/metrics/#/login'+queryString, options); // page that has code that mimics portals login page.
                break;

              //
              // PROCESS PRO
              case 'processpro':
                queryString = convertToHttpParams(searchParams);
                go('/processpro/#/'+queryString, options); // page that has code that mimics portals login page.
                break;

              //
              // ADMIN
              case 'admin':
                queryString = convertToHttpParams(searchParams);
                go('/admin/#/'+queryString, options); // page that has code that mimics portals login page.
                break;

              //
              // ROADMAP EMAIL ROADMAP UPDATER
              case 'rmupdater':
                var missing = missingParams(searchParams, ['dateFrom']);
                if(missing) {
                  defer.reject('Redirection ['+redirectKey+'] not found.');
                } else {
                  queryString = convertToHttpParams({ dateFrom: searchParams.dateFrom });
                  go('/act/rmupdater/#/rm/updater'+queryString, options);
                }
                break;

              default:
                afCatch.send('Redirection ['+redirectKey+'] not found.');
                defer.reject('Redirection ['+redirectKey+'] not found.');
            }

          }
          return defer.promise;
        },

        // attempts to redirect user to another actifi app(module)
        changeApp:function(desiredModule){

          // whats available to user
          var availableModules = afModuleManager.getUserAccessibleModules();
          if(availableModules.length == 0)
            return $q.reject([]);

          // if no specific app defined, log them into first userAccessible app
          if (!desiredModule) {
            var defaultModule = afModuleManager.getDefaultModule();
            if(!defaultModule)
              return $q.reject([]);
            desiredModule = defaultModule.key;
          }

          // ensure lowercase
          desiredModule = ('' + desiredModule).toLowerCase();

          // Make sure they can actually log into the desired module
          var isAvailable = _.find(availableModules, {key:desiredModule});
          if(!isAvailable)
            return $q.reject(availableModules);

          // actually do the redirect...
          return afRedirectionManager.redirect(desiredModule)
            .catch(function(reason){
              return $q.reject(availableModules);
            });
        },

        // redirect to auth because of session issues...
        logout:function(searchParams, options){
          searchParams = searchParams || {};
          searchParams.action = 'logout';
          afRedirectionManager.redirect('auth', searchParams, options);
        },
        invalidSession:function(searchParams, options){
          searchParams = searchParams || {};
          searchParams.action = 'invalidsession';
          afRedirectionManager.redirect('auth', searchParams, options);
        },


        roadmap:{
          openRoadmapPage:function(page, route, hui, searchParams, options){
            // send them into portals login.window with a redirect in url
            var url = page;
            if(route) url += '#/' + route;
            url += convertToHttpParams(searchParams);
            return afRedirectionManager.redirect('roadmap', { redirect:url }, options);
          },
          editRoadmap:function(roadmapId, userId, hui, searchParams, options){
            searchParams = searchParams || {};
            searchParams.userId = userId;
            return afRedirectionManager.roadmap.openRoadmapPage('user-roadmaps.php', 'roadmapsEdit/'+roadmapId, hui, searchParams, options);
          }
        }

      }

    });