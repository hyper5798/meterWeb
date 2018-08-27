var devices = JSON.parse(document.getElementById("devices").value);
var zones = JSON.parse(document.getElementById("zones").value);
var userName = document.getElementById("userName").value;
var host ,port;
var empty = {
          name: '',
          deviceList: []
        };

var app = new Vue({
  el: '#app',
  data: {
    isTrue: true,
    isFalse: false,
    editPoint: -1,
    delPoint: -1,
    isTest: false,
    deviceList: devices,
    zoneList: zones,
    isNew: false,
    newTarget: empty,
    alertMsg: '',
    selected: null,
    data: getMockData(),
    targetKeys: [],
    modal1: false,
    editMode: 'edit'
  },
  methods: {
    switchCreatDevice: function () {
        this.isNew = true;
        this.editPoint =  -1;
        this.newTarget = empty;
    },
    switchEditDevice: function () {
        this.isNew = false;
    },
    editCheck: function (index) {
        this.editPoint = index;
    },
    delCheck: function (index, name) {
        console.log('delCheck : ' + name);
        this.delPoint = index;
        $('#myModal').modal('show');
    },
    saveEdit: function(index) {
        toUpdate(index);
    },
    checkDevice: function () {
        this.alertMsg = '';
        toCheckDevicve(this.newTarget);
    },
    render: function(item) {
        return item.label;
    },
    handleChange: function (newTargetKeys) {
        this.targetKeys = newTargetKeys;
    },
    ok: function() {
        this.$Message.info('Clicked ok');
        if(this.editMode == 'new') {
          this.newTarget.deviceList = JSON.parse(JSON.stringify(this.targetKeys));
        } else {
          this.zoneList[this.editPoint].deviceList = JSON.parse(JSON.stringify(this.targetKeys));
        }
    },
    cancel: function() {
      this.$Message.info('Clicked cancel');
    },
    addDevice(mode) {
      this.editMode = mode;
      if(this.editMode == 'new') {
          this.targetKeys = [];
      } else {
        let zone = this.zoneList[this.editPoint];
        console.log('addDevice : ' + mode + ', editPoint :' + this.editPoint);
        console.log('zone : ' + JSON.stringify(zone));
        this.targetKeys = JSON.parse(JSON.stringify(zone.deviceList));
      }
      this.modal1 = true;
    }
  }
})

function getMockData() {
let mockData = [];
  for (let i = 0; i < devices.length; i++) {
    mockData.push({
      key: devices[i].device_mac,
      label: devices[i].device_name,
      description: '',
      disabled: false
    });
  }
  return mockData;
}

function getTargetKeys () {
    return getMockData()
       .filter(() => Math.random() * 2 > 1)
       .map(item => item.key);
}

$(document).ready(function () {
    host = window.location.hostname;
    port = window.location.port;
});

function toCheckDevicve(target) {
  console.log('toCheckTarget : ' + JSON.stringify(target));
  if(target.name.length == 0) {
    app.alertMsg = '尚未輸入分區名稱';
  } else if(target.deviceList.length == 0) {
    app.alertMsg = '尚未選擇裝置';
  }
  if(app.alertMsg.length > 0) {
    setTimeout(function () {
          app.alertMsg = '';
        }, 3000);
    return;
  }
  toModifyTarget('addZone', target);
}

function toDelete() {
    $('#myModal').modal('hide');
    var mTarget = app.zoneList[app.delPoint];
    toModifyTarget('delZone', mTarget);
}


function toUpdate() {
    $('#myModal').modal('hide');
    var mTarget = app.zoneList[app.editPoint];
    toModifyTarget('updateZone', mTarget)
}

function toModifyTarget(type, target){
  // alert(gid + ' : ' + mac);
  //alert($("#startDate").val());
  $.LoadingOverlay("show");
  app.isSetting = false;
  // console.log(selectMac.toString());
  var url = 'http://'+host+":"+port+'/todos/zone?target=' + JSON.stringify(target) + '&userName=' + userName;
  url = url + '&queryType=' + type;
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
       console.log('type  : '+type);
       console.log('responseText : '+ this.responseText);
       setTimeout(function () {
          app.alertMsg = '';
        }, 3000);

        // 判斷回應類型，這裡使用 JSON
        if (type.indexOf("application/json") === 0) {
            var json = JSON.parse(this.responseText);
            var queryType = json.queryType;
            console.log(queryType + ' response ' + this.responseText);
            if(queryType === 'addZone'){
                console.log('json.responseCode : ' + json.responseCode);
                if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                  // alert('reload');
                  window.location.reload();
                }
            } else if(queryType === 'delZone'){
              if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                  if(app.zoneList && app.zoneList.length > 0) {
                    app.zoneList.splice(app.delPoint, 1);
                  }
                  app.delPoint = -1;
                }
            } else if(queryType === 'updateZone'){
              app.editPoint = -1;
              if(json.responseCode == '999'){
                  app.alertMsg = json.responseMsg;
              } if (json.responseCode == '000') {
                  app.editPoint = -1;
                  app.alertMsg = '更新成功!!!';
              }
            }
        }
    }
  };
  xhttp.open("GET", url, true);
  xhttp.send();
}