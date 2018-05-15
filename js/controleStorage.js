// 説明   : local storage に値を入れたり、出したりする。
// 作成日 : 2016/07/06
// 作成者 : 江野高広

var storageL = localStorage;
var objControleStorageL = new controleStorageL();

function controleStorageL () {
 // key の共通接頭語。
 this.prefix = "ODLman_";
 
 // 入力候補
 this.keyDataList = function(){
  return(this.prefix + "dataList");
 };
 
 this.getDataList = function (){
  var jsonDataList = storageL.getItem(this.keyDataList());
  
  if(jsonDataList !== null){
   var dataList = JSON.parse(jsonDataList);
   return(dataList);
  }
  else{
   dataList = new Array();
   return(dataList);
  }
 };
 
 this.setDataList = function (value){
  var dataList = new Array();
  
  var lineList = value.split("\n");
  for(var i = 0, j = lineList.length; i < j; i ++){
   var splitLine = lineList[i].split(",");
   
   var inputValue = splitLine[0];
   var labelName  = "";
   
   if((splitLine[1] !== null) && (splitLine[1] !== undefined)){
    labelName = splitLine[1];
   }
   
   dataList[i] = new Array(2);
   dataList[i][0] = inputValue;
   dataList[i][1] = labelName;
  }
  
  var jsonDataList = JSON.stringify(dataList);
  storageL.setItem(this.keyDataList(), jsonDataList);
 };
 
 
 
 // 検索文字列
 this.keyRestconfTitle = function (){
  return(this.prefix + "restconfTitle");
 };
 
 this.getRestconfTitle = function (){
  var restconfTitle = storageL.getItem(this.keyRestconfTitle());
  
  if(restconfTitle === null){
   restconfTitle = "";
  }
  
  return(restconfTitle);
 };
 
 this.setPostTitle = function (restconfTitle){
  if((restconfTitle === null) || (restconfTitle === undefined)){
   restconfTitle = "";
  }
  
  storageL.setItem(this.keyRestconfTitle(), restconfTitle);
 };
 
 
 
 // Tenan ID
 this.keyTenantId = function (){
  return(this.prefix + "tenantId");
 };
 
 this.getTenantId = function (){
  var tenantId = storageL.getItem(this.keyTenantId());
  
  if(tenantId === null){
   tenantId = "";
  }
  
  return(tenantId);
 };
 
 this.setTenantId = function (tenantId){
  if((tenantId === null) || (tenantId === undefined)){
   tenantId = "";
  }
  
  storageL.setItem(this.keyTenantId(), tenantId);
 };
 
 this.removetTenantId = function (){
  storageL.removeItem(this.keyTenantId());
 };
 
 return(this);
}
