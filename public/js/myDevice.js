var devices = JSON.parse(document.getElementById("devices").value);
var userName = document.getElementById("userName").value;
var host ,port;
var empty = {
          d: '05010CC5',//mac
          type: 'LoRaM',
          fport: '1',
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
    isNew: false,
    newTarget: empty,
    alertMsg: '',
    options: [
    { text: '啟用', value: 3 },
      { text: '禁用', value: 0 }
    ]
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
    delCheck: function (index, mac) {
        console.log(mac);
        this.delPoint = index;
        $('#myModal').modal('show');
    },
    saveEdit: function(index) {
      toUpdate(index);
    },
    checkDevice: function () {
      this.alertMsg = '';
      toCheckDevicve(this.newTarget);
    }
  }
})

$(document).ready(function () {
    host = window.location.hostname;
    port = window.location.port;
});

function toCheckDevicve(target) {
  console.log('toCheckTarget : ' + JSON.stringify(target));
  if(target.d.length == 0) {
    app.alertMsg = '尚未輸入裝置識別碼';
  } else if(target.d.length != 8) {
    app.alertMsg = '裝置類型碼字元長度不等於8';
  }else if(target.fport.length == 0) {
    app.alertMsg = '尚未輸入裝置類型碼';
  }
  if(app.alertMsg.length > 0) {
    setTimeout(function () {
          app.alertMsg = '';
        }, 3000);
    return;
  }
  toModifyTarget('addDevice', target);
}

function toDelete() {
    $('#myModal').modal('hide');
    var mTarget = app.deviceList[app.delPoint];
    toModifyTarget('delDevice', mTarget);
}


function toUpdate() {
    $('#myModal').modal('hide');
    var mTarget = app.deviceList[app.editPoint];
    toModifyTarget('updateDevice', mTarget)
}

function toModifyTarget(type, target){
  // alert(gid + ' : ' + mac);
  //alert($("#startDate").val());
  $.LoadingOverlay("show");
  app.isSetting = false;
  // console.log(selectMac.toString());
  var url = 'http://'+host+":"+port+'/todos/device?target=' + JSON.stringify(target) + '&userName=' + userName;
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
            if(queryType === 'addDevice'){
                console.log('json.responseCode : ' + json.responseCode);
                if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                  // alert('reload');
                  window.location.reload();
                }
            } else if(queryType === 'delDevice'){
              if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                  app.deviceList.splice(app.delPoint, 1);
                  app.delPoint = -1;
                }
            } else if(queryType === 'updateDevice'){
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