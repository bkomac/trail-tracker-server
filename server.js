var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

global.lastLocations = [];

// parse application/json
app.use(bodyParser.json({ type: '*/*' })); // force json

app.all('/*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');

  for (var i = 0; i < lastLocations.length; i++) {
    console.log('---:' + i);
  }

  setTimeout(function () {
    console.log('emit :' + JSON.stringify(lastLocations));
    io.emit('locations', lastLocations);
  }, 2000);
  
});

app.post('/locations', function (request, response) {
  console.log('Headers:\n', request.headers);
  console.log('Locations:\n', request.body);
  console.log('------------------------------', request.body[0].user);

  lastLocations[request.body[0].user.uuid] = request.body;

  console.log('Last loc :' + JSON.stringify(lastLocations[request.body[0].user.uuid]));

  io.emit('locations', request.body);
  response.sendStatus(200);
});

app.post('/sync', function (request, response) {
  console.log('Headers:\n', request.headers);
  console.log('Synced Locations:\n', request.body);
  console.log('------------------------------');
  io.emit('locations', request.body);
  response.sendStatus(200);
});

io.on('connection', function (socket) {
  console.log('a user connected');
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
