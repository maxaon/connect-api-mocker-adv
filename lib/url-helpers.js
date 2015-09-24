'use strict';
var _ = require('lodash');

module.exports.parseQuery = function (search, lastOnly) {
  return _(search.replace(/^\?/, ''))
    .split('&')
    .reduce(function (acc, part) {
      var parts = part.split('=');
      var key = parts[0];
      var value = parts[1];

      if (lastOnly) {
        acc[key] = value;
      }
      else {
        acc[key] = acc[key] || [];
        acc[key].push(value);
      }

      return acc;
    }, {});
};

module.exports.concatUrl = function () {
  return _.toArray(arguments).join('/').replace(/\/+/g, '/');
};
