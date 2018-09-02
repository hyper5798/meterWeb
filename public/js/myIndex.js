console.log("message manager");
var now = new Date();
var date = (now.getFullYear() + '/' + (now.getMonth() + 1) + '/' + now.getDate() );
var connected = false;
var initBtnStr ="#pir";
var host ,port;
var cal1,cal2;
var index = 0;limit = 1000;
var isNeedTotal = true;
var date1 ,date2 , deviceList;
var range;
var allSensors = [];
if (document.getElementById("sensorList").value !== '') {
  allSensors =  JSON.parse(document.getElementById("sensorList").value);
}
var allZoneList = [];
if (document.getElementById("zoneList").value !== '') {
  allZoneList =  JSON.parse(document.getElementById("zoneList").value);
}
var profileObj = JSON.parse(document.getElementById("profile").value);
var user = JSON.parse(document.getElementById("user").value);
var userName = user.name;
var userZone = user.zone;
var defaultProfile = {
      monthPower: 'show',
      detail: "show"
    };
var userProfile;
if(profileObj[userName]) {
  userProfile = profileObj[userName];
} else {
  userProfile = defaultProfile;
}
var zone1Name, sensor1, sensor_name;

//For get current selected zone name on 2018.08.29
console.log('userName : ' + userName + ' , userZone : ' + userZone);
var zoneList = [];
if(allZoneList.length > 0  && (userName == 'sysAdmin' || userName == 'ndhuAdmin')) {
    zoneList = allZoneList;
    zone1Name = zoneList[0].name;
} else if(userName == 'sysAdmin' || userName == 'ndhuAdmin') {
    zoneList = [];
    zone1Name = 'active_all';
} else {
      for(let n in allZoneList) {
        let zone = allZoneList[n];
        if(zone.name === userZone) {
          zoneList.push(zone);
        }
      }
      zone1Name = userZone;
}
console.log('zone1Name: ' + zone1Name + '\ncurrent zoneList : ' + zoneList.length);
var zoneSensors = getSensorList(zone1Name);
if (zoneSensors.length > 0) {
  sensor1 = zoneSensors[0].device_mac;
}
//Slider
var min = 0;
var max = 1;
var value = 0;
//For chart
var colorNames = Object.keys(window.chartColors);
var imgArr = ['2018071500.jpg'];
var msgArr = ['2018071500.jpg'];

var dataset = ['Test'];
var datasetIndex = 0;
var chartData = [];
//Transfet
var t;
var allDataSet = [];
var selectedSet = '';
//Datatables
var table, buttons;
//Socket
// var socket = io.connect('http://localhost:8080');


var app = new Vue({
  el: '#app',
  data: {
    user: user,
    zoneList: zoneList,
    selectedZone: zone1Name,
    allSensors: allSensors,
    sensorList: zoneSensors,
    selectedSensor: sensor1,
    selectedSensorName: sensor_name,
    isIndex: false,
    isSetting: false,
    isChart: false,
    isShowCSV: false,
    hasTab: false,
    showUpdate: false,
    pageTimer: {},
    result: '',
    alertMsg: '',
    items: [],
    profile: JSON.parse(JSON.stringify(userProfile))
  },
  methods: {
    selectMac: function (mac) {
      // alert(mac);
      this.selectedSensor = mac;
      toQuery();
    },
    pressQuery: function () {
      toQuery();
    },
    selectSensor: function(ele) {
      // alert(ele.target.value);
      this.selectedSensor = ele.target.value;
      this.selectedSensorName = getSensorNameByMac(ele.target.value);
      toQuery();
    },
    enableSetting: function() {
      // this.isSetting = true;
      // setChosen(this.selectedCam);
      this.isSetting = true;
    },
    cancelSetting: function() {
      this.isSetting = false;
      this.profile = JSON.parse(JSON.stringify(userProfile));
    },
    saveSetting: function() {
      // alert('setting');
      toSetting(this.profile);
    },
    changeZone: function(zName) {
      // alert('setting');
      this.selectedZone = zName;
      this.sensorList = getSensorList(zName);
      this.selectedSensor = this.sensorList[0].device_mac;
    }
  }
})

