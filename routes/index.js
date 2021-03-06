﻿var express = require('express');
var router = express.Router();
var myapi =  require('../models/myapi.js');
var settings = require('../settings');
var JsonFileTools =  require('../models/jsonFileTools.js');
var util =  require('../models/util.js');
var sessionPath = './public/data/session.json';
var mysessionPath = './public/data/mysession.json';
var profilePath = './public/data/profile.json';
var autoPath = './public/data/auto.json';
var deviceListPath = './public/data/deviceList.json';
var dataPath = './public/data/data.json';
var finalPath = './public/data/final.json';
var async = require('async');
var axios = require('axios');

module.exports = function(app) {
  app.get('/', checkLogin);
  app.get('/', function (req, res) {

	var profileObj;
	try {
		profileObj = JsonFileTools.getJsonFromFile(profilePath);
		if (profileObj == null) {
			profileObj = {};
			JsonFileTools.saveJsonToFile(profilePath, profileObj);
		}
	} catch (error) {
		profileObj = {};
		JsonFileTools.saveJsonToFile(profilePath, profileObj);
	}
	getData(req.session.user.name, function(err, data){
		if(err) {
			res.render('index', { title: 'Index',
				user:req.session.user,
				sensorList: [],
				zoneList: [],
				profile: profileObj
			});
		} else {
            res.render('index', { title: 'Index',
				user:req.session.user,
				sensorList: data.sensorList,
				zoneList: data.zoneList,
				profile: profileObj
			});
		}
	});
  });

  app.get('/report', checkLogin);
  app.get('/report', function (req, res) {
	var profileObj, data;
	try {
		profileObj = JsonFileTools.getJsonFromFile(profilePath);
		if (profileObj == null) {
			profileObj = {};
			JsonFileTools.saveJsonToFile(profilePath, profileObj);
		}
	} catch (error) {
		profileObj = {};
		JsonFileTools.saveJsonToFile(profilePath, profileObj);
	}
	try {
		data = JsonFileTools.getJsonFromFile(dataPath);
		if (data == undefined || data == null) {
			return res.redirect('/');
		}
	} catch (error) {
		return res.redirect('/');
	}

	res.render('report', { title: 'Report',
		user:req.session.user,
		sensorList: data.sensorList,
		zoneList: data.zoneList,
		profile: profileObj
	});
  });

  app.get('/login', checkNotLogin);
  app.get('/login', function (req, res) {
	//Reset data to empty
	try {
		JsonFileTools.saveJsonToFile(dataPath, {});
	} catch (error) {
		JsonFileTools.saveJsonToFile(dataPath, {});
	}
	req.session.user = null;
  	// var name = req.flash('post_name').toString();
	res.render('user/login', { title: 'Login',
		error: ''
	});
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function (req, res) {
  	var post_name = req.body.account;
	var	post_password = req.body.password;
	var successMessae,errorMessae;
  	console.log('Debug login post -> name:'+post_name);
	console.log('Debug login post -> password:'+post_password);
	myapi.toLogin(post_name, post_password, function(err, result) {
		if(err) {
			res.render('user/login', { title: 'Login',
				error: err
			});
		} else {
			var sessionObj;
			try {
				sessionObj = JsonFileTools.getJsonFromFile(mysessionPath);
			} catch (error) {
				sessionObj = {};
			}
            sessionObj[result.name] = result;
			JsonFileTools.saveJsonToFile(mysessionPath, sessionObj);
			req.session.user = result;
			return res.redirect('/');
		}
	})
  });

  app.get('/logout', function (req, res) {
	var name = '', sessionObj = {};
	try {
		if(req.session.user) {
			name = req.session.user.name;
		}
		sessionObj = JsonFileTools.getJsonFromFile(mysessionPath);
		if(name.length > 0) {
			delete obj[name];
		}
	} catch (error) {
		sessionObj = {};
	}
	JsonFileTools.saveJsonToFile(mysessionPath, sessionObj);
    req.session.user = null;
    req.flash('success', '');
    res.redirect('/login');
  });

    app.get('/account', checkLogin);
    app.get('/account', function (req, res) {

		console.log(util.getCurrentTime() + ' render to account.ejs');
		var myuser = req.session.user;
		var successMessae,errorMessae;
		
		async.series([
			function(next){
				myapi.getUserList(myuser.name, function(err2, result2){
					next(err2, result2);
				});
			},
			function(next){
				myapi.getZoneList(myuser.name, function(err3, result3){
					next(err3, result3);
				});
			}
		], function(errs, results){
			if(errs) {
				return callback(errs, null);
			} else {
				// console.log(results);   // results = [result1, result2, result3]
				var users = results[0];
				var zoneList = results[1];//map list
				var newUsers = [];
				for(var i=0;i<  users.length;i++){
					//console.log('name : '+users[i]['name']);
					if( users[i]['userName'] == 'sysAdmin' || users[i]['userName'] == 'ndhuAdmin'){
						continue;
					}
					newUsers.push(users[i]);
				}
				res.render('user/account', { title: 'Account', // user/account
					user: myuser,//current user : administrator
					users: newUsers,//All users
					zones: zoneList,
					error: errorMessae,
					success: successMessae
				});
			}
		});
	});

	app.post('/account', checkNotLogin);
    app.post('/account', function (req, res) {
		res.redirect('/account');
	});
	
	app.get('/changeSelfPwd', checkLogin);
    app.get('/changeSelfPwd', function (req, res) {

		console.log(util.getCurrentTime() + ' render to account.ejs');
		var successMessae,errorMessae;
		
		res.render('user/changeSelfPwd', { title: 'ChangeSelfPwd', // user/account
			user: req.session.user,
			error: errorMessae,
			success: successMessae
		});
	});

	app.post('/changeSelfPwd', checkNotLogin);
    app.post('/changeSelfPwd', function (req, res) {
		res.redirect('/changeSelfPwd');
    });


	app.get('/map', checkLogin);
	app.get('/map', function (req, res) {
		var postType = req.flash('type').toString();
		var successMessae,errorMessae;
		errorMessae = req.flash('error').toString();
		var name = req.session.user.name;
		myapi.getMapList(name, function(err, result){
			if(err) {
                return res.redirect('/login');//返回登入頁
			}
            return res.render('map', { title: 'Map',
				user:req.session.user,
				target:null,//current map
				maps: result,//All maps
				error: errorMessae,
				success: successMessae
			});
		});
	});

	app.post('/map', checkLogin);
  	app.post('/map', function (req, res) {
  		var	postType = req.body.postType;
		var postSelect = req.body.postSelect;
		var user = req.session.user;
	    var token = encodeURI(user.token);
		var error = '';
		var mapObj = {};
		var fieldNameObj = {};
		if (postSelect == 'new' || postSelect == 'edit') {
			try {
				var field = req.body.field;
				var start = req.body.start;
				var	end = req.body.end;
				var method = req.body.method;
				var fieldName = req.body.fieldName;

				if (field) {
					if (field && typeof(field) === 'string') {
						mapObj[field] = [Number(start), Number(end), method];
						fieldNameObj[field] = fieldName;
					} else {
						for (let i=0; i<field.length; ++i) {
							//New map if exist has same data
							if(mapObj[field]) {
								req.flash('error', '輸入感測類型重複');
								return res.redirect('/map');
							}
							mapObj[field[i]] = [Number(start[i]), Number(end[i]), method[i]];
							fieldNameObj[field[i]] = fieldName[i];
						}
					}
				}
			} catch (error) {
				console.log(error);
				req.flash('error', error);
				return res.redirect('/map');
				return;
			}

		}

		console.log('postType:' + postType);
		console.log('postSelect:' + postSelect);
		var url = settings.api_server + settings.api_get_map_list;

		if(postSelect == "del"){//Delete mode
			//Del map
			axios.delete(url, {
				data: {
					token:token,
					deviceType: postType
				  }
				})
			.then(function (response) {
				console.log(response.data);
				if (response.data.responseCode === '000') {
					return res.redirect('/map');
				} else {
					req.flash('error', response.data.responseMsg);
					return res.redirect('/map');
				}
			})
			.catch(function (error) {
				req.flash('error', error);
				return res.redirect('/map');
			});

		}else if(postSelect == "new"){//New account
			//new map
			axios.post(url, {
				    token: token,
					deviceType: postType,
					typeName: req.body.typeName,
					fieldName: fieldNameObj,
					map: mapObj,
					createUser: user.name
				})
			.then(function (response) {
				console.log(response.data);
				if (response.data.responseCode === '000') {
					req.flash('error', '');
					return res.redirect('/map');
				} else {
					req.flash('error', response.data.responseMsg);
					return res.redirect('/map');
				}
			})
			.catch(function (error) {
				req.flash('error', error);
				return res.redirect('/map');
			});

	    }else if(postSelect == "edit"){
			//Edit
			axios.put(url, {
					token:token,
					deviceType: postType,
					typeName: req.body.typeName,
					fieldName: fieldNameObj,
					map: mapObj,
					updateUser: user.name
				})
			.then(function (response) {
				console.log(response.data);
				if (response.data.responseCode === '000') {
					return res.redirect('/map');
				} else {
					req.flash('error', response.data.responseMsg);
					return res.redirect('/map');
				}
			})
			.catch(function (error) {
				req.flash('error', error);
				return res.redirect('/map');
			});
		} else {
			//Select map
			req.flash('error', '');
			return res.redirect('/map');
		}
	  });

	app.get('/device', checkLogin);
	app.get('/device', function (req, res) {

		console.log('render to account.ejs');
		var refresh = req.flash('refresh').toString();
		var myuser = req.session.user;
		var successMessae,errorMessae;

		myapi.getDeviceList(myuser.name, function(err, devices){
			if(err){
				errorMessae = err;
			}

			res.render('device', { title: 'Device', // user/account
				user:myuser,//current user : administrator
				devices: devices,//All users
				error: errorMessae,
				success: successMessae
			});
		});
	});

	app.post('/device', checkNotLogin);
	app.post('/device', function (req, res) {
		res.redirect('/device');
	});

	app.get('/zone', checkLogin);
	app.get('/zone', function (req, res) {

		console.log('render to account.ejs');
		var refresh = req.flash('refresh').toString();
		var myuser = req.session.user;
		var successMessae,errorMessae;
		async.series([
			function(next){
				myapi.getDeviceList(myuser.name, function(err2, result2){
					next(err2, result2);
				});
			},
			function(next){
				myapi.getZoneList(myuser.name, function(err3, result3){
					next(err3, result3);
				});
			}
		], function(errs, results){
			if(errs) {
				console.log('???? get zone errors ----');
				console.log(errs);
				res.render('zone', { title: 'Zone', // user/account
					user:myuser,//current user : administrator
					devices: [],//All devices
					zones: [],
					error: errs,
					success: successMessae
				});
			} else {
				// console.log(results);   // results = [result1, result2, result3]
				var sensorList = results[0];
				var zoneList = results[1];//map list
				res.render('zone', { title: 'Zone', // user/account
					user:myuser,//current user : administrator
					devices: sensorList,//All devices
					zones: zoneList,
					error: errorMessae,
					success: successMessae
				});
			}
		});
	});

	app.post('/zone', checkNotLogin);
	app.post('/zone', function (req, res) {
		res.redirect('/device');
	});
};

function checkLogin(req, res, next) {
	if(myapi.isExpired(req.session.user)) {
		//Expired is true
		res.redirect('/logout');//返回登入頁
	} else {
		next();
	}
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Have login!');
    res.redirect('back');//返回之前的页面
  } else {
	  next();
  }
}

