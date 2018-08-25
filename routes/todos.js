var express = require('express');
var async = require('async');
var router = express.Router();
var JsonFileTools =  require('../models/jsonFileTools.js');
var moment = require('moment');
var myapi =  require('../models/myapi.js');
var deviceListPath = './public/data/deviceList.json';
var profilePath = './public/data/profile.json';
var autoPath = './public/data/auto.json';
var schedule = require('node-schedule');
var jobs = {};
var test = false;

router.route('/query')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var mac = req.query.mac;
		var to  = req.query.to;
		var from = req.query.from;
		var userName = req.query.userName;
		var queryType = req.query.queryType;
		mac = mac.toLowerCase();
		myapi.getEventList(userName, mac, from, to, function(err,result){
			if (err)
				return res.send({queryType: queryType, reponseCode:999, responseMsg:err});
			var data = result.data;
			var events;
			//Sort the event list
			if(queryType == 'queryEvent') {
				//events = data.sort(dynamicSort('-date')); //desc
				events = data.sort(dynamicSort('-date'));//asc
			} else if(queryType == 'queryThisMonthEvent') {
				events = data.sort(dynamicSort('date'));
			}
			result.data = events;
			result.queryType = queryType;
			// value[mac] = results;
			return res.json(result);
		});
	});

router.route('/setting')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var userName = req.query.userName;
		var profile = JSON.parse(req.query.profile);
		var profileObj;
		try {
			profileObj = JsonFileTools.getJsonFromFile(profilePath);
			if (profileObj == null) {
				profileObj = {};
			}
		} catch (error) {
			profileObj = {};
		}
		profileObj[userName] = profile;
		try {
			JsonFileTools.saveJsonToFile(profilePath, profileObj);
		} catch (error) {
			profileObj = {};
		}
		return res.json(profileObj);
	});

router.route('/user')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var userName = req.query.userName;
		var newUser = JSON.parse(req.query.newUser);
		var queryType = req.query.queryType;
		if (queryType == 'addUser') {
			myapi.newUser(userName, newUser, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'delUser') {
			var form = {delUserId: newUser.userId};
			myapi.deleteUser(userName, form, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'updateUser') {
			// var form = {delUserId: newUser.userId};
			myapi.updateUser(userName, newUser, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		}
 
	});

module.exports = router;

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}