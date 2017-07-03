/**
 * Created by gendigbadig on 6/14/17.
 */

var util = require('util');
var url = require('url');

// var _ = require('lodash');
var Busboy = require('busboy');
var weedClient = require("node-seaweedfs");

module.exports = SeaweedFSService;

function SeaweedFSService(options) {
  if (!(this instanceof SeaweedFSService)) {
    return new SeaweedFSService(options);
  }

  this.client = new weedClient({
    server: options.host,
    port: options.port
  });

  this.options = options;
}

// /**
//  * List all storage containers.
//  */
// SeaweedFSService.prototype.getContainers = function (cb) {
//   var collection = this.db.collection('fs.files');
//
//   collection.find({
//     'metadata.container': { $exists: true }
//   }).toArray(function (error, files) {
//     var containerList = [];
//
//     if (!error) {
//       containerList = _(files)
//         .map('metadata.container').uniq().value();
//     }
//
//     return cb(error, containerList);
//   });
// };


// /**
//  * Delete an existing storage container.
//  */
// SeaweedFSService.prototype.deleteContainer = function (containerName, cb) {
//   var collection = this.db.collection('fs.files');
//
//   collection.deleteMany({
//     'metadata.container': containerName
//   }, function (error) {
//     return cb(error);
//   });
// };


// /**
//  * List all files within the given container.
//  */
// SeaweedFSService.prototype.getFiles = function (containerName, cb) {
//   var collection = this.db.collection('fs.files');
//
//   collection.find({
//     'metadata.container': containerName
//   }).toArray(function (error, container) {
//     return cb(error, container);
//   });
// };


/**
 * Return a file with the given id within the given container.
 */
SeaweedFSService.prototype.getFile = function (containerName, fileId, cb) {
  var self = this;
  var client = self.client;

  var options = {
    collection: containerName
  };

  client.find(fileId, options).then(function(fileInfo) {
    cb (null, fileInfo)
  }).catch(function(err) {
    cb (err)
  });
};


/**
 * Delete an existing file with the given id within the given container.
 */
SeaweedFSService.prototype.deleteFile = function (containerName, fileId, cb) {
  var self = this;
  var client = self.client;
  var options = {
    collection: containerName
  };
  client.remove(fileId, options).then(function() {
    cb(null, {message: "Success"})
  }).catch(function(err){
    cb(err)
  });
};


/**
 * Upload middleware for the HTTP request.
 */
SeaweedFSService.prototype.upload = function (containerName, req, cb) {
  var self = this;
  var client = self.client;

  var busboy = new Busboy({
    headers: req.headers,
    limits: {
      files: 1
    }
  });

  var fileBuffer = new Buffer('');

  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    file.on('data', function(data) {
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });

    file.on('end', function() {
      client.write(fileBuffer, {collection: containerName})
        .then(function (fileInfo) {
          fileInfo.metadata = {
            mimetype: mimetype
          };
          fileInfo._id = fileInfo.fid;
          cb(null, fileInfo)
        }).catch(function (err) {
        cb (err);
      });
    });
  });
  return req.pipe(busboy);
};

/**
 * Download middleware for the HTTP request.
 */
SeaweedFSService.prototype.download = function (containerName, fileId, req, res, cb) {
  var self = this;
  var client = self.client;
  var options = {
    collection: containerName,
    headers: req.headers
  };
  client.read(fileId, options, res);

  res.on('error', function(err) {
    cb(err);
  });
};

SeaweedFSService.modelName = 'storage';

/*
 * Routing options
 */

// /*
//  * GET /FileContainers
//  */
// SeaweedFSService.prototype.getContainers.shared = true;
// SeaweedFSService.prototype.getContainers.accepts = [];
// SeaweedFSService.prototype.getContainers.returns = {
//   arg: 'containers',
//   type: 'array',
//   root: true
// };
// SeaweedFSService.prototype.getContainers.http = {
//   verb: 'get',
//   path: '/'
// };
//
// /*
//  * DELETE /FileContainers/:containerName
//  */
// SeaweedFSService.prototype.deleteContainer.shared = true;
// SeaweedFSService.prototype.deleteContainer.accepts = [
//   { arg: 'containerName', type: 'string', description: 'Container name' }
// ];
// SeaweedFSService.prototype.deleteContainer.returns = {};
// SeaweedFSService.prototype.deleteContainer.http = {
//   verb: 'delete',
//   path: '/:containerName'
// };
//
// /*
//  * GET /FileContainers/:containerName/files
//  */
// SeaweedFSService.prototype.getFiles.shared = true;
// SeaweedFSService.prototype.getFiles.accepts = [
//   { arg: 'containerName', type: 'string', description: 'Container name' }
// ];
// SeaweedFSService.prototype.getFiles.returns = {
//   type: 'array',
//   root: true
// };
// SeaweedFSService.prototype.getFiles.http = {
//   verb: 'get',
//   path: '/:containerName/files'
// };
//
/*
 * GET /FileContainers/:containerName/files/:fileId
 */
SeaweedFSService.prototype.getFile.shared = true;
SeaweedFSService.prototype.getFile.accepts = [
  { arg: 'containerName', type: 'string', description: 'Container name' },
  { arg: 'fileId', type: 'string', description: 'File id' }
];
SeaweedFSService.prototype.getFile.returns = {
  type: 'object',
  root: true
};
SeaweedFSService.prototype.getFile.http = {
  verb: 'get',
  path: '/:containerName/files/:fileId'
};

/*
 * DELETE /FileContainers/:containerName/files/:fileId
 */
SeaweedFSService.prototype.deleteFile.shared = true;
SeaweedFSService.prototype.deleteFile.accepts = [
  { arg: 'containerName', type: 'string', description: 'Container name' },
  { arg: 'fileId', type: 'string', description: 'File id' }
];
SeaweedFSService.prototype.deleteFile.returns = {
  arg: 'file',
  type: 'object',
  root: true
};
SeaweedFSService.prototype.deleteFile.http = {
  verb: 'delete',
  path: '/:containerName/files/:fileId'
};

/*
 * POST /FileContainers/:containerName/upload
 */
SeaweedFSService.prototype.upload.shared = true;
SeaweedFSService.prototype.upload.accepts = [
  { arg: 'containerName', type: 'string', description: 'Container name' },
  { arg: 'req', type: 'object', http: { source: 'req' } }
];
SeaweedFSService.prototype.upload.returns = {
  arg: 'file',
  type: 'object',
  root: true
};
SeaweedFSService.prototype.upload.http = {
  verb: 'post',
  path: '/:containerName/upload'
};

/*
 * GET /FileContainers/:containerName/download/:fileId
 */
SeaweedFSService.prototype.download.shared = true;
SeaweedFSService.prototype.download.accepts = [
  { arg: 'containerName', type: 'string', description: 'Container name' },
  { arg: 'fileId', type: 'string', description: 'File id' },
  { arg: 'req', type: 'object', 'http': { source: 'req' } },
  { arg: 'res', type: 'object', 'http': { source: 'res' } }
];
SeaweedFSService.prototype.download.http = {
  verb: 'get',
  path: '/:containerName/download/:fileId'
};
