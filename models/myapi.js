var request = require('request');
var settings = require('../settings');
var fs = require('fs');
var JsonFileTools =  require('./jsonFileTools.js');
var sessionPath = './public/data/mysession.json';
var crypto = require('crypto');
var moment = require('moment');
var settings =  require('../settings.js');
var axios = require('axios');
var async = require('async');

var tmp = [{
            "length":6,
            "TYPE_ID":"10",
            "SERVICE_ID":"10",
            "DATA_0":"0",
            "DATA_1":"0",
            "time":"1502150400"
            }];
var servicePath = './public/data/service.json';
var serviceMap = JsonFileTools.getJsonFromFile(servicePath);

module.exports = {
    toLogin,
    getToken,
    getDeviceList,
    updateDevice,
    newDevice,
    deleteDevice,
    getEventList,
    getMapList,
    isExpired,
    getUserList,
    updateUser,
    newUser,
    deleteUser,
    changeUserPwd,
    changeSelfPwd,
    getZoneList,
    updateZone,
    newZone,
    deleteZone,
    getMonthEvent,
    getYearEvent
}

function getYearEvent(name, mac, yearStr, callback) {
    
    var num = 1;
    var rst = [];
    var allEsum = 0;
    async.forever(function(next){
        let monthStr = yearStr + '-' + toStr(num);
        let range= getMonthRangeTime(monthStr);
        getEventList(name, mac, range.startdate, range.enddate, function(err, result){
            if (!err) {
                if(result.data.length > 0) {
                    try {
                        //Desc result
                        let end = result.data[0];
                        let start = result.data[result.data.length - 1];
                        let diff = end.information.Esum- start.information.Esum;
                        allEsum = allEsum + diff;
                        rst.push( [monthStr, start.date, start.information.Esum, end.date, end.information.Esum, diff] );
                    } catch (error) {
                        console.log('getYearEvent(getEventList) : ' + error);
                    }
                }
            }
    
            if (num === 12) {
              err = 'finish';//If has err
            }
            ++num;
            if(err === 'finish') {
                rst.push(['總和', '', '', '', '', allEsum]);
                return callback(err, rst);
            } else if(err) {
                return callback(err, null);
            }
            next(err);
        });
    }, function(err){
        console.log('error!!!');
        console.log(err);
    });
}

function getMonthEvent(name, mac, monthStr, callback) {
    var range= getMonthRangeTime(monthStr);
    getEventList(name, mac, range.startdate, range.enddate, function(err,result){
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    })
}

function getMonthRangeTime (mStr) {
    var range = {};
    var startdate = new Date(mStr+'-01');
    //設定日期為第一天
    startdate.setDate(1);

    //取當日
    var enddate = new Date(mStr+'-01');

    //將月份移至下個月份
    enddate.setMonth(enddate.getMonth()+1);
    //設定為下個月份的第一天
    enddate.setDate(1);
    //將日期-1為當月的最後一天
    enddate.setDate(enddate.getDate()-1);
    range.startdate = getDateString(startdate);
    range.enddate = getDateString(enddate);
    return range;
}

function getToken(api_name, api_pw, callback) {
    var url = settings.api_server + settings.api_login;
    var form = { acc:api_name, pwd: api_pw,type: 0};
    request.post(url,{form:form},
        function(err, result) {
            if(err) {
                callback(err, null);
            }
            else {
                //console.log('flag : '+flag);
                //console.log('body type : '+typeof(result.body));
                var body= JSON.parse(result.body);
                //console.log(JSON.stringify(body));
                var code = body.responseCode;
                var authToken = body.authToken;
                var time = moment();
                time = time.add(1, 'days');
                time = time.toDate();
                var session = {name:api_name, "token": authToken, "expiration": time};
                if(code !== '000'){
                    callback(body.responseMsg, null);
                } else {
                    callback(null, session);
                }
            }
    });
}

