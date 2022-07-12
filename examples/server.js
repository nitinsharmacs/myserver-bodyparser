const { myServer, Router } = require('myserver');
const bodyParser = require('../index.js');

const router = new Router();
const server = myServer(router);

router.use(bodyParser);

router.post('/login', (req, res) => {
  const { body } = req;
  console.log(body);
  res.send('got the request');
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
