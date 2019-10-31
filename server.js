var app = require('express')();

var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

const parseGpx = require('parse-gpx');
var sabotinGpx = {};

let file = './gpx/Sabotin_28km.GPX';

parseGpx(file).then(track => {
  console.log("gpx loaded..."); 
  sabotinGpx = track;
});

global.lastLocations = [];

// parse application/json
app.use(bodyParser.json({ type: '*/*', limit: "50mb" })); // force json

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
  console.log('Headers:\n' + JSON.stringify(request.headers));
  console.log('action:\n' + JSON.stringify(request.body));
  console.log('------------------------------');

  //lastLocations[request.body.user.uuid] = request.body;

  io.emit('action', request.body);
  response.sendStatus(200);
});

app.post('/location', function (request, response) {
  console.log('-------------- location ----------------');
  console.log('Headers:\n' + JSON.stringify(request.headers));
  console.log('location:\n', JSON.stringify(request.body));
  console.log('------------------------------');

  lastLocations[request.body.user.uuid] = request.body;
  request.body.history = false;
  io.emit('location', request.body);
  response.sendStatus(200);
});

app.post('/locationsX', function (request, response) {
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

app.post('/syncX', function (request, response) {
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
  console.log('a user connected ' + socket.id + " " + socket.handshake.address);

  for (var prop in lastLocations) {
    if (lastLocations.hasOwnProperty(prop)) {
      console.log(prop + ' -> ', lastLocations[prop]);
      lastLocations[prop].history = true;
      io.emit('location', lastLocations[prop]);
    }
  }

  io.emit('gpx', sabotinGpx);

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});


function exitHandler(options, err) {
  if (options.cleanup) {
    console.log('** server closing down ...');
  }
  if (err)
    console.log(err.stack);
  if (options.exit)
    process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));