function toLogin(api_name, api_pw, callback) {
    var url = settings.api_server + settings.api_login;
    var form = { acc:api_name, pwd: api_pw,type: 0};
    request.post(url,{form:form},
        function(err, result) {
            if(err) {
                callback(err, null);
            }
            else {
                //console.log('flag : '+flag);
                //console.log('body type : '+typeof(result.body));
                try {
                    var body= JSON.parse(result.body);
                    //console.log(JSON.stringify(body));
                    var code = body.responseCode;
                    var authToken = body.authToken;
                    
                    if(code !== '000'){
                        callback(body.responseMsg, null);
                    } else {
                        var time = moment();
                        time = time.add(1, 'days');
                        time = time.toDate();
                        var session = {name:api_name,"token": authToken, "expiration": time, role:body.role, zone: body.userInfo.pic};
                        callback(null, session);
                    }
                } catch (error) {
                    callback(error, null);
                }
            }
    });
}

function download (uri, filename){
    request.head(uri, function(err, res, body){
      if (err) callback(err, filename);
      else {
          var stream = request(uri);
          stream.pipe(
              fs.createWriteStream(filename)
                  .on('error', function(err){
                      //callback(error, filename);
                      stream.read();
                  })
              )
          .on('close', function() {
              // callback(null, filename);
          });
      }
    });
  };

function checkAndGetToken(name, callback) {
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    var hasExpiration = false;
    if(mySession && mySession.expiration) {
        var d = new Date(mySession.expiration);//UTC
        //console.log(d.getTime());
        var now = new Date();
        //console.log(now.getTime());
        hasExpiration = true;
    }

    if (hasExpiration == false || now.getTime() > d.getTime()) {
        return callback(null, null);
    } else {
        return callback(null, mySession);
    }
}

function isExpired(mySession) {
    var hasExpiration = false;
    if(mySession && mySession.expiration) {
        var d = new Date(mySession.expiration);//UTC
        //console.log(d.getTime());
        var now = new Date();
        //console.log(now.getTime());
        hasExpiration = true;
    }

    if (hasExpiration == false || now.getTime() > d.getTime()) {
        return true;
    } else {
        return false;
    }
}

