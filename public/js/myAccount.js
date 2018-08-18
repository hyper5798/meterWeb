var opt2={
    dom: 'frtip',
    scrollY: 250,
};
var table = $('#table1').dataTable(opt2);

$(document).ready(function () {
    var enable = $('[name=enable]');
    //alert(enable.length);

    setTimeout(function(){
        //do what you need here
        //document.getElementById('result').innerText = '';
    }, 3000);
});


function editCheck(index,name){
    //alert(index+" : "+name);
    var postSelect = document.getElementById("postSelect");
    var postName = document.getElementById("postName");
    postName.value = name;
    var enable = $('[name=enable]');

    postSelect.value = enable[index].checked;
    document.getElementById("unitList").submit();
}

function delCheck(index,name){

    //alert(index+" : "+name);
    postName.value = name;
    document.getElementById("account").innerText='Are you sure you want to delete the '+name+' account?';
    $('#myModal').modal('show');
}

function toSubmit(){
    $('#myModal').modal('hide');
    document.getElementById("unitList").submit();
}

function createAccount(){
    var postSelect = document.getElementById("postSelect");
    postSelect.value = "new";
    var postName = document.getElementById("postName");
    var username = document.getElementById("username");
    postName.value = username.value;
    document.getElementById("unitList").submit();
}