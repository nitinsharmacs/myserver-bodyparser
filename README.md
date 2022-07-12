# myserver-bodyparser

Nodejs module to parse request body.

## Getting Started
---

`myserver-bodyparser` provides simple interface to use it. Following code snippet shows how to use bodyparser.

``` js
const { myServer, Router } = require('myserver');
const bodyParser = require('myserver-bodyparser');

const router = new Router();
const server = myServer(router);

router.use(bodyParser);

server.listen(3000);
```

### Installation

This node module can be installed using npm

```console
$ npm install https://github.com/nitinsharmacs/myserver-bodyparser
```

## Example
---

  To view the example, clone the myserver repo and install the dependencies:

```console
$ git clone git://github.com/nitinsharmacs/myserver-bodyparser
$ cd myserver-bodyparser
$ npm install
```

```console
$ node examples/server.js
```

## Running Tests
---

To run tests, install the mocha dependancy and run the tests:

```console
$ npm install mocha
$ npm test
```
