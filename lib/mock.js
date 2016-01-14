'use strict';

var _ = require('lodash'),
  fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml'),
  envType = require('./yaml-type/env');


function getSchema(env) {
  envType.setEnvironment(env);
  return new yaml.Schema({
    include: [
      yaml.DEFAULT_FULL_SCHEMA
    ],
    explicit: [
      envType
    ]
  })
}

module.exports.readMock = function readMock(mockPath, forced, env, callback) {
  var dirs = path.dirname(mockPath).split('/');
  checkIsDisabledByPath(dirs);

  function disabledCallback() {
    callback({code: 'MockDisabled'});
  }

  function checkIsDisabledByPath(dirs) {
    if (!dirs.length) {
      readMockFile();
      return;
    }
    var disabledFile = path.join.apply(path, dirs.concat(['disabled']));

    fs.readFile(disabledFile, {encoding: 'utf8'}, function (err, buf) {
      if (!err && (!buf || buf.trim() === 'true')) {
        disabledCallback();
        return;
      }
      checkIsDisabledByPath(dirs.slice(0, -1));
    });
  }

  function readMockFile() {
    fs.readFile(mockPath, {encoding: 'utf8'}, function (err, buf) {
      var response = '';

      if (err) {
        callback(err);
        return
      }
      var mock = yaml.load(buf, {schema: getSchema(env)}) || {};

      if (mock.disabled && !forced) {
        disabledCallback();
        return;
      }

      if (mock.body) {
        response = typeof mock.body === "object" ? JSON.stringify(mock.body, null, 2) : mock.body;
      }

      var result = {
        body: '' + response,
        status: mock.status !== undefined ? mock.status : 200,
        headers: mock.headers || {}
      };

      callback(null, result);
    });
  }
};
