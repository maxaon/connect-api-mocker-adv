## Advanced API mocker

This is a connect.js middleware to mock http request with manual body, headers and status code. Used to mock REST API.

### Usage

Add this this middleware to your config. Example of configuring `gulp-connect` with API root '/api' and 
mock location in directory `mocks'
```javascript
gulpConnect.connect.server({
middleware: function (connect, opt) {
  var mocker = require('connect-api-mocker-adv'),
    options = {
      urlRoot: '/api',
      pathRoot: 'mocks'
    };

  return [mocker(options)];
}
});
```

If don't want use gulp, you can use without 
```javascript
var connect = require('connect');
var http = require('http');
var mocker = require('connect-api-mocker-adv')
 
var app = connect();

 var   options = {
      urlRoot: '/api',
      pathRoot: 'mocks',
      ignoreQuery: false
    };
    
app.use(mocker(options));

http.createServer(app).listen(3000);
```

Firstly mocks will be served, than other middleware.
          
## Structure

Mock file will be searched from `pathRoot` according to request url and request method. 
For example if `pathRoot` is 'mocks', `method` is 'GET' and `url` is '/api/collection mock files will be searched under 
'./mocks/api/collection/GET.yaml'. Filename int the upper case.


## Disable subtree

Adding file `disabled` without content or with `true` will disable all subtree from current path 
 
### Mock file structure

Mock file is a yaml config file with next keys:

+ `status` (number) - Response status code, default is 200
+ `headers` (object) - Headers which will be appended to default headers
+ `disabled` (boolean) - Is this mock disabled
+ `body` (object|string) - Response body. Can be an object, that will be serialized to json or simple text (use `|` or `>` for multiline
    text)
   
   
Example 
```yaml
status: 200
disabled: false
headers:
  X-Header: header-value
body:
  prop: val
``` 
Or only text body

```yaml
body: |
  This is text body line breaks.
  Use > to disable line breaks
```
Or with json
```yaml
body: |
  {
    "key": "value",
    "subKey": {
      "subObjectKey":"subObjectValue"
    }
  }
```
## API

### mocker(options)

### options.urlRoot

Required

Type: `String` 

URL root for api. If `url` equals to `*` then it will try to mock all requests

### options.pathRoot

Required

Type: `String`

Root location of mock files

### options.headers

Type: `Object`

Default: `{'Content-Type': 'application/json; charset=utf-8'}`

Response headers for all requests

### options.forced

Type: `Boolean`

Default: false

If true all disabled mocks will be served

### options.mockAll

Type: `Boolean`

Default: false

All request will be mocked. If mock not found or disabled response with status 500 will be returned

### options.urlMangler

Type: `Function`

Modify request url. Arguments: 
- `url` - request url without query string
- `request` - request object

### options.speedLimit

Type: `Number`

Default: 0 (unlimited) 

Limit speed of response in KB

### options.ignoreQuery

Type: `Boolean`

Default: true 

If true querystring is ignored.
 - If false - each mock folder will be checked for custom query string.
 - Format of subfolders with query: #[parameterName[=parameterValue]]




 

 