function getData(username, callback) {
	var data;
	try {
		getCloudData(username, function(err, result){
			if(err){
				return callback(err, {});
			}
			return callback(null, result);
		})
	} catch (error) {
		JsonFileTools.saveJsonToFile(dataPath, {});
		return callback(error, {});
	}
}

function getCloudData(name, callback) {
    async.series([
		function(next){
			myapi.getDeviceList(name, function(err1, result1){
				next(err1, result1);
			});
		},
		function(next){
			myapi.getMapList(name, function(err2, result2){
				next(err2, result2);
			});
		},
		function(next){
			myapi.getZoneList(name, function(err3, result3){
				next(err3, result3);
			});
		}
	], function(errs, results){
		if(errs) {
			return callback(errs, null);
		} else {
			// console.log(results);   // results = [result1, result2, result3]
			var sensorList = results[0];
			for (let m in sensorList) {
				let sensor = sensorList[m];
				sensor.monthPower = 0;
				sensor.startPower = 0;
			}
			var mapList = results[1];//map list
			var mapObj = {};
			if(mapList) {
				for (let i=0; i < mapList.length; ++i) {
					mapObj[mapList[i]['deviceType']] = mapList[i]['typeName'];
				}
			}
			if (sensorList) {
				for (let j=0; j < sensorList.length; ++j) {
					let sensor = sensorList[j];
					sensor['device_mac'] = sensor['device_mac'].toLowerCase();
					sensor['typeName'] = mapObj[sensor['fport']];
				}
			}
			var zoneList = results[2];//zone list
			var data = {sensorList: sensorList,
						mapList: mapList, 
						zoneList: zoneList
					};
			try {
				JsonFileTools.saveJsonToFile(dataPath, data);
			} catch (error) {
				JsonFileTools.saveJsonToFile(dataPath, {});
			}
			return callback(null, data);
		}
	});
}