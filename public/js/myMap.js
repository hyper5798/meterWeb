var table;
var mapListObj =  document.getElementById("mapList");

if (mapListObj.value !== '') {
    mapList = JSON.parse(mapListObj.value);
}
var test = {
    deviceType: '7',
    typeName:'test',
    list: [['temp', '2', '4', 'data', 'temp']]
};

var app =  new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        hasMap: false,
        hasError: false,
        errMsg: '',
        mapList: mapList,
        testData: '',
        target: {
            deviceType: '',
            typeName:'',
            list: [['', '', '', '', '']]
        },
        backupTarget: this.target,
        showAdd: -1,
        showRemove: false,
        isEditMode: true
    },
    methods: {
      toSelectMap: function (type) {
        this.isEditMode = false;
        var map = null,
            fieldName = null;
        for (let i=0; i < this.mapList.length; ++i) {
            if (Object.is(type, mapList[i].deviceType)) {
                this.target.deviceType = mapList[i].deviceType;
                this.target.typeName = mapList[i].typeName;
                this.hasMap = true;
                map = mapList[i].map;
                fieldName = mapList[i].fieldName;
                break;
            }
        }
        var list = [];
        let keys = Object.keys(map);

        for (let j=0;j < keys.length; ++ j) {
            let tmp = [];
            tmp.push (keys[j]);
            //console.log('(map[keys[j]] : ' + JSON.stringify(map[keys[j]]));
            tmp = tmp.concat(map[keys[j]]);
            //console.log('tmp : ' + JSON.stringify(tmp));
            if (fieldName[keys[j]]) {
                tmp.push (fieldName[keys[j]]);
            } else {
                tmp.push('');
            }
            list.push(tmp);
        }
        //console.log('list : ' + JSON.stringify(list));
        this.target.list = list;
        this.showAdd = keys.length-2;
        this.backupTarget = JSON.parse(JSON.stringify(this.target));
        this.changeRemoveBtn();
        //alert(JSON.stringify(this.target));
      },
      delItem: function (index) {
        //alert(index);
        this.target.list.splice(index, 1);
        this.showAdd = this.showAdd - 1;
        this.changeRemoveBtn();
      },
      addItem: function (index) {
        //alert(JSON.stringify(this.target));
        this.isEditMode = true;
        this.target.list.push(['', '', '', '', '']);
        this.showAdd = this.showAdd + 1;
        this.changeRemoveBtn();
      },
      changeRemoveBtn: function () {
        if (this.target.list.length > 1) {
            this.showRemove = true;
        } else {
            this.showRemove = false;
        }
        //alert(this.showRemove);
      }
    }
  })

var opt={"oLanguage":{"sProcessing":"處理中...",
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
            },dom: 'Blrtip',
            buttons: [
                //'copyHtml5',
                //'excelHtml5',
                //'pdfHtml5'
                //'csvHtml5'
            ],
            "iDisplayLength":5
    };
var opt2={
    //dom: 'frtip',
    scrollY: 250,
    "iDisplayLength":100
};

/* function delItem(index) {
    alert(JSON.stringify(index));
} */

/*function addItem(index) {
    alert(JSON.stringify(index));
} */

function delCheck(type){
    //alert(type);
    var postSelect = document.getElementById("postSelect");
    var postType = document.getElementById("postType");

    postType.value = type;
    postSelect.value = 'del';
    document.getElementById("account").innerText='你確定要刪掉這個裝置類型 '+type+' ?';
    $('#myModal').modal('show');
}

function checkFormData() {
    var target = app.target;
    // alert('target' + JSON.stringify(target));
    if (target.deviceType === null || target.deviceType === '') {
        return false;
    }
    if (target.typeName === null || target.typeName === '') {
        return false;
    }
    var list = target.list;
    for (let i=0; i<list.length; i++) {
        let item = list[i].slice();
        //alert('item' + JSON.stringify(item));
        item.splice(4, 1);
        // alert('item' + JSON.stringify(item));

        var a = item.indexOf("");
        // alert(a + ' 空的位置 : ' + JSON.stringify(item));
        if (a > -1) {
            return false;
            break;
        }
    }
    return true;
}