function getSensorList (zone1Name) {
  //alert(zone1Name);
  if(zone1Name !== 'active_all') {
      var list=[];
      var arr = [];
      for (let i in zoneList) {
        let zone = zoneList[i];
        if(zone.name == zone1Name) {
          list = zone.deviceList;
        }
      }
      //alert(JSON.stringify(list));
      if(list.length > 0) {
        for (let j in allSensors) {
          let sensor = allSensors[j];
          if(list.includes(sensor.device_mac) == true) {
            arr.push(sensor);
          }
        }
      }
      return arr;
  } else {
    return allSensors;
  }
}


var opt2={
   "oLanguage":{"sProcessing":"處理中...",
         "sLengthMenu":"顯示 _MENU_ 項結果",
         "sZeroRecords":"沒有匹配結果",
         "sInfo":"顯示第 _START_ 至 _END_ 項結果，共 _TOTAL_ 項",
         "sInfoEmpty":"顯示第 0 至 0 項結果，共 0 項",
         "sInfoFiltered":"(從 _MAX_ 項結果過濾)",
         "sSearch":"搜索:",
         "oPaginate":{"sFirst":"首頁",
                    "sPrevious":"上頁",
                    "sNext":"下頁",
                    "sLast":"尾頁"}
         },
   dom: 'Blrtip',
   //"order": [[ 2, "desc" ]],
   "iDisplayLength": 100,
    scrollY: 400,
    buttons: [
        //'copyHtml5',
        //'excelHtml5',
        {
          extend: 'csv',
          text: 'CSV',
          bom : true}
        //'pdfHtml5'
    ]
 };

function getSensorNameByMac(mymac) {
  // alert('getSensorNameByMac : ' + mymac);
  let name = '';
  if (sensorList && sensorList.length > 0) {
    for (let m =0 ; m < sensorList.length; ++m) {
      let sensor = sensorList[m];
      // alert('sensor.device_ma : ' + sensor.device_ma);
      if (sensor.device_mac == mymac) {
        name = sensor.device_name;
      }
    }
  }
  return 'Sensor : ' + name;
}

function search(){
  // $('#myModal').modal('show');
  app.isIndex = true;
}

function toQuery(){
  var mac = app.selectedSensor;
  // alert('mac : ' + mac);
  // removeDataset();
  app.isIndex = false;
  $.LoadingOverlay("show");
  $('#myModal').modal('hide');
  var from = $('#from').val();
  var to = $('#to').val();
  var url = 'http://'+host+":"+port+'/todos/query?mac='+mac+'&from='+from+'&to='+to;
  url = url + '&queryType=queryEvent&userName=' + userName;
  console.log(url);
  loadDoc(url);
}

function toQuerThisMonth(mac){
  console.log('toQuerThisMonth mac : ' + mac);
  var from = moment().format('YYYY-MM-01');
  var to = moment().format('YYYY-MM-DD');
  var url = 'http://'+host+":"+port+'/todos/query?mac='+mac+'&from='+from+'&to='+to;
  url = url + '&queryType=queryThisMonthEvent&userName=' + userName;
  console.log(url);
  loadDoc(url);
}

function toSetting(profile){
  // alert(gid + ' : ' + mac);
  //alert($("#startDate").val());
  app.isSetting = false;
  // console.log(selectMac.toString());
  var url = 'http://'+host+":"+port+'/todos/setting?profile=' + JSON.stringify(profile) + '&userName=' + userName;
  url = url + '&queryType=setting';
  console.log(url);
  loadDoc(url);
}

