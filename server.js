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

  console.log('Headers:\n', req.headers);

  // setTimeout(function () {
  //   for (var prop in lastLocations) {
  //     if (lastLocations.hasOwnProperty(prop)) {
  //       console.log(prop + ' -> ', lastLocations[prop]);
  //       io.emit('locations', lastLocations[prop]);
  //     }
  //   }
  // }, 2000);

  res.sendFile(__dirname + '/index.html');
});

app.post('/locations', function (request, response) {
  console.log('--------------locations----------------');
  console.log('Headers:\n', request.headers);
  console.log('Locations:\n', request.body);
  console.log('------------------------------', request.body[0].user);

  var i = 0;
  for (var loc in request.body) {
    request.body[i].backSync = false;
    i++;
  }

  lastLocations[request.body[0].user.uuid] = request.body;

 // console.log('Last loc :' + JSON.stringify(lastLocations[request.body[0].user.uuid]));

  io.emit('locations', request.body);
  response.sendStatus(200);
});

app.post('/sync', function (request, response) {
  console.log('------------sync------------------');
  console.log('Headers:\n', request.headers);
  console.log('Synced Locations:\n', request.body);
  console.log('------------------------------');

  var i = 0;
  for (var loc in request.body) {
    request.body[i].backSync = true;
    i++;
  }

  lastLocations[request.body[0].user.uuid] = request.body;

  io.emit('locations', request.body);
  response.sendStatus(200);
});

io.on('connection', function (socket) {
  console.log('a user connected ');

  for (var prop in lastLocations) {
    if (lastLocations.hasOwnProperty(prop)) {
      console.log(prop + ' -> ', lastLocations[prop].length);
      io.emit('locations', lastLocations[prop]);
    }
  }

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
