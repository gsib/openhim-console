'use strict';

angular.module('openhimConsoleApp')
  .factory('Api', function ($rootScope, $resource, config) {

    // fetch API server details
    var protocol = config.protocol;
    var host = config.host;
    var port = config.port;
    var server = protocol + '://' + host + ':' + port;

    return {
      Authenticate: $resource( server + '/authenticate/:email' ),

      Channels: $resource( server + '/channels/:channelId', { channelId: '@_id' }, {
        update: { method: 'PUT' }
      }),

      Users: $resource( server + '/users/:email', { email: '@email' }, {
        update: { method: 'PUT' }
      }),

      Clients: $resource( server + '/clients/:clientId/:property', { clientId: '@_id', property: '@property' }, {
        update: { method: 'PUT' }
      }),

      Transactions: $resource( server + '/transactions/:transactionId', { transactionId: '@_id' }),

      Mediators: $resource( server + '/mediators/:urn', { urn: '@urn' }, {
        update: { method: 'PUT' }
      }),

      // add the metric endpoints
      Metrics: $resource( server + '/metrics/:type/:channelId', {}),
      MetricsStatus: $resource( server + '/metrics/status', {}),
      MetricsLoadTime: $resource( server + '/metrics/load-time', {}),

      Tasks: $resource( server + '/tasks/:taskId', { taskId: '@_id' }, {
        update: { method: 'PUT' }
      }),

      ContactGroups: $resource( server + '/groups/:groupId', { groupId: '@_id' }, {
        update: { method: 'PUT' }
      }),

      VisualizerEvents: $resource( server + '/visualizer/events/:receivedTime'),
      VisualizerSync: $resource( server + '/visualizer/sync'),

      // endpoint to restart the core server
      Restart: $resource( server + '/restart', {}),

      // New User
      NewUser: $resource( server + '/new-user/:token', { token: '@token' }, {
        update: { method: 'PUT' }
      }),

      Keystore: $resource( server + '/keystore/:type/:property', { type: '@type', property: '@property' }, {
        update: { method: 'PUT' }
      }),

      Certificates: $resource ( server + '/certificates' ,{}),

      // ATNA Audit log endpoint
      Audits: $resource( server + '/audits/:auditId', { auditId: '@_id' }),
      AuditsFilterOptions: $resource( server + '/audits-filter-options/', {}),

    };
  });