function loadDoc(url) {
  console.log('loadDoc()');
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       //document.getElementById("alert").innerHTML = this.responseText;
       $.LoadingOverlay("hide");

       var type = this.getResponseHeader("Content-Type");   // 取得回應類型
       // console.log('type  : '+type);

        // 判斷回應類型，這裡使用 JSON
        if (type.indexOf("application/json") === 0) {
            var json = JSON.parse(this.responseText);
            // console.log('json  : '+JSON.stringify(json));
            console.log('data length : ' + json.data.length);
            var queryType = json.queryType;
            if(queryType === 'queryEvent'){
                console.log('Show query list');
                if(json.data && json.total>0){
                    table.fnClearTable();
                    var data = getDataList(json.data)
                    table.fnAddData(data);
                } else {
                  table.fnClearTable();
                }
                // alert(json.total);
                if (json.total > 0) {
                  app.result = '找到'+json.total+'筆資料';
                  // makeChartData(list);
                } else {
                  app.result = '找不到資料';
                }
            } else if(queryType === 'setting'){
              console.log('Settiong profile');
              profile = json;
              console.log('setting profile :\n' + JSON.stringify(profile));
            } else if(queryType === 'queryThisMonthEvent'){
              console.log('queryThisMonthEvent : ' +  json.data.length);
              var list = json.data;
              if(list.length > 0) {
                  updateStartPower(list[0]);
              }
            }
        }
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}

function updateStartPower(event) {
    let mac = event.macAddr;
    //This month start power
    let power = event.information.Esum;
    if(power == undefined) {
      power = event.information.Ea + event.information.Er;
    }
    console.log('updateStartPower mac: ' + mac + '-> power : ' + power);
    // console.log('updateStartPower event  >> ' + JSON.stringify(event.information));
    for (let i in app.allSensors) {
      let sensor = app.allSensors[i];
      if(sensor.device_mac == mac) {
        sensor.startPower = power;
        // alert(power + ' >> ' + JSON.stringify(sensor.event.information));
        updateThisMonthPower(event);
        break;
      }
    }
}

function updateThisMonthPower(event) {
  console.log('updateThisMonthPower event---------------------------');
  console.log(event);
  let mac = event.macAddr;
  for (let i in app.allSensors) {
      let sensor = app.allSensors[i];
      if(sensor.device_mac == mac) {
        console.log('sensor.device_mac :' + sensor.device_mac );
        if(sensor.event.information) {
          //This month last power
          var lastPower = sensor.event.information.Esum;
          sensor.monthPower = (lastPower - sensor.startPower).toFixed(1);
          console.log('lastPower :' + lastPower  +', startPower : ' + sensor.startPower );
        }
      }
    }
    console.log('updateThisMonthPower----------------------------------');
    console.log(app.sensorList);
}

function getDataList(list){
    var arr = [];
    for(var i = 0;i<list.length;i++){
        arr.push(getData(i+1, list[i]));
    }
    return arr;
}

function getData(mIndex, event){
    var arr = [];
    arr.push(mIndex);
    arr.push(event.date);
    var keys = Object.keys(event.information);
    // alert(JSON.stringify(keys));
    for (let i in keys) {
      let param = event.information[keys[i]];
      // alert(keys[i] + ' : ' + param);
      if(keys[i] && keys[i] != 'Cost')
      arr.push(param);
    }
    console.log(JSON.stringify(arr))
    return arr;
}

function makeChartData(list) {
  //Set slider
  /*max = list.length - 1;
  value = 0;

  //Data offset
  var mdata1 = list[0];
  /*var mdata2 = list[1];
  var d1 = new Date(mdata1.recv);
  var d2 = new Date(mdata2.recv);
  var d3 = Math.floor((d1.getTime() - d2.getTime())/60000 );
  var offset = (60/d3);
  console.log('offset : ' + offset);
  console.log(mdata1);
  datasetIndex = 0;
  dataset = Object.keys(mdata1.information);
  // alert(JSON.stringify(dataset));
  //For image
  var now_gid = app.selectedCam;
  imgArr = [];
  msgArr = [];
  chartData = [];
  allDataSet = [];
  // alert(now_gid);
  for(let j=list.length-1; j > -1; --j) {
    let event = list[j];
    let image = '/data/' + now_gid + '/' + getTimeName(event.timestamp);
    imgArr.push(image);
    msgArr.push(event.date);
    let data = {time:event.date};
    data = Object.assign(data, event.information);
    chartData.push(data);
    // break;
  }
  // alert(JSON.stringify(chartData));
  app.sImg = imgArr[0];
  app.eventDate = msgArr[0];
  var lastAll = [];
  for(let k=0; k< dataset.length; ++k) {
    let newset = getDataSet(k, dataset[k]);
    allDataSet.push(newset);
    lastAll.push(newset);
  }
  allDataSet.push(lastAll);
  // alert(JSON.stringify(allDataSet));

  if (dataset.length > 0) {
    app.hasTab = true;
    app.items = dataset;
    app.items.push('all');
	  selectedSet = dataset[dataset.length-1];
	  changeDataset(dataset.length-1);
  }

  // console.log('allDataSet : ' + JSON.stringify(allDataSet));
  console.log('app.items : ' + JSON.stringify(app.items));
  console.log(JSON.stringify(chartData)); */
}

