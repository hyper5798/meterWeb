var mqtt = require('mqtt');
var config = require('../settings.js');



module.exports = {
    sendMessage
}

function sendMessage(topic, message) {
	var options = {
		username: config.mqttName,
        password: config.mqttPassword,
		port: config.mqttPort,
		host: config.mqttHost,
		protocolId: 'MQIsdp',
		protocolVersion: 3
	};
	var client = mqtt.connect(options);
	client.on('connect', () => {
		// publish 'Hello mqtt' to 'test'
		console.log('connect to mqtt');
		// message = 'test';
		client.publish(topic, message);

		// terminate the client
		// client.end();
	})
}