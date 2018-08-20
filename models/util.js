var moment = require('moment-timezone');
var JsonFileTools =  require('./jsonFileTools.js');
var autoPath = './public/data/auto.json';
var finalPath = './public/data/final.json';
var dataPath = './public/data/data.json';
var config = require('../settings.js');
module.exports = {
    parseMsgd,
    getCurrentTime,
    getAutoSettingCheck
}

function parseMsgd(message, callback) {
    var obj = null;
    try {
        if (getType(message) === 'string') {
            var mesObj = JSON.parse(message);
            if (getType(mesObj) === 'array') {
                obj = mesObj[0];
            } else if (getType(mesObj) === 'object') {
                obj = mesObj;
            }
        } else if (getType(message) === 'array'){
            obj = message[0];
        } else if (getType(mesObj) === 'object') {
            obj = message;
        }
        var mMac  = obj.macAddr;
        
    } catch (error) {
        return callback(error, null);
    }
    var fport = obj.fport.toString();
    //Get data attributes
    var mData = obj.data;
    var utcMoment = moment.utc(obj.time);
    var timestamp = utcMoment.valueOf();
    var tMoment = (moment.unix(timestamp/1000)).tz(config.timezone);
    var mDate = tMoment.format('YYYY-MM-DD HH:mm:ss');
    // var mRecv = obj.time;
    // var mRecv = new Date( utcMoment.format("YYYY-MM-DDTHH:mm:ss") );
    var mRecv = obj.time;

    console.log('mRecv : '+  mRecv);
    console.log('mDate : '+ mDate);
    var mExtra = {'gwip': obj.gwip,
                'gwid': obj.gwid,
                'rssi': obj.rssi,
                'snr' : obj.snr,
                'fport': obj.fport,
                'frameCnt': obj.frameCnt,
                'channel': obj.channel};

    //Parse data
    // if(mExtra.fport){
    if(mExtra.fport){
        var mType = mExtra.fport.toString();
        var map = getMap(mType);
        // var map = getMap("39");
        if (map) {
            var mInfo = getTypeData(mData,map);
            if(mInfo){
                if(mExtra.fport == 1){
                    mInfo.Esum = mInfo.Ea + mInfo.Er;
                }
                var msg = {macAddr: mMac, data: mData, timestamp: timestamp, recv: mRecv, date: mDate, gwid: mExtra.gwid};
                console.log('**** '+msg.date +' mac:'+msg.macAddr+' => data:'+msg.data+'\ninfo:'+JSON.stringify(mInfo));
                msg.information=mInfo;
            }
            saveFinalData(msg);
            return callback(null, msg);
            
        } else {
            return callback("Can't find map", null);
        }
    } else {
        console.log(new Date() + 'parseMsgd fport is not exist');
        return callback("fport is not exist", null);
    }
}

function getAutoSettingCheck(msg) {
    var autoObj, autoSet;
    try {
        autoObj = JsonFileTools.getJsonFromFile(autoPath);
        var keys = Object.keys(autoObj);
        for(let i in keys) {
            let auto = autoObj[keys[i]];
            if (Object.is(msg.macAddr, auto.sensor_mac)) {
                autoSet = auto;
                break;
            }
        }
    } catch (error) {
        return null;
    }
    var param = autoSet.sensor_param;
    var value = (msg.information)[param];
    var checkValue, command = null;
    console.log('Check param : ' + param + ' , value = ' + value);
    // Check off setting first
    if (autoSet.switch_off != '') {
        checkValue = parseInt(autoSet.switch_off);
        if (autoSet.switch_off_radio === 'low') {
            if (value < checkValue) {
                command = {"switch":"off","command":autoSet.switch_off_cmd};
            }
        } else {
            if (value > checkValue) {
                command = {"switch":"off","command":autoSet.switch_off_cmd};
            }
        }
    }
    if (command === null && autoSet.switch_on != '') {
        checkValue = parseInt(autoSet.switch_on);
        if (autoSet.switch_on_radio === 'low') {
            if (value < checkValue) {
                command = {"switch":"on","command":autoSet.switch_on_cmd};
            }
        } else {
            if (value > checkValue) {
                command = {"switch":"on","command":autoSet.switch_on_cmd};
            }
        }
    }
    if (command) {
        command.mac = msg.macAddr;
        command.switch_mac = autoSet.switch_mac;
        command.recv = msg.recv;
        command.gwid = msg.extra.gwid;
    }
    return command;
}

function getMap(type) {
	var data;
	try {
		data = JsonFileTools.getJsonFromFile(dataPath);
        if (data.mapList) {
            for (let i in data.mapList) {
                let map = data.mapList[i];
                if (Object.is(map.deviceType, type)) {
                    return map;
                    break;
                }
            }
        }
	} catch (error) {
		return null;
	}
}

function saveFinalData(msg) {
    var final;
	try {
        final = JsonFileTools.getJsonFromFile(finalPath);
        if (final === undefined || final === null) {
            final = {}
        }
        final[msg.macAddr] = msg;
        JsonFileTools.saveJsonToFile(finalPath, final);
	} catch (error) {
		console.log('???? saveFinalData error : ' + error);
	}
}

function getTypeData(data,mapObj) {
    if (mapObj === undefined|| mapObj === null) {
        return null;
    }
    try {
        var obj = mapObj.map;
        var info = {};
        var keys = Object.keys(obj);
        var count = keys.length;
        for(var i =0;i<count;i++){
            //console.log( keys[i]+' : '+ obj[keys[i]]);
            /*let parseData =  getIntData(obj[keys[i]],data);
            info[keys[i]] = parseData.toFixed(2);*/
            info[keys[i]] = getIntData(keys[i], obj[keys[i]],data);
            // console.log(keys[i] + ' : ' + info[keys[i]]);
        }
        return info;
    } catch (error) {
        return null;
    }
}

function getIntData(key, arrRange,initData){
    var ret = {};
    var start = arrRange[0];
    var end = arrRange[1];
    var diff = arrRange[2];
    var str = initData.substring(start,end);
    var data;
    if(key == 'Psum' || key == 'Qsum' || key == 'Ssum' || key == 'Pf') {
        data = parse(str);
    } else {
        data = parseInt(str,16);
    }

    // example : 
    // diff = "data/100"
    // data = 2000
    // eval(diff) = 2000/100 = 20
    
    return eval(diff);
}

function parse(hex) {
    // 0000 03FC –> 1020 
    // FFFF FF68 –> -152 
    hex= parseInt(hex, 16); 
    hex= hex| 0xFFFFFFFF00000000; 
    // node.warn('hex:=' + hex);
    return hex;

}


function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

function checkMac(mac) {
    try {
        var dataObj = JsonFileTools.getJsonFromFile(dataPath);
        var sensorList = dataObj.sensorList;
        for(let i in sensorList ) {
            let sensor = sensorList[i];
            if (Object.is(mac, sensor.device_mac)) {
                return true;
                break;
            }
        }
    } catch (error) {
        return false;
    }
}

function getCurrentTime() {
    var utcMoment = moment.utc();
    var timestamp = utcMoment.valueOf();
    var tMoment = (moment.unix(timestamp/1000)).tz(config.timezone);
    var time = tMoment.format('YYYY-MM-DD HH:mm:ss');
    return time;
}