function getMac(item){
  //console.log('getMac :\n'+JSON.stringify(item));
  var tmp = item.mac +' - '+item.name;
  return tmp;
}

$(document).ready(function(){
    /* setTimeout(function(){
        //do what you need here
        var mUrl = 'http://'+host+":"+port+'/todos/device_list';
        loadDoc("device_list",mUrl)
    }, 3000);  */
    host = window.location.hostname;
    port = window.location.port;
    $('.input-daterange input').each(function() {
      $(this).datepicker({
          format: "yyyy-mm-dd",
          autoclose: true,
          // startDate: "today",
          clearBtn: true,
          calendarWeeks: true,
          todayHighlight: true,
          language: 'zh-TW'
      });
    });

    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);

    // app.isIndex = true;
    table = $("#table1").dataTable(opt2);

    buttons = new $.fn.dataTable.Buttons(table, {
         buttons: [
           //'copyHtml5',
           //'excelHtml5',
           {
              extend: 'csvHtml5',
              text: 'CSV',
              //title: $("#startDate").val()+'-'+$("#endDate").val(),
              filename: function(){
                    /*var d = $("#startDate").val();
                    var n = $("#endDate").val();
                    return 'file-'+d+'-' + n;*/
                    return 'test';
                },
              footer: true,
              bom : true
            },
           //'pdfHtml5'
        ]
    }).container().appendTo($('#buttons'));
    app.isIndex = true;

    /*socket.on('connect',function(){
    socketId = socket.id;
      console.log('connection socketId : ' + socketId);
    });


    socket.on('news', function (data) {
      console.log('cnews -------------------');
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });

    socket.on('command_response', function (data) {
      console.log('command_response -------------------');
      console.log(data);
    }); // update_status

    socket.on('update_status', function (data) {
      console.log('update_sensor_status -------------------');
      console.log(typeof data);
      console.log(data);
      changMeterData( data);
    });*/

    if (allSensors.length > 0) {
        $.LoadingOverlay("show");
        setTimeout(function () {
          $.LoadingOverlay("hide");
        }, 3000);
        allSensors.forEach(ShowResults);
    }
    if(user.role == null) {
      app.alertMsg = '你沒有觀看權限,請與系統管理員連絡!';
    } else if(app.sensorList.length == 0) {
      app.alertMsg = '你尚未被分配電表資料,請與系統管理員連絡!';
    }
});

function ShowResults(value, index, ar) {
    console.log('ShowResults : '  + value.device_mac);
    toQuerThisMonth(value.device_mac);
}

function changMeterData( data) {
  // alert(JSON.stringify(data));
  let mac = data.macAddr;
  for (let i in app.sensorList) {
      let sensor = app.sensorList[i];
      if(sensor.device_mac == mac) {
        if(data.information.Ea == undefined) {
          app.alertMsg ='電表更新錯誤,通知系統人員處理 !!';
        } else {
          sensor.event = data;
          updateThisMonthPower(data);
        }
        break;
        //alert(JSON.stringify(sensor));
      }
  }
  // alert(JSON.stringify(app.sensorList));

}

var timeFormat = 'YYYY-MM-DD HH:mm';

function getMonthData() {
  var now = new Date();
}


function newDate(days) {
	return moment().add(days, 'hours').toDate();
}

function newDateString(days) {
	return moment().add(days, 'hours').format(timeFormat);
}

