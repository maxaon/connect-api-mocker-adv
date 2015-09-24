require('./monkey-patcher').patch()

_ = require 'lodash'
chai = require 'chai'
chai.use(require('chai-connect-middleware'))
should = chai.should()

apiMock = require('..')

assertResponse = (res) ->
  (res.statusCode).should.be.equal(200)

  res.headers.should.be.a('object')
  res.headers.should.have.property('Content-Type', 'application/json; charset=utf-8')


  res.body.should.be.a('string')
  data = JSON.parse(res.body)
  data.should.be.an('object')
  return data

describe 'test with different queries', ->
  use = (options)->
    mock = apiMock(_.extend {}, {
      urlRoot: '/api',
      pathRoot: 'test/mocks'
    }, options)
    chai.connect.use(mock)

  it 'should substitute', (done)->
    use()
    .req (req)->
      req.url = "/api/with-custom-type"
    .end (res)->
      assertResponse(res)
      .should.have.property('requestMethod', 'GET')

      done()
    .dispatch()