function getDeviceList(name, callback) {
    //先取得裝置列表時進行token確認,getMapList就無須檢查
    checkAndGetToken(name, function(err, session) {
        if (err) {
            return callback(err, null);
        } else {
            if(session == null) {
                return callback('Token is null', null);
            } else {
                sendDeviceListRequest(session, function(err, result){
                    if(err){
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        }
    })
}

function getMapList(name, callback) {
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    sendMapListRequest(mySession, function(err, result){
        if(err){
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}

function sendMapListRequest(session, callback) {
    var token = session.token;
    var url = settings.api_server + settings.api_get_map_list;

    sendGetRequest(url, token, function(err, result){
        if(err){
            return callback(err, null);
        }
        return callback(null, result.data.data);
    });
}

//For user API ---------------------------------------------------- start
function newDevice (name, form, callback) {
    var url = settings.api_server + settings.api_device;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    sendPostRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function sendDeviceListRequest(session, callback) {
    var token = session.token;
    var url = settings.api_server + settings.api_get_device_list;
    if(session.role == 'generalUser') {
        url = url + '/3';
    }
    sendGetRequest(url, token, function(err, result){
        if(err){
            return callback(err, null);
        }
        return callback(null, result.data.mList);
    });
}

function updateDevice (name, form, callback) {
    var url = settings.api_server + settings.api_device;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    var json = {d: form.device_mac, name:form.device_name, status:form.device_status};
    json.token = mySession.token;
    sendPutRequest(url, json, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function deleteDevice (name, form, callback) {
    var url = settings.api_server + settings.api_device;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    sendDeleteRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

//For user API ---------------------------------------------------- end


function sendGetRequest(url, token, callback) {
    var encodeToken = encodeURIComponent(token);
    if (url.indexOf('?') > -1) {
        url = url + '&token=' + encodeToken;
    } else {
        url = url + '?token=' + encodeToken;
    }
    
    console.log('sendGetRequest url : ' + url);
    axios.get(url)
    .then(function (response) {
        // console.log(response);
        return callback(null, response);
    }) 
    .catch(function (error) {
        return callback(error.message, null);
    });
}

function sendPostRequest(url, form, callback) {
    console.log('sendPostRequest url : ' + url);
    console.log('sendPostRequest form : ' + JSON.stringify(form));
    axios.post(url, form)
    .then(function (response) {
        // console.log(response);
        var json = response.data;
        var code = json.responseCode;
        var msg = json.responseMsg;
        if (code == '000') {
            return callback(null, json);
        } else {
            return callback(msg, null);
        }
    }) 
    .catch(function (error) {
        return callback(error.message, null);
    });
}

function sendPutRequest(url, form, callback) {
    console.log('sendPutRequest url : ' + url);
    console.log('sendutRequest form : ' + JSON.stringify(form));
    axios.put(url, form)
    .then(function (response) {
        // console.log(response);
        var json = response.data;
        var code = json.responseCode;
        var msg = json.responseMsg;
        if (code == '000') {
            return callback(null, json);
        } else {
            return callback(msg, null);
        }
    }) 
    .catch(function (error) {
        return callback(error.message, null);
    });
}

function sendDeleteRequest(url, form, callback) {
    console.log('sendDeleteRequest url : ' + url);
    console.log('sendDeleteRequest form : ' + JSON.stringify(form));
    axios.delete(url,  { params: form })
    .then(function (response) {
        // console.log(response);
        var json = response.data;
        var code = json.responseCode;
        var msg = json.responseMsg;
        if (code == '000') {
            return callback(null, json);
        } else {
            return callback(msg, null);
        }
    }) 
    .catch(function (error) {
        return callback(error.message, null);
    });
}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

function getEventList(name, mac, startDate, endDate, callback) {
    var form = {macAddr:mac};
    var now = new Date();
    if(endDate == ''){
        endDate = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
    }
    var zoneOffset = now.getTimezoneOffset();
    //Jason modify for zone offset on 2019.7.8
    //var dateOffset = (1*1000); //1秒
    var dateOffset = -(8*60*60+1)*1000;
    var formatStr = "YYYY-MM-DD"
    //Start day + 1 exp: 2017/8/13  => 2017/8/14 00:00:00
    var toMoment = moment(endDate,"YYYY-MM-DD").add(1,'days');
    // var toMoment = moment(endDate,"YYYY-MM-DD");
    var to = moment(toMoment,"YYYY-MM-DD").toDate();
    to.setTime(to.getTime() - dateOffset);
    form.to = to.toISOString();
    var range2 = moment(endDate,"YYYYMMDD").format("YYYYMMDD");
    //console.log('to : '+timeConverter(to));

    if(startDate.length == ''){
        var fromMoment = moment(endDate,"YYYY/MM/DD").subtract(30,'days');;
        startDate =  fromMoment.format("YYYY/MM/DD");
        //startDate = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
    }
    var from = moment(startDate,"YYYY/MM/DD").toDate();
    from.setTime(from.getTime() - dateOffset);
    form.from = from.toISOString();
    var range1 = moment(startDate,"YYYYMMDD").format("YYYYMMDD");
    var range = range1 + '-' + range2;

    checkAndGetToken(name, function(err, session) {
        if (err) {
            return callback(err, null);
        } else {
            if (session == null) {
                return callback('Token is null', null);
            } else {
                var token = session.token;
                form.token = token;
                sendEventListRequest(form, function(err, result){
                    if(err){
                        return callback(err, null);
                    } else {
                        return callback(null, result);
                    }
                });
            }
        }
    })
}

function sendEventListRequest(form, callback) {
    var url = settings.api_server + settings.api_get_event_list;

    console.log('sendEventListRequest : ' + JSON.stringify(form));
    var token = form.token;
    url = url + '?paginate=false&limit=5000&sort=desc';
    url = url + '&macAddr=' + form.macAddr;
    url = url + '&from=' + form.from;
    url = url + '&to=' + form.to;
    // url = url + '&sort=asc';

    sendGetRequest(url, token, function(err, result){
        if(err){
            return callback(err, null);
        }
        return callback(null, result.data);
    });
}

function getTimeName(timestamp) {
    var date = new Date(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();
    let hour = date.getHours();
    return year + toStr(month) + toStr(day) + toStr(hour);
}

function toStr(value) {
    let str = '';
    if (value < 10) {
        str = '0' + value;
    } else {
        str = value;
    }
    // node.warn(str);
    return str;
}

function dateConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp*1000);
  return getDateString(a);
}

function getDateString (mDate) {
    var year = mDate.getFullYear();
    var month = mDate.getMonth()+1;
    var date = mDate.getDate();
    var date = year +'-'+ toStr(month)+'-'+ toStr(date);
    return date;
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp*1000);
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = hour + ':' + min + ':' + sec ;
  return time;
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function getDataList(list){
    var arr = [];
    for(var i = 0;i<list.length;i++){
        arr.push(getData(list[i]));
    }
    return arr;
}

function getData(json){
    var arr = [];
    var arrData = json._source.data;
    if( getType(arrData) !== 'array' ){
        arrData = tmp;
    }
    var data = arrData[0];
    var account = json._source.account;
    var reportTime = moment(json._source.report_timestamp, 'YYYY-MM-DD hh:mm:ss');
    var myDate = reportTime.format('YYYY-MM-DD');
    var myTime = reportTime.format('hh:mm:ss');
    //arr.push(timeConverter(data.time));

    arr.push(account.mac);
    arr.push(account.gid);
    //console.log(typeof(reportTime));
    //arr.push(dateConverter(data.time));
    //arr.push(timeConverter(data.time));
    arr.push(myDate);
    arr.push(myTime);
    arr.push(data.SERVICE_ID);
    arr.push(serviceMap[data.SERVICE_ID]);
    arr.push(data.length);
    arr.push(data.DATA_0);
    arr.push(data.DATA_1);
    return arr;
}

//For user API ---------------------------------------------------- start
function newUser (name, form, callback) {
    var url = settings.api_server + settings.api_users_register;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    sendPostRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function getUserList(name, callback) {
    var url = settings.api_server + settings.api_users;
    var token;
    try {
        var obj = JsonFileTools.getJsonFromFile(sessionPath);
        var mySession = obj[name];
        token = mySession.token;
    } catch (error) {
        return callback(error, null);
    }
    
    sendGetRequest(url, token, function(err, result){
        if(err){
            return callback(err, null);
        }
        return callback(null, result.data.users);
    });
}

function updateUser (name, form, callback) {
    var url = settings.api_server + settings.api_users;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    
    sendPutRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function deleteUser (name, form, callback) {
    var url = settings.api_server + settings.api_users;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    sendDeleteRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function changeUserPwd (name, user, callback) {
    var url = settings.api_server + settings.api_users+'/changePwd/'+user.userId;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    var form = {};
    form.pwd = user.pwd;
    form.token = mySession.token;
    sendPutRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function changeSelfPwd (name, form, callback) {
    var url = settings.api_server + settings.api_users+'/changePwd';
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    sendPutRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}
//For user API ---------------------------------------------------- end

//For Zone API ---------------------------------------------------- start
function newZone (name, form, callback) {
    var url = settings.api_server + settings.api_zones;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.createUser = name;
    form.token = mySession.token;
    sendPostRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function getZoneList(name, callback) {
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    var token = mySession.token;
    var url = settings.api_server + settings.api_zones;

    sendGetRequest(url, token, function(err, result){
        if(err){
            return callback(err, null);
        }
        return callback(null, result.data.data);
    });
}

function updateZone (name, form, callback) {
    var url = settings.api_server + settings.api_zones;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    form.updateUser = name;
    
    sendPutRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}

function deleteZone (name, form, callback) {
    var url = settings.api_server + settings.api_zones;
    var obj = JsonFileTools.getJsonFromFile(sessionPath);
    var mySession = obj[name];
    form.token = mySession.token;
    sendDeleteRequest(url, form, function(err, result) {
        if(err) {
            return callback(err, null);
        }
        return callback(null, result);
    });
}
//For Zone API ---------------------------------------------------- end