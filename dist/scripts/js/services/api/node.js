(function() {
  var myApp;

  myApp = angular.module('myApp');

  myApp.service('node', function($http, api, authManager) {
    var node;
    node = {
      RoadmapNode: {
        serviceUrl: '/roadmap-node',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params == null) {
            params = {};
          }
          if (params.tenant == null) {
            params.tenant = api.getTenantIndex();
          }
          if (params.sessionToken == null) {
            params.sessionToken = authManager.sessionToken;
          }
          req = {
            url: node.RoadmapNode.serviceUrl + method,
            data: params
          };
          req = api.addDebugInfo(req);
          return api.execute(req, onSuccess, onError);
        },
        save: function(type, resource, onSuccess, onError) {
          return node.RoadmapNode.execute('/api/crud/save', {
            _type: type,
            resource: resource
          }, onSuccess, onError);
        },
        find: function(type, query, onSuccess, onError) {
          return node.RoadmapNode.execute('/api/crud/find', {
            _type: type,
            query: query
          }, onSuccess, onError);
        },
        findOne: function(type, query, onSuccess, onError) {
          return node.RoadmapNode.find(type, query, function(data) {
            if (onSuccess) {
              if (_.isArray(data)) {
                return onSuccess(data[0]);
              }
              return onSuccess(data);
            }
          }, onError);
        },
        deleteById: function(type, id, onSuccess, onError) {
          id = api.ensureInt(id);
          return node.RoadmapNode.execute('/api/crud/delete', {
            _type: type,
            id: id
          }, onSuccess, onError);
        }
      },
      Batch: {
        execute: function(method, params, onSuccess, onError) {
          return node.RoadmapNode.execute('/api/batch' + method, params, onSuccess, onError);
        }
      },
      QuickContent: {
        serviceUrl: '/quick-content',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params == null) {
            params = {};
          }
          if (params.index == null) {
            params.index = api.getTenantIndex();
          }
          if (params.sessionToken == null) {
            params.sessionToken = authManager.sessionToken;
          }
          req = {
            url: node.QuickContent.serviceUrl + method,
            data: params
          };
          req = api.addDebugInfo(req);
          return api.execute(req, onSuccess, onError);
        },
        mget: function(body, onSuccess, onError) {
          var params;
          params = {
            type: 'recommendations',
            body: body
          };
          return node.QuickContent.execute('/mget', params, function(data) {
            if (!onSuccess) {
              return;
            }
            if (data && data.docs) {
              data.docs = node.QuickContent.flatten(data.docs);
              return onSuccess(data.docs);
            } else {
              return onSuccess(data);
            }
          }, onError);
        },
        search: function(body, onSuccess, onError) {
          var params;
          params = {
            type: 'recommendations',
            body: body
          };
          return node.QuickContent.execute('/search', params, function(data) {
            if (!onSuccess) {
              return;
            }
            if (data && data.hits && data.hits.hits) {
              data.hits.hits = node.QuickContent.flatten(data.hits.hits);
              return onSuccess(data.hits);
            } else {
              return onSuccess(data);
            }
          }, onError);
        },
        flatten: function(results) {
          if (!results || results.length === 0) {
            return [];
          }
          return _.map(results, function(row) {
            var item;
            item = {};
            if (row._source) {
              item = row._source;
            }
            if (row.fields) {
              item = row.fields;
            }
            if (row._score && !item._score) {
              item._score = row._score;
            }
            if (row._id && !item.id) {
              item.id = api.ensureInt(row._id);
            }
            return item;
          });
        }
      },
      ExploreDB: {
        serviceUrl: '/explore/db',
        execute: function(method, params, onSuccess, onError) {
          var req;
          if (params == null) {
            params = {};
          }
          if (params.index == null) {
            params.index = api.getTenantIndex();
          }
          if (params.sessionToken == null) {
            params.sessionToken = authManager.sessionToken;
          }
          req = {
            url: node.ExploreDB.serviceUrl + method,
            data: params
          };
          req = api.addDebugInfo(req);
          return api.execute(req, onSuccess, onError);
        },
        findByDate: function(from, to, onSuccess, onError) {
          return node.ExploreDB.execute('/find-by-date', {
            from: from,
            to: to
          }, onSuccess, onError);
        },
        findByEmail: function(email, onSuccess, onError) {
          return node.ExploreDB.execute('/find-by-email', {
            email: email
          }, onSuccess, onError);
        },
        save: function(data, onSuccess, onError) {
          return node.ExploreDB.execute('/save', data, onSuccess, onError);
        }
      }
    };
    return node;
  });

}).call(this);