'use strict';
var _ = require('lodash');
var Type = require('js-yaml').Type;

function resolveEnvironment() {
  return true;
}

function constructEnvironmentVariable(path) {
  return _.property(path)(this._env);
}

var reqType = new Type('!env', {
  kind: 'scalar',
  resolve: resolveEnvironment,
  construct: constructEnvironmentVariable
});

reqType.setEnvironment = function (env) {
  this._env = env;
};

module.exports = reqType;
