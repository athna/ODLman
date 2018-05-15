// 説明   : 共通で使える関数集。
// 作成日 : 2013/05/27
// 作成者 : 江野高広

var objCommonFunctions = new commonFunctions();

function commonFunctions () {
 
 // HTML Escape
 this.escapeHtml = function (string) {
  string = string.replace(/&/g, "&amp;");
  string = string.replace(/"/g, "&quot;");
  string = string.replace(/'/g, "&quot;");
  string = string.replace(/</g, "&lt;");
  string = string.replace(/>/g, "&gt;");
  
  return(string);
 };
 
 // unixtime (秒)を日付に変える。
 this.unixtimeToDate = function (unixtime, format){
  if((unixtime === null) || (unixtime === undefined) || (unixtime.length === 0) || (typeof(unixtime) !== "number")){
   unixtime = this.getUnixtime();
  }
  
  if((format === null) || (format === undefined) || (format.length === 0)){
   format = "YYYY/MM/DD hh:mm:ss";
  }
  
  var date = new Date();
  date.setTime(unixtime * 1000);
  
  var YYYY = date.getFullYear();
  var MM   = date.getMonth() + 1;
  var DD   = date.getDate();
  var hh   = date.getHours();
  var mm   = date.getMinutes();
  var ss   = date.getSeconds();
  
  // 左側を「0」で埋める。
  MM = ("0" + MM).slice(-2);
  DD = ("0" + DD).slice(-2);
  hh = ("0" + hh).slice(-2);
  mm = ("0" + mm).slice(-2);
  ss = ("0" + ss).slice(-2);
  
  format = format.replace(/YYYY/g, YYYY);
  format = format.replace(/MM/g, MM);
  format = format.replace(/DD/g, DD);
  format = format.replace(/hh/g, hh);
  format = format.replace(/mm/g, mm);
  format = format.replace(/ss/g, ss);
  
  return(format);
 };
 
 // unixtime (秒)を求める。
 this.getUnixtime = function () {
  return(parseInt((new Date)/1000, 10));
 };
 
 // 画面の高さを求める。
 this.getBrowserHeight = function () {
  if(window.innerHeight){
   return(window.innerHeight);
  }
  else if(document.documentElement && (document.documentElement.clientHeight !== 0)){
   return(document.documentElement.clientHeight);
  }
  else if(document.body) {
   return(document.body.clientHeight);
  }
  else{
   return(0);
  }
 };
 
 // 画面の幅を求める。
 this.getBrowserWidth = function () {
  if(window.innerWidth){
   return(window.innerWidth);
  }
  else if(document.documentElement && (document.documentElement.clientWidth !== 0)){
   return(document.documentElement.clientWidth);
  }
  else if(document.body){
   return(document.body.clientWidth);
  }
  else{
   return(0);
  }
 };
 
 this.lockScreen = function (html) {
  if(!document.getElementById("lockScreen")){
   if((html === null) || (html === undefined)){
    html = "";
   }
   
   var elementsInput = document.getElementsByTagName("INPUT");
   var elementsSelect = document.getElementsByTagName("SELECT");
   var elementsTextarea = document.getElementsByTagName("TEXTAREA");
   var elementsButton = document.getElementsByTagName("BUTTON");
   
   for(var i = 0, j = elementsInput.length; i < j; i ++){
    elementsInput[i].blur();
   }
   
   for(i = 0, j = elementsSelect.length; i < j; i ++){
    elementsSelect[i].blur();
   }
   
   for(i = 0, j = elementsTextarea.length; i < j; i ++){
    elementsTextarea[i].blur();
   }
   
   for(i = 0, j = elementsButton.length; i < j; i ++){
    elementsButton[i].blur();
   }
   
   document.onkeydown =
   function () {
    if(event.keyCode == 9){
     return false;
    }
   };
   
   $("body").append("<div id='lockScreen' style='z-index:200;position:fixed;left:0;top:0;width:100%;height:100%;color:black;background-color:rgba(0,0,0,0.2);'>" + html + "</div>");
  }
 };
 
 this.unlockScreen = function () {
  if(document.getElementById("lockScreen")){
   document.onkeydown = null;
   $("#lockScreen").remove();
  }
 };
 
 // 全角英数を半角にする。
 this.convertFullSizeAlphabetAndNumber = function (string) {
  string = string.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
  return(string);
 };
 
 // ランダムな文字列を生成する。
 this.makeRandomString = function (l){
  // 生成する文字列の長さ
  if((l === null) || (l === undefined)){
   l = 8;
  }

  // 生成する文字列に含める文字セット
  var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
 
  var cl = c.length;
  var r = "";
  for(var i = 0; i < l; i ++){
   r += c[Math.floor(Math.random()*cl)];
  }
  
  return(r);
 };
 
 
 //
 // ### で囲まれた文字列を抜き出す。
 //
 this.getSkeleton = function (string){
  var splitString = string.split("");
  var stack = new Array();
  var inputKeyList = new Array();
  
  var isEscape = false;
  var isSharp1 = false;
  var isSharp2 = false;
  var countSharp = 0;
  
  for(var i = 0, j = splitString.length; i < j; i ++){
   var character = splitString[i];
   
   if((isEscape === false) && (character === "\\")){
    isEscape = true;
    continue;
   }
   
   if(isEscape === true){
    stack.push(character);
    isEscape = false;
    continue;
   }
   
   if(character === "#"){
    countSharp ++;
   
    if((isSharp1 === false) && (countSharp === 3)){
     isSharp1 = true;
    }
    else if((isSharp1 === true) && (countSharp === 3)){
     isSharp2 = true;
    }
   }
   else{
    countSharp = 0;
   }
   
   if(isSharp2 === true){
    isSharp1 = false;
    isSharp2 = false;
    countSharp = 0;
    
    stack.splice(-2);
    
    popedCharacter = "";
    inputKey = "";
    while(popedCharacter !== "#"){
     inputKey = popedCharacter + inputKey;
     popedCharacter = stack.pop();
    }
    
    stack.splice(-2);
    
    inputKeyList.push(inputKey);
   }
   else{
    stack.push(character);
   }
  }
  
  return(inputKeyList);
 };
 
 return(this);
}

var popupProfiles = {
 windowConfig:{
  height:600,
  width:1100,
  center:1,
  onUnload:function(){location.reload();}
 }
};
