var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var todos = require('./routes/todos');//Jason add on 2016.09.26
var routes = require('./routes/index');
var todos = require('./routes/todos');//Jason add on 2017.02.21
//Jason add on 2017.02.16 - start
//var RED = require("node-red");
var http = require('http'),
    https = require('https');
var session = require('express-session');
var settings = require('./settings');
var flash = require('connect-flash');
var cors = require('cors');
var mqttClient =  require('./models/mqttClient.js');
var mqttSubClient =  require('./models/mqttSubClient.js');
var JsonFileTools =  require('./models/jsonFileTools.js');
var finalPath = './public/data/final.json';
var mySocket = null;
//Jason add on 2017.02.16 - end
var app = express();

var port = process.env.PORT || 8080;
console.log('Server listen port :'+port);
app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(cors());

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/todos', todos);
app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  resave: false,
  saveUninitialized: true
}));
app.use('/todos', todos);
routes(app);
var server = http.createServer(app);

server.listen(port);


var io = require('socket.io').listen(server.listen(port));

io.sockets.on('connection', function (socket) {
  // mySocket = socket;
  // socket.emit() ：向建立该连接的客户端广播
  // socket.broadcast.emit() ：向除去建立该连接的客户端的所有客户端广播
  // io.sockets.emit() ：向所有客户端广播，等同于上面两个的和
  socket.emit('news', { hello: 'world' });
  socket.on('switch_command', function (data) {
    console.log(typeof data);
    var mac = data.mac;
    var cmd = data.cmd;
    // var cmd_off = '010F000000080100FE9';
    // var cmd_on = '010F0000000801013F55';
    let tmp = {"macAddr": mac,"data": cmd,"id":"1111111111","extra":{"port":1,"txpara":"22"}};
    var message = JSON.stringify([tmp]);
    var topic = 'GIOT-GW/DL/00001c497b432155';
    mqttClient.sendMessage(topic, message);
  });

  socket.on('mqtt_sub', function (data) {
    console.log(data);
  });//send_switch_command

  socket.on('send_switch_command', function (data) {
    console.log('send_switch_command : ' + JSON.stringify(data));
    var mac = data.mac;
    var switch_mac = data.switch_mac;
    var cmd = data.command;
    var gwid = data.gwid;
    let tmp = {"macAddr": switch_mac,"data": cmd,"id":"1111111111","extra":{"port":1,"txpara":"22"}};
    var message = JSON.stringify([tmp]);
    var topic = 'GIOT-GW/DL/'+ gwid;
    mqttClient.sendMessage(topic, message);
  });

  socket.on('update_sensor_status', function (data) {
    socket.broadcast.emit('update_status', data);
  });

  socket.on('disconnect', function () {
    console.log('???? socket disconnect id : ' + socket.id);
  });
});
