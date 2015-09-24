'use strict';

var _ = require('lodash'),
  fs = require('fs'),
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

module.exports.readMock = function readMock(path, forced, env, callback) {
  fs.readFile(path, {encoding: 'utf8'}, function (err, buf) {
    var response = '';

    if (err) {
      callback(err);
      return
    }
    var mock = yaml.load(buf, {schema: getSchema(env)}) || {};

    if (mock.disabled && !forced) {
      callback({code: 'MockDisabled'});
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
};
