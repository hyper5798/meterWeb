var users = JSON.parse(document.getElementById("users").value);
var userName = document.getElementById("userName").value;
var host ,port;
var empty = {
          name: '',
          pwd: '',
          pwd2: '',
          gender: 'M',
          email: '',
          cp: 'gemtek',
          type: 0
        };

var app = new Vue({
  el: '#app',
  data: {
    isTrue: true,
    isFalse: false,
    editPoint: -1,
    delPoint: -1,
    isTest: false,
    userList: users,
    isNew: false,
    newUser: empty,
    alertMsg: '',
    options: [
          { text: '管理者', value: 1 },
          { text: '一般用戶', value: 8 }
        ],
    options2: [
    { text: '啟用', value: 0 },
      { text: '禁用', value: 1 }
    ],
    options3: [
    { text: 'ndhu', value: 'ndhu' },
      { text: 'test', value: 'test'}
    ],
    options4: [
    { text: '男性', value: 'M' },
      { text: '女性', value: 'F'}
    ]
  },
  methods: {
    switchCreatUser: function () {
        this.isNew = true;
        this.editPoint =  -1;
        this.newUser = empty;
    },
    switchEditUser: function () {
        this.isNew = false;
    },
    editCheck: function (index) {
        this.editPoint = index;
    },
    delCheck: function (index, name) {
        console.log(name);
        this.delPoint = index;
        $('#myModal').modal('show');
    },
    saveEdit: function(index) {
      toUpdate(index);
    },
    testUser: function () {
      this.alertMsg = '';
      toCheckUser(this.newUser);
    }
  }
})

$(document).ready(function () {
    host = window.location.hostname;
    port = window.location.port;
});

function toCheckUser(user) {
  console.log('toCheckUser : ' + JSON.stringify(user));
  if(user.name.length == 0) {
    app.alertMsg = '尚未輸入帳戶名稱';
  } else if(user.pwd.length == 0) {
    app.alertMsg = '尚未輸入帳戶密碼';
  } else if(user.name.pwd !== user.name.pwd2) {
    app.alertMsg = '帳戶密碼與確認密碼不同';
  }　else if(user.email.length == 0) {
    app.alertMsg = '尚未輸入帳戶信箱';
  }
  if(app.alertMsg.length > 0) {
    setTimeout(function () {
          app.alertMsg = '';
        }, 3000);
    return;
  }
  toModifyUser('addUser', user);
}

function toDelete() {
    $('#myModal').modal('hide');
    var mUser = app.userList[app.delPoint];
    toModifyUser('delUser', mUser)
}


function toUpdate() {
    $('#myModal').modal('hide');
    var target = app.userList[app.editPoint];
    toModifyUser('updateUser', target)
}

function toModifyUser(type, user){
  // alert(gid + ' : ' + mac);
  //alert($("#startDate").val());
  $.LoadingOverlay("show");
  app.isSetting = false;
  // console.log(selectMac.toString());
  var url = 'http://'+host+":"+port+'/todos/user?newUser=' + JSON.stringify(user) + '&userName=' + userName;
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
            if(queryType === 'addUser'){
                console.log('json.responseCode : ' + json.responseCode);
                if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                  // alert('reload');
                  window.location.reload();
                }
            } else if(queryType === 'delUser'){
              if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                  app.userList.splice(app.delPoint, 1);
                  app.delPoint = -1;
                }
            } else if(queryType === 'updateUser'){
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