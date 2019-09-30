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

app.post('/headless', function (request, response) {
  console.log('--------------headless----------------');
  console.log('Headers:\n', request.headers);
  console.log('Locations:\n', request.body);
  console.log('------------------------------', request.body[0].user);


  console.log('Last loc :' + JSON.stringify(request.body[0]));



  io.emit('locations', request.body);
  response.sendStatus(200);
});

app.post('/action', function (request, response) {
  console.log('-------------- action ----------------');
  console.log('Headers:\n', request.headers);
  console.log('action:\n', request.body);
  console.log('------------------------------');

  io.emit('action', request.body);
  response.sendStatus(200);
});

app.post('/location', function (request, response) {
  console.log('-------------- location ----------------');
  console.log('Headers:\n', request.headers);
  console.log('location:\n', request.body);
  console.log('------------------------------');

  lastLocations[request.body.user.uuid] = request.body;

  io.emit('location', request.body);
  response.sendStatus(200);
});

app.post('/locations', function (request, response) {
  console.log('--------------locations----------------');
  console.log('Headers:\n', request.headers);
  console.log('Locations:\n', request.body);
  console.log('------------------------------', request.body[0].user);

  request.body.slice(-1);

  var i = 0;
  for (var loc in request.body) {
    request.body[i].backSync = false;
    i++;
  }

  //lastLocations[request.body[0].user.uuid] = request.body;

  // console.log('Last loc :' + JSON.stringify(lastLocations[request.body[0].user.uuid]));

  var channel = request.headers['x-channel'];
  if (channel !== undefined || channel != "")
    channel = channel + "/";
  else
    channel = "";

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

  var channel = request.headers['x-channel'];
  if (channel != undefined || channel != "")
    channel = channel + "/";
  else
    channel = "";

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
