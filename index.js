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

/**
 * Create handler for mocking REST API.
 *
 * @author sahibinden.com, Peter Kicenko
 */
var _ = require('lodash'),
  fs = require('fs'),
  yaml = require('js-yaml'),
  util = require('util');


/**
 * @param {string} options Options
 * @param {string} options.urlRoot Api root that will be watched
 * @param {string} options.pathRoot Folder with mock files
 * @param {string} [options.speedLimit] Simulation speed limit
 * @param {string} [options.forced=false] Force serving of respond, even if it was disabled
 * @param {string} [options.mockAll=false] If true and stub was not found do not pass control to next handle
 * @param {string} [options.headers] Default header for all responses default is
 *        'Content-Type: application/json; charset=utf-8'
 * @param {function(url,request)} urlMangler Change url of request before mock file search
 */
module.exports = function (options) {
  options = options || {};
  // Trim url root address from path root address
  options.pathRoot = options.pathRoot.trim();

  options.urlMangler = options.urlMangler || _.identity;

  // If a options.speedLimit not set, set unlimited
  if (!options.speedLimit) {
    options.speedLimit = 0; // Unlimited
  }
  options.headers = options.headers || {'Content-Type': 'application/json; charset=utf-8'};
  return function (req, res, next) {
    if (req.url.indexOf(options.urlRoot) === 0 || req.url === "*") {
      // Ignore querystrings
      var url = req.url.split('?')[0],
        method = req.method.toUpperCase(),
        response = null;

      url = options.urlMangler(url, req);

      fs.readFile('./' + options.pathRoot + url + '/' + method + '.yaml', {encoding: 'utf8'}, function (err, buf) {
        if (err) {
          if (err.code === 'ENOENT') {// ?Error NO ENTry
            if (!options.mockAll)
              return next();
            else {
              util.log(util.format('Cannot find mock %s %s', method, url));
              res.writeHead(500, options.headers);
              res.end();
              return;
            }
          }
          else
            return next(err);
        }
        var config = yaml.load(buf) || {};
        if (config.disabled && !options.forced) {
          if (options.mockAll) {
            util.log(util.format('Mock file is disabled for method %s and url %s', method, url));
            res.writeHead(500, options.headers);
            res.end();
            return;
          }
          else {
            return next();
          }
        }

        if (config.body)
          response = typeof config.body === "object" ? JSON.stringify(config.body, null, 2) : config.body;

        var resp = {
          headers: _.extend({}, options.headers, config.headers),
          body: response
        };
        res.writeHead(config.status !== undefined ? config.status : 200, resp.headers);

        util.log(util.format('Mocked %s %s', method, url));

        if (options.speedLimit) {
          setTimeout(function () {
            res.end(resp.body);
          }, buf.length / (options.speedLimit * 1024 / 8 ) * 1000);
        } else {
          res.end(resp.body);
        }
      });
    } else {
      next();
    }
  };
};
