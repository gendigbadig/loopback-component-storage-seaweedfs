/**
 * Created by gendigbadig on 6/14/17.
 */
var SeaweedFSService = require('./lib/seaweedfs-service');

/**
 * Initialize storage component.
 */
exports.initialize = function(dataSource, callback) {
  var settings = dataSource.settings || {};

  var connector = new SeaweedFSService(settings);
  dataSource.connector = connector;
  dataSource.connector.dataSource = dataSource;

  connector.DataAccessObject = function () {};

  for (var m in SeaweedFSService.prototype) {
    var method = SeaweedFSService.prototype[m];
    if (typeof method === 'function') {
      connector.DataAccessObject[m] = method.bind(connector);
      for (var k in method) {
        connector.DataAccessObject[m][k] = method[k];
      }
    }
  }

  connector.define = function(model, properties, settings) {};
};