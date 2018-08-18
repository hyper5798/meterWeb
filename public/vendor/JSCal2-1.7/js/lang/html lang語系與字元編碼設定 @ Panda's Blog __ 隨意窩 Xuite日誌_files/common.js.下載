function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_findObj(n, d) { //v3.0
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}
function MM_showHideLayers() { //v3.0
  var i,p,v,obj,args=MM_showHideLayers.arguments;
  for (i=0; i<(args.length-2); i+=3) if ((obj=MM_findObj(args[i]))!=null) { v=args[i+2];
    if (obj.style) { obj=obj.style; v=(v=='show')?'visible':(v='hide')?'hidden':v; }
    obj.visibility=v; }
}
function MM_reloadPage(init) {  //reloads the window if Nav4 resized
  if (init==true) with (navigator) {if ((appName=="Netscape")&&(parseInt(appVersion)==4)) {
    document.MM_pgW=innerWidth; document.MM_pgH=innerHeight; onresize=MM_reloadPage; }}
  else if (innerWidth!=document.MM_pgW || innerHeight!=document.MM_pgH) location.reload();
}
MM_reloadPage(true);
function MM_openBrWindow(theURL,winName,features) { //v2.0
  window.open(theURL,winName,features);
}

//輸入區塊字數檢查
//inputObj:輸入文字的表單物件
//showObj:顯示目前字數的表單物件
//wordlimit:限制輸入的字數
//by atom 2003-03-13
function check_words(inputObj,showObj,wordlimit){
  var inputObj,showObj,wordlimit;
  if(inputObj.value.length > wordlimit){ 
    inputObj.value=inputObj.value.substring(0,wordlimit);
    alert("您最多只可輸入"+wordlimit+"個字。");
  }
  showObj.value=0;
  showObj.value=wordlimit-inputObj.value.length;
  showObj.value=inputObj.value.length;
  return true;
} 


/*
//滑鼠右鍵鎖定
document.oncontextmenu=function(){
	return false;
}

//鎖定ctrl+N
document.onkeydown=function(){
	if(event.keyCode==78){
		return false;
	}
}
*/

//鎖定status
/*
function lock_status(){
	window.status="";
}
*/
//setInterval(lock_status,10);
//document.captureEvents();
//document.captureEvents(Event.MOUSEOVER | Event.MOUSEOUT);
//document.onmouseover=lock_status;
//document.onmouseout=lock_status;


//去除多餘空白字元 by atom 2004-04-12
String.prototype.trim = function(){
	return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.Ltrim = function(){
	return this.replace(/(^\s*)/g, "");
}
String.prototype.Rtrim = function(){
	return this.replace(/(\s*$)/g, "");
}

