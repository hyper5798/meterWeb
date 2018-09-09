var user = JSON.parse(document.getElementById("user").value);
user.pwd = '';
var host,port;

var app = new Vue({
    el: '#app',
    data: {
      user: user,
      alertMsg: '',
    },
    methods: {
      updateUser: function () {
        checkPwd();
      }
    }
  })

  function checkPwd() {
    
    if(app.user.pwd.length == 0) {
        app.alertMsg = '尚未輸入密碼';
    } else if(app.user.pwd.length < 8) {
        app.alertMsg = '密碼長度小於8';
    }
    if(app.alertMsg.length > 0) {
        setTimeout(function () {
            app.alertMsg = '';
            }, 3000);
        return;
    }
    changePwd();
  }

  $(document).ready(function () {
    host = window.location.hostname;
    port = window.location.port;
});

  function changePwd() {
    var url = 'http://'+host+":"+port+'/todos/changeSelfPwd?updateUser=' + JSON.stringify(app.user);
    url = url + '&queryType=changeSelfPwd';
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
              if(queryType === 'changeSelfPwd'){
                
                if(json.responseCode == '999'){
                    app.alertMsg = json.responseMsg;
                } if (json.responseCode == '000') {
                    app.alertMsg = '更新密碼成功!!!';
                    window.location = 'http://'+host+":"+port+"/logout";
                }
              }
          }
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
  }