function checkDubleType() {

    var type = app.target.deviceType;
    var list = app.mapList;
    // alert('checkDubleType() type: ' + type + ' mpa list:\n' + JSON.stringify(list));

    for (let i=0; i < list.length; i++) {
        let item = list[i];
        // alert(type+' ==> item :' + JSON.stringify(item));
        if (Object.is(type, item.deviceType)) {
            return false;
            break;
        }
    }
    return true;
}

function delOptional(index) {
    alert(index);
    //document.getElementById("myTable").deleteRow(Number(index+1));
    createTable();
}

function toSubmit(){
    $('#myModal').modal('hide');
    document.getElementById("unitList").submit();
}

function showErrMsg(msg) {
    app.hasError = true;
    app.errMsg = msg;
    setTimeout(function(){
        hideErrMsg();
    }, 3000);
}

function hideErrMsg() {
    app.hasError = false;
    app.errMsg = '';
}

/* function toSelectMap(type) {
    // alert(type);
    var postSelect = document.getElementById("postSelect");
    var postType = document.getElementById("postType");
    postType.value = type;
    postSelect.value = 'select';
    document.getElementById("unitList").submit();
} */

function editMap(){
    // alert('editMap() : ' + JSON.stringify(app.target));
    if (!app.isEditMode) {
        app.isEditMode = true;
        return;
    }
    if (!checkFormData()) {
        showErrMsg('除了欄位名稱, 其他欄位不能為空值 !');
        return;
    }
    var postSelect = document.getElementById("postSelect");
    postSelect.value = 'edit';
    document.getElementById("unitList").submit();
}

function createMap(){
    // alert('createMap() : ' + JSON.stringify(app.target));
    if (!checkFormData()) {
        showErrMsg('除了欄位名稱, 其他欄位不能為空值 !');
        return;
    }
    if (!checkDubleType()) {
        showErrMsg('裝置類型重複 ! !');
        return;
    }
    var postSelect = document.getElementById("postSelect");
    postSelect.value = "new";
    if (checkFormData() )
    document.getElementById("unitList").submit();
}

function parseData() {
    //alert('parseData()  app.target : ' + JSON.stringify(app.target));
    var data = app.testData;
    if (data.length === 0) {
        showErrMsg('測試資料欄位不能為空值 !');
        return;
    }
    if (!checkFormData()) {
        showErrMsg('除了欄位名稱, 其他欄位不能為空值 !');
        return;
    }
    var test = getTypeData(data, app.target);
    if (test === null) {
        showErrMsg('測試失敗 !');
        return;
    }
    alert(JSON.stringify(test));
}


function clearMap(){
    //alert('clearMap() : ' + JSON.stringify(app.backupTarget));
    app.target = JSON.parse(JSON.stringify(app.backupTarget));
    app.showAdd = app.target.list.length-2;
    app.changeRemoveBtn();
}

function getTypeData(data,mapObj) {

    //alert('getTypeData()  mapObj : ' + JSON.stringify(mapObj));
    if (mapObj === undefined|| mapObj === null) {
        return null;
    }
    try {
        var arr = mapObj.list;
        //alert(JSON.stringify(arr));
        var info = {};
        for(var i =0; i < arr.length; i++){
            //console.log( keys[i]+' : '+ obj[keys[i]]);
            info[arr[i][0]] = getIntData(arr[i], data);
            // alert(JSON.stringify(info));
        }
        return info;
    } catch (error) {
        return null;
    }
}

function getIntData(arrRange,initData){
    var ret = {};
    var start = arrRange[1];
    var end = arrRange[2];
    var diff = arrRange[3];
    var data = parseInt(initData.substring(start,end),16);

    return eval(diff);
}

$(document).ready(function(){

    var errorMsg = document.getElementById("errorMsg").value;
    // alert(errorMsg);

    if (errorMsg !== undefined && errorMsg !== null && errorMsg !== '' ) {
        // alert('發生錯誤 : ' + errorMsg);
        app.hasError = true;
        app.errorMsg = errorMsg;
    }
    table = $('#table1').dataTable(opt);
    table.$('tr').click(function() {
        var row=table.fnGetData(this);
        app.toSelectMap(row[1]);
    });
});