'use strict';
const angular = require('angular');
const config = 'config';
const stats = 'stats';

/*@ngInject*/
export function socketService($rootScope, $timeout) {
  var socket = io.connect('https://omnitureinterceptor.herokuapp.com/');
  socket.on('connect', () => {
    console.log('socket connected');
  });
  socket.on('client:connected', data => {
    console.log(`clients connected: ${data.count}`);
  });
  socket.on('client:disconnected', data => {
    console.log(`clients connected: ${data.count}`);
  });
  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });
  socket.on('', data => {
    console.log('received', data);
    $timeout(() => {
      $rootScope.$broadcast('', data);
    }, 1);
  });
  var service = {
    events: {
      config,
      stats,
    },
    socket
  };
  return service;
}

export default angular.module('omnitureInterceptorApp.socket', [])
  .service('socket', socketService)
  .name;
