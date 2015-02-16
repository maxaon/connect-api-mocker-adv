module.exports =
  patch: ->
    Response = require('chai-connect-middleware/lib/response')
    Response.prototype.writeHead = (statusCode, headers)->
      this.statusCode = statusCode
      this._headers = headers
    Object.defineProperty Response.prototype, 'headers',
      enumerable: false
      get: -> @_headers
