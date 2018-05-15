// 説明   : title 一覧を取得。
// 作成日 : 2016/06/18
// 作成者 : 江野高広

var objGetTitle = new getTitle();

function getTitle (){
 this.idPrefix    = "title_list_";
 this.idTitleArea = this.idPrefix + "area";
 this.idTitleCondition = this.idPrefix + "condition";
 this.pageType = "";
 
 this.idTitleBox = function (restconfId){
  return(this.idPrefix + "box_" + restconfId);
 };
 
 this.restconfIdList = new Array();
 
 //
 // 検索文字列を記録する。
 //
 this.readCondition = function (){
  var condition = document.getElementById(this.idTitleCondition).value;
  objControleStorageL.setRestconfTitle(condition);
 };
 
 this.writeCondition = function (){
  var condition = objControleStorageL.getRestconfTitle();
  document.getElementById(this.idTitleCondition).value = condition;
 };
 
 
 //
 // restconf title 一覧を取得、表示する。
 //
 this.getRestconfTitle = function (pageType){
  this.pageType = pageType;
  
  var condition = objControleStorageL.getRestconfTitle();
  
  this.removeAllRestconfTitle();
  
  $.ajax({
   type : "post",
   url  : "/cgi-bin/ODLman/get_restconf_title.cgi",
   data : {
    "condition" : condition
   },
   success : function (jsonResult) {
    
    if((jsonResult !== null) && (jsonResult !== undefined)){
     var hashResult = null;
     
     try{
      hashResult = JSON.parse(jsonResult);
     }
     catch(error){
      
     }
     
     if(hashResult !== null){
      var result    = hashResult["result"];
      var titleList = hashResult["restconf_title_list"];
      
      for(var i = 0, j = titleList.length; i < j; i ++){
       var restconfId     = titleList[i]["restconf_id"];
       var restconfTitle  = titleList[i]["restconf_title"];
       var restconfMethod = titleList[i]["restconf_method"];
       
       var elDiv = objGetTitle.makeRestconfTitle(objGetTitle.pageType, restconfId, restconfTitle, restconfMethod);
       document.getElementById(objGetTitle.idTitleArea).appendChild(elDiv);
       
       objGetTitle.restconfIdList.push(restconfId);
      }
     }
    }
    else{
     alert("CGI Error");
    }
   },
   error : function (){
    alert("Server Error");
   }
  });
 };
 
 
 
 //
 // restconf title 1つを作成する。
 //
 this.makeRestconfTitle = function (pageType, restconfId, restconfTitle, restconfMethod){
  var elDiv = document.createElement("div");
  elDiv.setAttribute("class", "restconf_title_" + restconfMethod);
  elDiv.setAttribute("id", this.idTitleBox(restconfId));
  
  if(pageType === "restconf"){
   elDiv.onclick = new Function("objRestconf.getRestconfDate('" + restconfId + "')");
  }
  else if(pageType === "register"){
   elDiv.onclick = new Function("objRegister.getRestconfDate('" + restconfId + "')");
  }
  
  var elSpan = document.createElement("span");
  elSpan.innerHTML = restconfTitle;
  
  elDiv.appendChild(elSpan);
  
  return(elDiv);
 };
 
 
 
 //
 // タイトルの箱を削除。
 //
 this.removeRestconfTitle = function (restconfId){
  document.getElementById(this.idTitleArea).removeChild(document.getElementById(this.idTitleBox(restconfId)));
  
  for(var i = 0, j = this.restconfIdList.length; i < j; i ++){
   if(this.restconfIdList[i] === restconfId){
    this.restconfIdList.splice(i, 1);
    break;
   }
  }
 };
 
 
 
 //
 // タイトルの箱を全て削除。
 //
 this.removeAllRestconfTitle = function (){
  for(var i = this.restconfIdList.length - 1; i >= 0; i --){
   var restconfId = this.restconfIdList[i];
   document.getElementById(this.idTitleArea).removeChild(document.getElementById(this.idTitleBox(restconfId)));
   this.restconfIdList.splice(i, 1);
  }
 };
 
 
 
 //
 // タイトルの箱を変更する。
 //
 this.chageRestconfTitle = function (restconfId, restconfTitle, restconfMethod){
  var elDiv = document.getElementById(this.idTitleBox(restconfId));
  elDiv.className = "restconf_title_" + restconfMethod;
  elDiv.childNodes[0].innerHTML = restconfTitle;
 };
 
 
 
 return(this);
}
