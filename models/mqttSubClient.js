var mqtt = require('mqtt');
var config = require('../settings.js');
var util = require('./util.js');
var schedule = require('node-schedule');
var io = require('socket.io-client');
var socket = io.connect('http://localhost:8080', {reconnect: true});

socket.on('connect',function(){
    socket.emit('mqtt_sub','hello,mqtt_sub socket cient is ready');
});

/*function scheduleCronstyle(){
    schedule.scheduleJob('30 25 11 * * *', function(){
				console.log('scheduleCronstyle:' + new Date());
				util.sendAdminLineMessage();
    });
}

scheduleCronstyle();*/

//Jason add for fix Broker need to foward message to subscriber on 2018-04-01
var options = {
	username: config.mqttName,
	password: config.mqttPassword,
	port: config.mqttPort,
	host: config.mqttHost,
	protocolId: 'MQIsdp',
	protocolVersion: 3
};

var client = mqtt.connect(options);
client.on('connect', function()  {
	console.log(new Date() + ' ****** MQTT Sub connection');
    client.subscribe(config.mytopic);
});

client.on('message', function(topic, msg) {
	//Parse and save to final.json
	util.parseMsgd(msg.toString(), function(err, message){

		if(err) {
			console.log(util.getCurrentTime() + err);
			return;
		} else {
			// console.log(new Date() + ' ****** topic:'+topic);
			console.log('MQTT message:' + msg.toString());
			console.log('parseMsgd:' + JSON.stringify(message));
			if (message) {
				socket.emit('update_sensor_status', message);
				console.log(util.getCurrentTime() + ' *** Publish parse and sendmessage OK');
			}
			return;
		}
	  });
});

client.on('disconnect', function() {
	console.log(new Date() + ' ****** mqtt disconnect' );
});
