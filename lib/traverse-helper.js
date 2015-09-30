'use strict';
var _ = require('lodash'),
  fs = require('fs'),
  urlHelpers = require('./url-helpers');

module.exports.findQuerySubdirectory = function (startPath, checkQuery, callback) {
  var parsedQuery = urlHelpers.parseQuery(checkQuery, true);

  fs.readdir(startPath, function (err, files) {
    var newFile = _(files)
      .filter(function (file) {
        return file.indexOf('#') > -1;
      })
      .sortBy()
      .map(function (fileName) {
        var fileQuery = urlHelpers.parseQuery(fileName.split('#')[1]);

        return {
          fileQuery: fileQuery,
          fileName: fileName
        };
      })
      .forEach(function (desc) {
        try {
          desc.rank = _(desc.fileQuery)
            .map(function (values, key) {
              if (!parsedQuery.hasOwnProperty(key)) {
                return false;
              }
              var requestValue = parsedQuery[key];
              var match = _.some(values, function (v) {
                return v === requestValue;
              });
              var any = _.some(values, function (v) {
                return v === undefined;
              });
              if (!match && !any) {
                throw new Error('Key does not applicable'); // key does not match!
              }

              return match || any;
            })
            .sum();
        } catch (ex) {
          if (ex.message !== 'Key does not applicable') {
            throw ex;
          }
          desc.rank = null;
        }
      })
      .filter('rank')
      .sortBy(function (desc) {
        return -desc.rank;
      })
      .first();

    callback(null, newFile && newFile.fileName);
  });
};
