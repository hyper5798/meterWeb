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

function returnEventData(res, queryType, err, result) {
	if (err)
		return res.send({queryType: queryType, reponseCode:999, responseMsg:err});
	var data = result.data;
	var events;
	//Sort the event list
	if(queryType == 'queryThisMonthEvent' || queryType == 'queryMonthEvent') {
		events = data.sort(dynamicSort('date'));
	} else {
		//events = data.sort(dynamicSort('-date')); //desc
		events = data.sort(dynamicSort('-date'));//asc
	}  
	result.data = events;
	result.queryType = queryType;
	// value[mac] = results;
	return res.json(result);
}

router.route('/query')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var mac = req.	query.mac;
		var to  = req.query.to;
		var from = req.query.from;
		var userName = req.query.userName;
		var queryType = req.query.queryType;
		
		mac = mac.toLowerCase();

		if(queryType == 'queryYearEvent') {
			myapi.getYearEvent(userName, mac, from, function(err,result){
				if (err & err != 'finish')
					return res.send({queryType: queryType, reponseCode:999, responseMsg:err});
				return res.json({queryType: queryType,reponseCode:000, data: result});
			});
		} else if(queryType == 'queryMonthEvent') {
			myapi.getMonthEvent(userName, mac, from, function(err,result){
				returnEventData(res, queryType, err, result);
			});
		} else {
			myapi.getEventList(userName, mac, from, to, function(err,result){
				returnEventData(res, queryType, err, result);
			});
		}
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
			newUser.createUser = userName;
			myapi.newUser(userName, newUser, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'delUser') {
			var form = {delUserId: newUser.userId, userName:newUser.userName, createUser: userName};
			myapi.deleteUser(userName, form, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'updateUser') {
			// var form = {delUserId: newUser.userId};
			var form = {mUserId: newUser.userId, catId:newUser.cpId, roleId: newUser.roleId,userBlock: newUser.userBlock,pic: newUser.pic};
			form.createUser = userName;
            form.userName = newUser.userName;
			myapi.updateUser(userName, form, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		}
 
	});

//changeSlfPwd
router.route('/changeSelfPwd')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var newUser = JSON.parse(req.query.updateUser);
		var queryType = req.query.queryType;
		myapi.changeSelfPwd(newUser.name, newUser, function(err, result){
			if(err) {
				return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
			}
			result.queryType = queryType;
			return res.json(result);
		});
	});

router.route('/changeUserPwd')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var userName = req.query.userName;
		var newUser = JSON.parse(req.query.updateUser);
		var queryType = req.query.queryType;
		myapi.changeUserPwd(userName, newUser, function(err, result){
			if(err) {
				return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
			}
			result.queryType = queryType;
			return res.json(result);
		});
	});

router.route('/device')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var userName = req.query.userName;
		var target = JSON.parse(req.query.target);
		var queryType = req.query.queryType;
		if (queryType == 'addDevice') {
			target.d =  '00000000' + target.d.toLowerCase();
			myapi.newDevice(userName, target, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'delDevice') {
			var form = {delDeviceId: target.deviceId, mac: target.device_mac, name: target.device_name};
			myapi.deleteDevice(userName, form, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'updateDevice') {
			// var form = {delUserId: newUser.userId};
			myapi.updateDevice(userName, target, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		}
 
	});

router.route('/zone')

	// get all the bears (accessed at GET http://localhost:8080/api/bears)
	.get(function(req, res) {
		var userName = req.query.userName;
		var target = JSON.parse(req.query.target);
		var queryType = req.query.queryType;
		if (queryType == 'addZone') {
			target.zoneId =  new Date().getTime().toString();
			myapi.newZone(userName, target, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'delZone') {
			
			myapi.deleteZone(userName, target, function(err, result){
				if(err) {
					return res.json({queryType: queryType,responseCode:"999", responseMsg: err});
				}
				result.queryType = queryType;
				return res.json(result);
			});
		} else if (queryType == 'updateZone') {
			// var form = {delUserId: newUser.userId};
			myapi.updateZone(userName, target, function(err, result){
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