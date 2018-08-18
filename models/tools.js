//for aa00 temp/hum device
function togGetDataArray(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;
	var tmpNumber = 0;

	//console.log('dataString :'+dataString);
	var index = dataString.substring(0,4);

	var test = parseInt(dataString.substring(0,4),16);//AA01(16) -> 43`521(10)
	//console.log('dataString.substring(0,4):'+dataString.substring(0,4) + ' , number = '+ test);
	var data0 = parseInt(dataString.substring(6,10),16)/100;
	var data1 = parseInt(dataString.substring(10,14),16)/100;
	var data2 = parseInt(dataString.substring(14,18),16);

	arrDevice.push(data0);
	arrDevice.push(data1);
	arrDevice.push(data2);
	return arrDevice;

}

//For aa01 : weather-1 device
function togGetDataArray1(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;
	var tmpNumber = 0;

	//console.log('dataString :'+dataString);
	var index = dataString.substring(0,4);

	var test = parseInt(dataString.substring(0,4),16);//AA01(16) -> 43521(10)
	//console.log('dataString.substring(0,4):'+dataString.substring(0,4) + ' , number = '+ test);
	var data0 = parseInt(dataString.substring(6,10),16);
	var data1 = parseInt(dataString.substring(10,14),16);
	var data2 = parseInt(dataString.substring(14,16),16);
	var data3 = parseInt(dataString.substring(16,18),16);
	var data4 = parseInt(dataString.substring(18,22),16);

	arrDevice.push(data0);
	arrDevice.push(data1);
	arrDevice.push(data2);
	arrDevice.push(data3);
	arrDevice.push(data4);
	return arrDevice;
}

//For aa02 : weather-1 device
function togGetDataArray2(dataString) {
	var arrDevice = [];
	var length = dataString.length;
	var arrLength = length/4;

	//aa01(16) -> 43522(10)
	for(var i = 6;i<dataString.length;i=i+4){
        var tmp = dataString.substring(i,i+4);
		console.log('tmp '+i+':'+tmp);
		var tmpNumber = 0;
		if(i==0){
			continue;
		}else{
			//console.log('i:'+i+'value = vaue');
			tmpNumber = parseInt(tmp,16);
			//arrDevice.push(tmpNumber.toString());
			arrDevice.push(tmpNumber);
		}
	}
	return arrDevice;
}

//For aa03 for pm2.5 device
function togGetDataArray3(dataString) {
	var arrDevice = [];
	var index = dataString.substring(0,4);
	var data0 = parseInt(dataString.substring(6,14),16)/100;
	var data1 = parseInt(dataString.substring(14,18),16);
	var data2 = parseInt(dataString.substring(18,22),16)/100;
	var data3 = parseInt(dataString.substring(22,26),16)/100;
	var data4 = parseInt(dataString.substring(26,30),16);
	var data5 = parseInt(dataString.substring(30,34),16)/10;
	var data6 = parseInt(dataString.substring(34,38),16)/10;
	var data7 = parseInt(dataString.substring(38,42),16)/1000;

	arrDevice.push(data0);
	arrDevice.push(data1);
	arrDevice.push(data2);
	arrDevice.push(data3);
	arrDevice.push(data4);
	arrDevice.push(data5);
	arrDevice.push(data6);
	arrDevice.push(data7);

	return arrDevice;
}

exports.getDataArray = function (flag,dataString) {
	if(flag == 0){//aa00
		return togGetDataArray(dataString);
	}else if(flag == 1){//aa01
		return togGetDataArray1(dataString);
	}else if(flag == 2){//aa02
		return togGetDataArray2(dataString);
	}else if(flag == 3){//aa03
		return togGetDataArray3(dataString);
	}else if(flag == 4){//aa04
		return togGetDataArray4(dataString);
	}else if(flag == 5){//aa05
		return togGetDataArray5(dataString);
	}
};

exports.getType = function (p) {
    console.log('Debug getType :'+(typeof p))
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

exports.isEmpty = function (obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true && JSON.stringify(obj) === JSON.stringify({});
}