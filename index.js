/*
 * Copyright 2013 Sahibinden Bilgi Teknolojileri Pazarlama ve Ticaret A.Ş.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/**
 * Create handler for mocking REST API.
 *
 * @author sahibinden.com, Peter Kicenko
 */
var _ = require('lodash'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  util = require('util'),
  traverseHelpers = require('./lib/traverse-helper'),
  mock = require('./lib/mock'),
  concatUrl = require('./lib/url-helpers').concatUrl;


/**
 * @param {string} options Options
 * @param {string} options.urlRoot Api root that will be watched
 * @param {string} options.pathRoot Folder with mock files
 * @param {number} [options.speedLimit] Simulation speed limit
 * @param {boolean} [options.forced=false] Force serving of respond, even if it was disabled
 * @param {boolean} [options.mockAll=false] If true and stub was not found do not pass control to next handle
 * @param {boolean} [options.ignoreQuery=true] If true querystring is ignored.
 * If false - each mock folder will be checked for custom query string.
 * Format of subfolders with query: #[parameterName[=parameterValue]]
 * @param {object} [options.headers] Default header for all responses default is
 *        'Content-Type: application/json; charset=utf-8'
 * @param {function(url,req)} options.urlMangler Change url of request before mock file search
 */
module.exports = function (options) {
  options = _.defaults(options, {
    speedLimit: 0, // make speed request unlimited,
    forced: false,
    mockAll: false,
    urlMangler: _.identity,
    ignoreQuery: true,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
  // Trim url root address from path root address
  options.pathRoot = options.pathRoot.trim();

  return function (req, res, next) {
    if (req.url.indexOf(options.urlRoot) !== 0) {
      next();
      return;
    }

    var url = options.urlMangler(req.url, req),
      query,
      method = req.method.toUpperCase();

    var parts = url.split('?');
    url = parts[0];
    query = parts[1];

    if (!query || options.ignoreQuery) {
      mockRequest(concatUrl(options.pathRoot, url, method));
      return;
    }

    traverseHelpers.findQuerySubdirectory(concatUrl(options.pathRoot, url), query, function (err, subdir) {
      if (err) {
        handleError(err);
        return;
      }
      if (subdir) {
        mockRequest(concatUrl(options.pathRoot, url, subdir, method));
      } else {
        mockRequest(concatUrl(options.pathRoot, url, method));
      }
    });

    function mockRequest(path) {
      path += '.yaml';
      debugger;
      var env = {req: req};
      mock.readMock(path, options.forced, env, function (err, mock) {
        if (err) {
          handleError(err);
          return;
        }
        res.writeHead(mock.status, _.defaults(mock.headers, options.headers));
        util.log(util.format('Mocked %s %s%s', method, url, options.ignoreQuery && query ? '' : '?' + query));

        if (options.speedLimit) {
          setTimeout(function () {
            res.end(mock.body);
          }, mock.body.length / (options.speedLimit * 1024 / 8 ) * 1000);
        } else {
          res.end(mock.body);
        }
      });
    }

    function handleError(err) {
      if (err.code === 'ENOENT' || err.code === 'MockDisabled') {// ?Error NO ENTry
        if (!options.mockAll) {
          return next();
        }
        var message = err.code === 'MockDisabled'
          ? util.format('Mock file is disabled for method %s and url %s', method, url)
          : util.format('Cannot find mock %s %s', method, url);
        util.log(message);
        res.writeHead(500, options.headers);
        res.end();
      }
      else {
        next(err);
      }
    }
  };
};
