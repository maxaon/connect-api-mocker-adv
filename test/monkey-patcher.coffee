module.exports =
  patch: ->
    Response = require('chai-connect-middleware/lib/response')
    return if Response.prototype.writeHead

    Response.prototype.writeHead = (statusCode, headers)->
      this.statusCode = statusCode
      this._headers = headers
    Object.defineProperty Response.prototype, 'headers',
      enumerable: false
      get: -> @_headers
