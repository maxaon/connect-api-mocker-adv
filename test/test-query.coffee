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
      pathRoot: 'test/mocks',
      ignoreQuery: false
    }, options)
    chai.connect.use(mock)

  it 'should mock response', (done)->
    use()
    .req (req)->
      req.url = "/api/collection"
    .end (res)->
      assertResponse(res)
      .should.have.property('prop', 'val')

      done()
    .dispatch()

  it 'should search by query', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query"
    .end (res)->
      assertResponse(res)
      .should.have.property('prop', 'val')

      done()
    .dispatch()

  it 'should search by query with param', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query?param1=23"
    .end (res)->
      assertResponse(res)
      .should.have.property('param1', 23)

      done()
    .dispatch()

  it 'should send default request if parameters not found', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query?some-other-param=41"
    .end (res)->
      assertResponse(res)
      .should.have.property('prop', 'val');
      done()
    .dispatch()

  it 'should mock with other params', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query?param-other=2&param1=23"
    .end (res)->
      assertResponse(res)
      .should.have.property('param1', 23)

      done()
    .dispatch()

  it 'should mock with any param', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query?param-other=2&param2=some-string"
    .end (res)->
      assertResponse(res)
      .should.have.property('param2', 'any')

      done()
    .dispatch()

  it 'should send with requests with more params', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query?param3=41&param2=4"
    .end (res)->
      assertResponse(res)
      .should.have.property('param32', 414);

      done()
    .dispatch()

  it 'should mock with correct message', (done) ->
    use()
    .req (req)->
      req.url = "/api/with-query?groupBy=track&subGroupBy=deliveryTypeGroup"
    .end (res)->
      assertResponse(res)
      .should.have.property('groupBy', 'track')

      done()
    .dispatch()



