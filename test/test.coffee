require('./monkey-patcher').patch()

_ = require 'lodash'
chai = require 'chai'
chai.use(require('chai-connect-middleware'))
should = chai.should()

apiMock = require('..')

describe 'test default behaviour', ->
  use = (options)->
    mock = apiMock(_.extend {}, {urlRoot: '/api', pathRoot: 'test/mocks'}, options)
    chai.connect.use(mock)

  it 'should mock response', (done)->
    use()
    .req (req)->
      req.url = "/api/collection"
    .end (res)->
      (res.statusCode).should.be.equal(200)

      res.headers.should.be.a('object')
      res.headers.should.have.property('Content-Type', 'application/json; charset=utf-8')


      res.body.should.be.a('string')
      data = JSON.parse(res.body)
      data.should.be.an('object')
      data.should.have.property('prop', 'val')

      done()
    .dispatch()
  it 'should respond on post request', (done)->
    use()
    .req (req)->
      req.url = '/api/collection'
      req.method = 'post'
    .end (res)->
      res.statusCode.should.be.equal(201)
      res.body.should.be.ok

      JSON.parse(res.body).should.be.deep.equal
        prop: 'valPost'
      done()
    .dispatch()

  it 'should response with custom header and status code', (done)->
    use()
    .req (req)->
      req.url = '/api/custom-header'
    .end (res)->
      res.statusCode.should.be.equal(403)
      res.headers.should.deep.equal
        'Content-Type': 'application/json; charset=utf-8'
        'X-Header': 'header-value'

      done()
    .dispatch()

  it 'should not mock missing response', (done)->
    use()
    .req (req)->
      req.url = '/api/missing-collection'
    .next (err)->
      should.not.exist(err)
      done()
    .dispatch()

  it 'should not mock disabled endpoint', (done)->
    use()
    .req (req)->
      req.url = '/api/disabled'
    .next (err)->
      should.not.exist(err)
      done()
    .dispatch()

  it 'should not mock disabled in forced mode', (done)->
    use({forced: true})
    .req (req)->
      req.url = '/api/disabled'
    .end (res)->
      res.statusCode.should.be.equal(200)
      res.body.should.not.be.empty
      done()
    .dispatch()

  it 'should return text content', (done)->
    use({forced: true})
    .req (req)->
      req.url = '/api/text-content'
    .end (res)->
      res.statusCode.should.be.equal(200)
      res.body.trim().should.be.equal 'This is text\nwith separator'
      done()
    .dispatch()

  it 'should response with error if mock is not found and mockAll is true', (done)->
    use({mockAll: true})
    .req (req)->
      req.url = '/api/not-exist'
    .end (res)->
      debugger
      res.statusCode.should.be.equal(500)
      should.not.exist(res.body)

      done()
    .dispatch()

  it 'should mangle request url', (done)->
    use({
      urlMangler: (url)-> url.replace(/::/g, '~')
    })
    .req (req)->
      req.url = '/api/collection/st::id'
    .end (res)->
      res.statusCode.should.be.equal(200)
      res.body.trim().should.be.equal('CollectionWithUrlMapper')
      done()
    .dispatch()







