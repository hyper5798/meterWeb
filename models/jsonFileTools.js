var fs = require("fs");
var moment = require('moment');
var folderPath = './public/data/';
console.log('folderPath : '+folderPath);
var temPath,humPath,dtaePath,interval;
var temobj,humobj;

exports.saveJsonToFile = function (path,obj){
    saveJaonFile(path,obj);
}

exports.getJsonFromFile = function (path){
    return getJaonFile(path);
}

exports.saveDataAndGetTimeeString = function (option,devices) {

    //Save json string to file
    saveDataToFile(Number(option),devices);
    //Jason add on 201608.05 for date range data
    var dateStr = getTimeRangeString(option,devices);
    return dateStr ;
};

exports.mkdir = mkdir;

function mkdir(dir) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
}

function getTimeRangeString(option,devices){
    var interval = '2 hour';
    var formatStr =  'YYYY/MM/DD H';
    if(option==0){
        interval = '2 hour';
        formatStr = 'YYYY/MM/DD H';
    }else if(option==1){
        interval = '1 day';
            formatStr = 'YYYY/MM/DD';
    }else if(option==2){
        interval = '2 day';
            formatStr = 'YYYY/MM/DD';
    }else if(option==3){
        interval = '7 day';
        formatStr = 'YYYY/MM/DD';
    }

    var min = moment(devices[0].recv_at).format(formatStr);
    var max = moment(devices[(devices.length-1)].recv_at);
    if(option==0){
        max = max.add(1,'hours').format(formatStr);
    }else if(option==1){
        max = max.add(1,'days').format(formatStr);
    }else if(option==2){
        max = max.add(1,'days').format(formatStr);
    }else if(option==3){
        max = max.add(1,'days').format(formatStr);
    }
    return '{"option":'+option+',"deviceNumber":'+devices.length+',"interval":"'+interval+'","min":"'+min+'","max":"'+max+'"}';
}

//[ [ [1469062064000,28.8],[1469070793000,27.7] ] , [ [1469077315000,27.1],[1469079093000,27] ] ]
function saveDataToFile(option,devices){
    //Set path,format
    setByOption(option);
    temobj = [],humobj = [];
    var mlength = devices.length;
    var temArr1 = [],humArr1 = [],temArr2 = [],humArr2 = [],temArr = [],humArr = [];
    var temStr='',tem1Str='',tem2Str='',humStr='',hum1Str='',hum2Str='';
    for(var i=0;i<mlength;i++){
        var date = devices[i].recv_at;
        //console.log('--------------------------------------------------------------------------------');
        //console.log('date : '+ date);
        var timestamp = moment(date);
        //console.log('timestamp : '+ timestamp);
        /*if(devices[i].info == null){
            temArr1.push([Number(timestamp),devices[i].temperature1]);
            temArr2.push([Number(timestamp),devices[i].temperature2]);
            humArr1.push([Number(timestamp),devices[i].humidity1]);
            humArr2.push([Number(timestamp),devices[i].humidity2]);
        }else{
            temArr1.push([Number(timestamp),devices[i].info.data0]);
            temArr2.push([Number(timestamp),devices[i].info.data2]);
            humArr1.push([Number(timestamp),devices[i].info.data1]);
            humArr2.push([Number(timestamp),devices[i].info.data3]);
        }*/
        temArr1.push([Number(timestamp),devices[i].info.data0]);
        humArr1.push([Number(timestamp),devices[i].info.data1]);
        /*console.log('temArr1 : ' + temArr1);
        console.log('temArr2 : ' + temArr2);
        console.log('humArr1 : ' + humArr1);
        console.log('humArr2 : ' + humArr2);*/
    }
    temArr.push(temArr1);
    //temArr.push(temArr2);
    humArr.push(humArr1);
    //humArr.push(humArr2);

    //console.log('temArr : ' + temArr);
    //console.log('humArr : ' + humArr);

    saveStringToFile(temPath,JSON.stringify(temArr));
    saveStringToFile(humPath,JSON.stringify(humArr));
}

function getTemperatureString(index,length,timestamp,value){
    var str = '{"temperature":"'+value+'","date":"'+timestamp+'"}';
    if( index === 0 && index != (length-1) ) {
         return '['+str;
    } else if( index === 0 && index === (length-1) ){
         return '['+str+']';
    }else if( index > 0 && index === (length-1) ) {
         return ','+str+']';
    }else if( index > 0 && index != (length-1) ) {
        return ','+str;
    }
}
function getHumidityString(index,length,timestamp,value){
    var str = '{"humidity":"'+value+'","date":"'+timestamp+'"}';
    if( index === 0 && index != (length-1) ) {
         return '['+str;
    } else if( index === 0 && index === (length-1) ){
         return '['+str + ']';
    }else if( index > 0 && index === (length-1) ) {
         return ','+str+']';
    }else if( index > 0 && index != (length-1) ) {
        return ','+str;
    }
}

function saveStringToFile(mpath,mstring){
    console.log("Debug jsonFileTools saveFile -> path: "+ mpath);
    //console.log("Debug jsonFileTools saveFile -> string: "+ mstring);
    //var json = JSON.stringify(obj);
    fs.writeFileSync(mpath, mstring, 'utf8');
    console.log("\n *START* \n");
    //var content = fs.readFileSync(mpath);
    //console.log("Output Content : \n"+ content);
}

function saveJaonFile(path,obj){
    console.log("Debug jsonFileTools saveFile -> path: "+ path);
    var json = JSON.stringify(obj);
    fs.writeFileSync(path, json, 'utf8');
}

function getJaonFile(path){
    // console.log("Debug jsonFileTools getJaonFile -> path: "+ path);
    if (fs.existsSync(path) == false) {
        return null;
    }else{
        var text = fs.readFileSync(path, 'utf8');
        // console.log('read text :'+text);
        if(text.length>0){
            var json = JSON.parse(text);
            return json;
        }else{
            return null;
        }
        
    }
}

function setByOption(option){
    if(option==0){
        temPath = folderPath+'tem1.json';
        humPath = folderPath+'hum1.json';
        dtaePath = folderPath+'date1.json';
    }else if(option==1){
        temPath = folderPath+'tem2.json';
            humPath = folderPath+'hum2.json';
            dtaePath = folderPath+'date2.json';
    }else if(option==2){
        temPath = folderPath+'tem3.json';
            humPath = folderPath+'hum3.json';
            dtaePath = folderPath+'date3.json';
    }else if(option==3){
        temPath = folderPath+'tem4.json';
        humPath = folderPath+'hum4.json';
        dtaePath = folderPath+'date4.json';
    }
    console.log("Debug jsonFileTools setByOption -> temPath : "+ temPath);
    console.log("Debug jsonFileTools setByOption -> humPath : "+ humPath);
    console.log("Debug jsonFileTools setByOption -> dtaePath : "+ dtaePath);
}
