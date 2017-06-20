/**
 * Created by gendigbadig on 6/14/17.
 */

var util = require('util');
var url = require('url');

var _ = require('lodash');
var Busboy = require('busboy');
var weedClient = require("node-seaweedfs");
var stream = require('stream');
// var Readable = require('stream').Readable;
// var Writable = require('stream').Writable;

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

/**
 * Connect to mongodb if necessary.
 */
// SeaweedFSService.prototype.connect = function (cb) {
//   var self = this;
//
//   if (!this.db) {
//     var url;
//     if (!self.options.url) {
//       url = (self.options.username && self.options.password) ?
//         'mongodb://{$username}:{$password}@{$host}:{$port}/{$database}' :
//         'mongodb://{$host}:{$port}/{$database}';
//
//       // replace variables
//       url = url.replace(/\{\$([a-zA-Z0-9]+)\}/g, function (pattern, option) {
//         return self.options[option] || pattern;
//       });
//     } else {
//       url = self.options.url;
//     }
//
//     // connect
//     MongoClient.connect(url, self.options, function (error, db) {
//       if (!error) {
//         self.db = db;
//       }
//       return cb(error, db);
//     });
//   }
// };

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


// /**
//  * Return a file with the given id within the given container.
//  */
// SeaweedFSService.prototype.getFile = function (containerName, fileId, cb) {
//   var collection = this.db.collection('fs.files');
//
//   collection.find({
//     '_id': new mongodb.ObjectID(fileId),
//     'metadata.container': containerName
//   }).limit(1).next(function (error, file) {
//     if (!file) {
//       error = new Error('File not found');
//       error.status = 404;
//     }
//     return cb(error, file || {});
//   });
// };


// /**
//  * Delete an existing file with the given id within the given container.
//  */
// SeaweedFSService.prototype.deleteFile = function (containerName, fileId, cb) {
//   var collection = this.db.collection('fs.files');
//
//   collection.deleteOne({
//     '_id': new mongodb.ObjectID(fileId),
//     'metadata.container': containerName
//   }, function (error) {
//     return cb(error);
//   });
// };


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
    // var options = {
    //   _id: new mongodb.ObjectID(),
    //   filename: filename,
    //   metadata: {
    //     container: containerName,
    //     filename: filename,
    //     mimetype: mimetype
    //   },
    //   mode: 'w'
    // };
    //
    // var gridfs = new GridFS(self.db, mongodb);
    // var stream = gridfs.createWriteStream(options);
    //
    // stream.on('close', function (file) {
    //   return cb(null, file);
    // });
    //
    // stream.on('error', cb);

    // var stream = new require('stream').Transform();
    // stream._transform = function (chunk, enc, done) {
    //   this.push(chunk);
    //   done()
    // };
    // //

    file.on('data', function(data) {
      //console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });

    file.on('end', function() {
      client.write(fileBuffer, {collection: containerName})
      .then(function (fileInfo) {
        //console.log(fileInfo)
        // file.on('finish', function(info){
        cb(null, fileInfo)
        // })
      }).catch(function (err) {
        cb (err);
      });
    });

    // var writable = new stream.Writable({
    //   write: function(chunk, encoding, next) {
    //     //console.log(chunk.toString());
    //     next();
    //   }
    // });
    //
    // stream = new require('stream').Transform()
    // stream._transform = function (chunk,encoding,done)
    // {
    //   this.push(chunk)
    //   done()
    // }
    //
    // client.write(stream, {collection: containerName})
    //   .then(function (fileInfo) {
    //     //console.log(fileInfo)
    //     cb(null, fileInfo)
    //   }).catch(function (err) {
    //     cb (err);
    //   });
    //
    // file.pipe(stream)

    // stream.on('close', function (file) {
    //   return cb (null, file);
    // });
    //
    // stream.on('error', cb);
    //
    // file.pipe(stream);
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

  // var resHeaders = {
  //   'Content-Type':  metadata,
  //   'Content-Length': file.length,
  //   'Content-Range': 'bytes ' + 0 + '-',
  //   'Accept-Ranges': 'bytes'
  // };
  //
  // var gridRange = {
  //   startPos: 0,
  //   endPos: file.length - 1
  // };
  //
  // var statusCode = 200;

  // if(req.headers['range']) {
  //   var parts = req.headers['range'].replace(/bytes=/, "").split("-");
  //   var partialstart = parts[0];
  //   var partialend = parts[1];
  //   var start = parseInt(partialstart, 10);
  //   var end = partialend ? parseInt(partialend, 10) : file.length -1;
  //   var chunksize = (end-start)+1;
  //
  //   //  Set headers
  //   resHeaders['Content-Range'] = 'bytes ' + start + '-' + end + '/' + file.length;
  //   resHeaders['Accept-Ranges'] = 'bytes';
  //   resHeaders['Content-Length'] = chunksize;
  //   //  Set Range
  //   gridRange['startPos'] = start;
  //   gridRange['endPos'] = end - 1;
  //   //  Set status code
  //   statusCode = 206;
  // }
  //
  // res.writeHead(statusCode, resHeaders);


  // var self = this;
  //
  // var collection = this.db.collection('fs.files');
  //
  // collection.find({
  //   '_id': new mongodb.ObjectID(fileId),
  //   'metadata.container': containerName
  // }).limit(1).next(function (error, file) {
  //   if (!file) {
  //     error = new Error('File not found.');
  //     error.status = 404;
  //   }
  //
  //   if (error) {
  //     return cb(error);
  //   }
  //
  //   var gridfs = new GridFS(self.db, mongodb);
  //   var stream = gridfs.createReadStream({
  //     _id: file._id
  //   });
  //
  //   // set headers
  //   res.set('Content-Type', file.metadata.mimetype);
  //   res.set('Content-Length', file.length);
  //
  //   return stream.pipe(res);
  // });
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
// /*
//  * GET /FileContainers/:containerName/files/:fileId
//  */
// SeaweedFSService.prototype.getFile.shared = true;
// SeaweedFSService.prototype.getFile.accepts = [
//   { arg: 'containerName', type: 'string', description: 'Container name' },
//   { arg: 'fileId', type: 'string', description: 'File id' }
// ];
// SeaweedFSService.prototype.getFile.returns = {
//   type: 'object',
//   root: true
// };
// SeaweedFSService.prototype.getFile.http = {
//   verb: 'get',
//   path: '/:containerName/files/:fileId'
// };
//
// /*
//  * DELETE /FileContainers/:containerName/files/:fileId
//  */
// SeaweedFSService.prototype.deleteFile.shared = true;
// SeaweedFSService.prototype.deleteFile.accepts = [
//   { arg: 'containerName', type: 'string', description: 'Container name' },
//   { arg: 'fileId', type: 'string', description: 'File id' }
// ];
// SeaweedFSService.prototype.deleteFile.returns = {};
// SeaweedFSService.prototype.deleteFile.http = {
//   verb: 'delete',
//   path: '/:containerName/files/:fileId'
// };

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

// /*
//  * GET /FileContainers/:containerName/download/:fileId
//  */
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
