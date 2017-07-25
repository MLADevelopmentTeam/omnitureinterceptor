import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

const blackList = ['.nac', '.c', 'pe', 'pev2', 't', 'aid', 'nac.', 'ndh', 'ts', 'ce', 'c.', 'a.', '.a', 'AppID', 'DeviceName', 'OSVersion', 'RunMode', 'Resolution', 'CarrierName', 'TimeSinceLaunch'];
export class MainController {

  messages = [];
  selectedMessage = null;
  filters = [];

  /*@ngInject*/
  constructor($http, $scope, $document, socket) {
    this.$document = $document;
    this.socket = socket;
    this.$http = $http;
    this.listen('');
  }
  listen(filter) {
    this.socket.listen(filter).then(null, null, data => {
      var result = this.formatData(data);
      this.messages.splice(0, 0, result);
    });
  }
  $onInit() {
  }
  rowPress($event) {
    var index = this.messages.indexOf(this.selectedMessage);
    if($event.keyCode == 38) {
      if(index > 0) {
        this.selectRow(this.messages[index - 1]);
      }
    } else if($event.keyCode == 40) {
      if(index < this.messages.length - 1) {
        this.selectRow(this.messages[index + 1]);
      }
    }
  }
  addFilter() {
    this.filters.push(this.newFilter);
    this.socket.unlisten('');
    this.listen(this.newFilter);
    this.newFilter = '';
  }
  removeFilter(filter) {
    this.filters = this.filters.filter(f => f != filter);
    this.socket.unlisten(filter);
    if(this.filters.length == 0) {
      this.listen('');
    }
  }
  selectRow(message) {
    if(!message) return;
    this.messages.forEach(m => {
      m.active = false;
    });
    message.active = true;
    this.selectedMessage = message;
    document.getElementById(message.id).focus();
  }
  export() {
    var csvContent = 'data:application/octet-stream,';
    this.messages.forEach(m => {
      csvContent += `"${m.timeStamp}","${m.event}","${m.deviceName}","${m.client}"`;
      m.context.forEach(c => {
        csvContent += `,"${c.value}"`;
      });
      csvContent += '\n';
    });
    var encoded = encodeURI(csvContent);
    window.open(encoded);
  }
  trash() {
    this.messages = [];
  }
  formatData(data) {
    var result = {
      id: 'hits' + this.messages.length,
      client: data.client,
      deviceName: data.body.deviceName,
      event: data.body.action || data.body.pageName,
      timeStamp: data.body.timeStamp,
      details: {
        osVersion: data.body.OSVersion,
        appId: data.body.AppID,
        timeSinceLaunch: data.body.TimeSinceLaunch
      },
      context: []
    };
    for(var key in data.body) {
      var value = data.body[key];
      if(blackList.indexOf(key) >= 0) {
        continue;
      }
      result.context.push({
        key,
        value
      });
    }
    return result;
  }
}

export default angular.module('omnitureInterceptorApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