var color = Chart.helpers.color;
var config = {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		title: {
			text: 'Chart.js Time Scale'
    },
    tooltips: {
      mode: 'index'
    },
    hover: {
      mode: 'index'
    },
		scales: {
			xAxes: [{
				type: 'time',
				time: {
					parser: timeFormat,
					// round: 'day'
					tooltipFormat: 'll HH:mm'
				},
				scaleLabel: {
					display: false,
					labelString: 'Date'
				}
			}],
			yAxes: [{
        ticks: {
          beginAtZero: true
        },
				scaleLabel: {
					display: false,
					labelString: 'value'
				}
			}]
		},
	}
};


function randomizeData () {
  config.data.datasets.forEach(function(dataset) {
    dataset.data.forEach(function(dataObj, j) {
      if (typeof dataObj === 'object') {
        dataObj.y = randomScalingFactor();
      } else {
        dataset.data[j] = randomScalingFactor();
      }
    });
  });

  window.myLine.update();
}

function getDataSet (i, label) {
  var colorName = colorNames[ ((i * 2 ) % colorNames.length) ];
  var newColor = window.chartColors[colorName];
  var newDataset = {
    label: label,
    borderColor: newColor,
    backgroundColor: color(newColor).alpha(0.5).rgbString(),
    fill: false,
    data: [],
  };
  return newDataset;
}

function changeDataset (index) {
  /*var colorName = colorNames[ ((config.data.datasets.length * 2 ) % colorNames.length) ];
  var newColor = window.chartColors[colorName];
  var label = '';
  if (datasetIndex < dataset.length ) {
    label = dataset[datasetIndex];
    ++datasetIndex;
  } else {
    alert('無法新增dataset');
    return;
  }
  console.log('addDataset : ' + label);
  var newDataset = {
    label: label,
    borderColor: newColor,
    backgroundColor: color(newColor).alpha(0.5).rgbString(),
    fill: false,
    data: [],
  };

  for (var index = 0; index < config.data.labels.length; ++index) {
    newDataset.data.push(randomScalingFactor());
  }
  config.data.datasets.push(newDataset);*/
  var newDataset = allDataSet[index];
  if (index == allDataSet.length-1) {
    config.data.datasets = newDataset;
  } else {
    config.data.datasets = [newDataset];
  }


  window.myLine.update();
}

function addData (data, mySet) {
  // alert(JSON.stringify(data));
  // alert(mySet);
  if (config.data.datasets.length > 0) {
    // config.data.labels.push(newDate(config.data.labels.length));
    config.data.labels.push(data.time);
    for (var index = 0; index < config.data.datasets.length; ++index) {
      /*if (typeof config.data.datasets[index].data[0] === 'object') {
        config.data.datasets[index].data.push({
          x: newDate(config.data.datasets[index].data.length),
          y: randomScalingFactor(),
        });
      } else {
        config.data.datasets[index].data.push(randomScalingFactor());
      }*/
      // alert(dataset[index] + '->' + data[dataset[index]]);
      if (typeof config.data.datasets[index].data[0] === 'object') {
        config.data.datasets[index].data.push({
          x: data.time,
          y: data[dataset[index]],
        });
      } else {
        config.data.datasets[index].data.push(data[dataset[index]]);
      }
      // config.data.datasets[index].data.push(data[dataset[index]]);
    }

    if (config.data.labels.length > 48) {
      removeData ();
    }
    window.myLine.update();
  }
}

function resetChart () {
  config.data.labels = [];
  for (var index = 0; index < config.data.datasets.length; ++index) {
    config.data.datasets[index].data = [];
  }
  window.myLine.update();
}

function removeDataset () {
  //config.data.datasets.splice(0, 1);
  config.data.labels = [];
  config.data.datasets = [];
  datasetIndex = 0;
  window.myLine.update();
  app.alert = '';
  app.hasTab = false;
  app.items = [];
}

function removeData () {
  config.data.labels.splice(0, 1); // remove the label first

  config.data.datasets.forEach(function(dataset) {
    // dataset.data.pop();
    dataset.data.splice(0, 1);
  });
  window.myLine.update();
}


