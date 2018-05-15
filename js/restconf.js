// 説明   : Restconf 要素定義画面の作成。
// 作成日 : 2016/06/15
// 作成者 : 江野高広

var objRestconf = new restconf();

function restconf () {
 this.idPrefix    = "restconf_";
 this.idInputArea = this.idPrefix + "input_area";
 this.idRestconfTitle = this.idPrefix + "title";
 this.idSubmitButton = this.idPrefix + "submit_button";
 this.idDeleteButton = this.idPrefix + "delete_button";
 this.idResultArea = this.idPrefix + "result_area";
 this.idDatalistElements = this.idPrefix + "datalist_elements";
 this.idDatalistOptions  = this.idPrefix + "datalist_options";
 
 this.idGroupArea = function (groupId){
  return(this.idPrefix + "group_area-" + groupId);
 };
 
 this.idGroupZone = function (groupId, N){
  return(this.idPrefix + "group_zone-" + groupId + "-" + N);
 };
 
 this.idAddGroupZoneButton = function (groupId){
  return(this.idPrefix + "add_group-" + groupId);
 };
 
 
 this.restconfId     = "";
 this.restconfTitle  = "";
 this.restconfMethod = 2;
 this.groupList     = new Array();
 this.inputSortList = new Object();
 this.inputList     = new Object();
 this.groupCount    = new Object();
 this.valueList     = new Object();
 this.deleteKeyList = new Object();
 
 
 //
 // 入力欄1つのid
 //
 this.idInputZone = function (inputId, N, k){
  var idInput = this.idPrefix + "input_zone-" + inputId + "-" + N;
  
  if((k !== null) && (k !== undefined)){
   idInput = idInput + "-" + k;
  }
  
  return(idInput);
 };
 
 
 
 //
 // Restconf の入力欄組み立てに必要なデータをの初期化。
 //
 this.initialize = function (){
  this.restconfId     = "";
  this.restconfTitle  = "";
  this.restconfMethod = 2;
  
  for(var key in this.deleteKeyList){
   delete(this.deleteKeyList[key]);
  }
  
  document.getElementById(this.idRestconfTitle).innerHTML = "-";
  this.changeSubmitButton();
  //this.changeDeleteButton();
  
  var elDivInputArea = document.getElementById(this.idInputArea);
  
  for(var i = this.groupList.length - 1; i >= 0; i --){
   var groupId = this.groupList[i];
   
   for(var k = this.inputSortList[groupId].length - 1; k >= 0; k --){
    var inputId = this.inputSortList[groupId][k];
    
    delete(this.inputList[inputId]);
    delete(this.valueList[inputId]);
    this.inputSortList[groupId].splice(k, 1);
   }
   
   delete(this.inputSortList[groupId]);
   delete(this.groupCount[groupId]);
   this.groupList.splice(i, 1);
   
   elDivInputArea.removeChild(document.getElementById(this.idGroupArea(groupId)));
  }
 };
 
 
 
 //
 // Restconf の入力欄組み立てに必要なデータを格納する。
 //
 this.setInputList = function (groupId, inputId, inputKey, inputName, inputType, inputOption){
  if(!(groupId in this.inputSortList)){
   this.inputSortList[groupId] = new Array();
  }
  
  this.inputList[inputId] = new Object();
  this.inputSortList[groupId].push(inputId);
  
  this.inputList[inputId]["key"]  = inputKey;
  this.inputList[inputId]["name"] = inputName;
  this.inputList[inputId]["type"] = inputType;
  
  if((inputType === 1) || (inputType === 2)){
   this.inputList[inputId]["option"] = inputOption;
  }
  else if(inputType === 3){
   this.inputList[inputId]["option"] = new Array(2);
   var chackTrueValue  = inputOption[0];
   var checkFalseValue = inputOption[1];
   this.inputList[inputId]["option"][0] = chackTrueValue;
   this.inputList[inputId]["option"][1] = checkFalseValue;
  }
  else if((inputType === 4) || (inputType === 5)){
   this.inputList[inputId]["option"] = new Array();
   
   for(var i = 0, j = inputOption.length; i < j; i ++){
    this.inputList[inputId]["option"][i] = new Array(2);
    var value   = inputOption[i][0];
    var display = inputOption[i][1];
    this.inputList[inputId]["option"][i][0] = value;
    this.inputList[inputId]["option"][i][1] = display;
   }
  }
 };
 
 
 
 //
 // Restconf の入力欄組み立てに必要なデータを取得して表示する。
 //
 this.getRestconfDate = function (restconfId){
  $.ajax({
   type : "post",
   url  : "/cgi-bin/ODLman/get_restconf_data.cgi",
   data : {
    "restconf_id" : restconfId
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
      var result = hashResult["result"];
      
      if(result === 1){
       objRestconf.initialize();
       
       objRestconf.restconfId     = hashResult["restconf_id"];
       objRestconf.restconfTitle  = hashResult["restconf_title"];
       objRestconf.restconfMethod = hashResult["restconf_method"];
       var restconfUrl            = hashResult["restconf_url"];
       
       objRestconf.pickOutDeleteKey(restconfUrl);
       
       for(var i = 0, j = hashResult["group_list"].length; i < j; i ++){
        var groupId = hashResult["group_list"][i];
        objRestconf.groupCount[groupId] = 0;
   
        objRestconf.groupList.push(groupId);
   
        for(var k = 0, l = hashResult["input_sort_list"][groupId].length; k < l; k ++){
         var inputId     = hashResult["input_sort_list"][groupId][k];
         var inputKey    = hashResult["input_list"][inputId]["key"];
         var inputName   = hashResult["input_list"][inputId]["name"];
         var inputType   = hashResult["input_list"][inputId]["type"];
         var inputOption = hashResult["input_list"][inputId]["option"];
         objRestconf.setInputList(groupId, inputId, inputKey, inputName, inputType, inputOption);
        }
       }
       
       objRestconf.changeSubmitButton();
       //objRestconf.changeDeleteButton();
       objRestconf.makeInputArea();
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
 // URL からdelete に必要な要素を取り出す。
 //
 this.pickOutDeleteKey = function (restconfUrl){
  var deleteKeyList = objCommonFunctions.getSkeleton(restconfUrl);
  
  for(var i = 0, j = deleteKeyList.length; i < j; i ++){
   var key = deleteKeyList[i];
   this.deleteKeyList[key] = key;
  }
 };
 
 
 //
 // 初期状態の入力欄を作る。
 //
 this.makeInputArea = function (){
  var elDivInputArea = document.getElementById(this.idInputArea);
  document.getElementById(this.idRestconfTitle).innerHTML = this.restconfTitle;
  
  for(var i = 0, j = this.groupList.length; i < j; i ++){
   var groupId = this.groupList[i];
   
   var elDivGroupArea = document.createElement("div");
   elDivGroupArea.setAttribute("id", this.idGroupArea(groupId));
   
   if(groupId === "default"){
    elDivGroupArea.setAttribute("class", "group_area");
   }
   else{
    elDivGroupArea.setAttribute("class", "group_area repeat_group_area");
   }
   
   var elDivGroupZone = this.makeGroupZone(groupId);
   elDivGroupArea.appendChild(elDivGroupZone);
   
   if(groupId !== "default"){
    var elDivButton = document.createElement("div");
    elDivButton.setAttribute("id", this.idAddGroupZoneButton(groupId));
    
    var elImgButton = document.createElement("img");
    elImgButton.setAttribute("src", "img/add.png");
    elImgButton.setAttribute("width", "16");
    elImgButton.setAttribute("height", "16");
    elImgButton.setAttribute("alt", "add");
    elImgButton.setAttribute("class", "onclick_node");
    elImgButton.onclick = new Function("objRestconf.addGroupZone('" + groupId + "')");
    
    elDivButton.appendChild(elImgButton);
    elDivGroupArea.appendChild(elDivButton);
   }
   
   elDivInputArea.appendChild(elDivGroupArea);
  }
 };
 
 
 
 //
 // 入力欄の1グループを作る。
 //
 this.makeGroupZone = function (groupId){
  var N = this.groupCount[groupId];
  
  var elUl = document.createElement("ul");
  elUl.setAttribute("class", "input_list");
  
  if(groupId !== "default"){ 
   var elImgDeleteButton = document.createElement("img");
   elImgDeleteButton.setAttribute("width", "16");
   elImgDeleteButton.setAttribute("height", "16");
   elImgDeleteButton.setAttribute("alt", "delete");
   elImgDeleteButton.setAttribute("src", "img/cancel.png");
   elImgDeleteButton.setAttribute("class", "onclick_node");
   elImgDeleteButton.onclick = new Function("objRestconf.deleteGroupZone('" + groupId + "', " + N + ")");
   
   var elLiDeleteButton = document.createElement("li");
   elLiDeleteButton.appendChild(elImgDeleteButton);
   elUl.appendChild(elLiDeleteButton);
  } 
  
  for(var i = 0, j = this.inputSortList[groupId].length; i < j; i ++){
   var inputId   = this.inputSortList[groupId][i];
   
   var inputKey  = this.inputList[inputId]["key"];
   var inputName = this.inputList[inputId]["name"];
   var inputType = this.inputList[inputId]["type"];
   var idInput = this.idInputZone(inputId, N);
   
   var elLi = document.createElement("li");
   
   if(inputKey in this.deleteKeyList){
    var elImgDeleteKey = document.createElement("img");
    elImgDeleteKey.setAttribute("width", "16");
    elImgDeleteKey.setAttribute("height", "16");
    elImgDeleteKey.setAttribute("alt", "delete key");
    elImgDeleteKey.setAttribute("src", "img/font_red_delete.png");
    
    elLi.appendChild(elImgDeleteKey);
   }
   
   if(inputType === 1){
    var size = this.inputList[inputId]["option"];
    
    var elInputText = document.createElement("input");
    elInputText.setAttribute("type", "text");
    elInputText.setAttribute("size", size);
    elInputText.setAttribute("id", idInput);
    elInputText.setAttribute("list", this.idDatalistOptions);
    elInputText.value = "";
    elInputText.spellcheck = false;
    elInputText.onblur = new Function("objRestconf.readValue('" + inputId + "', " + N + ")");
    this.inputValue(inputId, N, "");
    
    var elSpanText = document.createElement("span");
    elSpanText.setAttribute("class", "input_title");
    elSpanText.innerHTML = inputName;
      
    elLi.appendChild(elSpanText);
    elLi.appendChild(elInputText);
    
    if(inputKey.match(/uuid/i)){
     var elSpanUuid = document.createElement("span");
     elSpanUuid.setAttribute("class", "onclick_node");
     elSpanUuid.innerHTML = "[uuid]";
     elSpanUuid.onclick = new Function("objRestconf.getUuid('" + inputId + "', " + N + ")");
     elLi.appendChild(elSpanUuid);
    }
   }
   else if(inputType === 2){
    size = this.inputList[inputId]["option"];
    
    var elInputPassword = document.createElement("input");
    elInputPassword.setAttribute("type", "password");
    elInputPassword.setAttribute("size", size);
    elInputPassword.setAttribute("id", idInput);
    elInputPassword.value = "";
    elInputPassword.onblur = new Function("objRestconf.readValue('" + inputId + "', " + N + ")");
    this.inputValue(inputId, N, "");
    
    var elSpanPassword = document.createElement("span");
    elSpanPassword.setAttribute("class", "input_title");
    elSpanPassword.innerHTML = inputName;
        
    elLi.appendChild(elSpanPassword);
    elLi.appendChild(elInputPassword);
   }
   else if(inputType === 3){
    var chackFalseValue = this.inputList[inputId]["option"][1];
    
    var elInputCheckbox = document.createElement("input");
    elInputCheckbox.setAttribute("type", "checkbox");
    elInputCheckbox.setAttribute("id", idInput);
    elInputCheckbox.value = 0;
    elInputCheckbox.onchange = new Function("objRestconf.readValue('" + inputId + "', " + N + ")");
    
    var elLabel = document.createElement("label");
    elLabel.setAttribute("class", "checkbox1");
    elLabel.setAttribute("for", idInput);
    elLabel.innerHTML = inputName;
               
    this.inputValue(inputId, N, chackFalseValue);
    
    elLi.appendChild(elInputCheckbox);
    elLi.appendChild(elLabel);
   }
   else if(inputType === 4){
    var elSpanRadio = document.createElement("span");
    elSpanRadio.setAttribute("class", "input_title");
    elSpanRadio.innerHTML = inputName;
    elLi.appendChild(elSpanRadio);
    
    var elSpanRadioButton = document.createElement("span");
    elSpanRadioButton.setAttribute("class", "radio_button");
    
    for(var k = 0, l = this.inputList[inputId]["option"].length; k < l; k ++){
     var idRadio = this.idInputZone(inputId, N, k);
     var radioLabel = this.inputList[inputId]["option"][k][1];
     
     var elInputRadio = document.createElement("input");
     elInputRadio.setAttribute("type", "radio");
     elInputRadio.setAttribute("name", idInput);
     elInputRadio.setAttribute("id", idRadio);
     elInputRadio.value = k;
     elInputRadio.onchange = new Function("objRestconf.readValue('" + inputId + "', " + N + ", " + k + ")");
     
     var elLabelRadio = document.createElement("label");
     elLabelRadio.setAttribute("for", idRadio);
     elLabelRadio.innerHTML = radioLabel;
     
     if(k === 0){
      elInputRadio.checked = true;
      var radioValue = this.inputList[inputId]["option"][k][0];
      this.inputValue(inputId, N, radioValue);
     }
     
     elSpanRadioButton.appendChild(elInputRadio);
     elSpanRadioButton.appendChild(elLabelRadio);
    }
    
    elLi.appendChild(elSpanRadioButton);
   }
   else if(inputType === 5){
    var elSpanSelect = document.createElement("span");
    elSpanSelect.setAttribute("class", "input_title");
    elSpanSelect.innerHTML = inputName;
    elLi.appendChild(elSpanSelect);
    
    var elSelect = document.createElement("select");
    elSelect.setAttribute("id", idInput);
    elSelect.onchange = new Function("objRestconf.readValue('" + inputId + "', " + N + ")");
    
    for(k = 0, l = this.inputList[inputId]["option"].length; k < l; k ++){
     var selectOption = this.inputList[inputId]["option"][k][1];
     var elOption = document.createElement("option");
     elOption.value = k;
     elOption.innerHTML = selectOption;
     
     if(k === 0){
      elOption.selected = true;
      var selectValue = this.inputList[inputId]["option"][k][0];
      this.inputValue(inputId, N, selectValue);
     }
     
     elSelect.appendChild(elOption);
    }
    
    elLi.appendChild(elSelect);
   }
   
   elUl.appendChild(elLi);
  }
  
  var elDivGroupZone = document.createElement("div"); 
  elDivGroupZone.setAttribute("id", this.idGroupZone(groupId, N));
  elDivGroupZone.setAttribute("class", "group_zone");
  elDivGroupZone.appendChild(elUl);
  
  this.groupCount[groupId] ++;
  
  return(elDivGroupZone);
 };
 
 
 
 //
 // Group Zone を追加する。
 //
 this.addGroupZone = function (groupId){
  var elDivGroupZone = this.makeGroupZone(groupId);
  document.getElementById(this.idGroupArea(groupId)).insertBefore(elDivGroupZone, document.getElementById(this.idAddGroupZoneButton(groupId)));
 };
 
 
 
 //
 // Group Zone を削除する。
 //
 this.deleteGroupZone = function (groupId, N){
  document.getElementById(this.idGroupZone(groupId, N)).style.display = "none";
  
  for(var i = 0, j = this.inputSortList[groupId].length; i < j; i ++){
   var inputId = this.inputSortList[groupId][i];
   this.inputValue(inputId, N, undefined);
  }
 };
 
 
 
 //
 // 入力値の格納
 //
 this.inputValue = function (inputId, N, value){
  if((N === null) || (N === undefined)){
   N = 0;
  }
  
  if(typeof(N) === "string"){
   N = parseInt(N, 10);
  }

  if(!(inputId in this.valueList)){
   this.valueList[inputId] = new Array();
  }
  
  this.valueList[inputId][N] = value;
 };
 
 
 
 //
 // 入力値を読み取って格納する。
 //
 this.readValue = function (inputId, N, k){
  var idInput = this.idInputZone(inputId, N);
  var inputType = this.inputList[inputId]["type"];
  var value = "";
  
  if((inputType === 1) || (inputType === 2)){
   value = document.getElementById(idInput).value;
  }
  else if(inputType === 3){
   if(document.getElementById(idInput).checked){
    value = this.inputList[inputId]["option"][0];
   }
   else{
    value = this.inputList[inputId]["option"][1];
   }
  }
  else if(inputType === 4){
   value = this.inputList[inputId]["option"][k][0];
  }
  else if(inputType === 5){
   var optionList = document.getElementById(idInput).options;
   
   for(var i = 0, j = optionList.length; i < j; i ++){
    if(optionList[i].selected === true){
     value = this.inputList[inputId]["option"][i][0]; 
     break;
    }
   }
  }
  
  this.inputValue(inputId, N, value);
 };
 
 
 
 //
 // ボタンの表示を変える。
 //
 this.changeSubmitButton = function (){
  var elButton = document.getElementById(this.idSubmitButton);
  
  if(this.restconfMethod === 1){
   elButton.innerHTML = "GET";
  }
  else if(this.restconfMethod === 2){
   elButton.innerHTML = "PUT";
  }
  else if(this.restconfMethod === 3){
   elButton.innerHTML = "POST";
  }
 };
 
 
/* 
 //
 // 削除ボタンの表示を変える。
 //
 this.changeDeleteButton = function (){
  var elButton = document.getElementById(this.idDeleteButton);
  
  if(this.restconfMethod === 1){
   elButton.className = "disable";
   elButton.onclick = null;
  }
  else if(this.restconfMethod === 2){
   elButton.className = "enable";
   elButton.onclick = new Function("objRestconf.deleteOdlData()");
  }
  else if(this.restconfMethod === 3){
   elButton.className = "enable";
   elButton.onclick = new Function("objRestconf.deleteOdlData()");
  }
 };
*/
 
 //
 // ODL へrestconf
 //
 this.restconf = function (isDelete){
  if(this.restconfId.length > 0){
   objCommonFunctions.lockScreen("<div class='div_loading_restconf'><img src='img/restconf.svg' width='660' height='220' alt='restconf'><div>");
   
   var valueList = new Object();
   
   for(var inputId in this.valueList){
    valueList[inputId] = new Array();
    
    for(var i = 0, j = this.valueList[inputId].length; i < j; i ++){
     var value = this.valueList[inputId][i];
     
     if((value !== null) && (value !== undefined) && (value.length > 0)){
      valueList[inputId].push(value);
     }
    }
   }
   
   var jsonValueList = JSON.stringify(valueList);
   
   var deleteFlag = 0;
   if(isDelete){
    deleteFlag = 1;
   }
   
   $.ajax({
    type : "post",
    url  : "/cgi-bin/ODLman/restconf.cgi",
    data : {
     "restconf_id"     : this.restconfId,
     "json_value_list" : jsonValueList,
     "delete" : deleteFlag
    },
    success : function (jsonResult) {
     
     if((jsonResult !== null) && (jsonResult !== undefined)){
      var hashResult = null;
      
      try{
       hashResult = JSON.parse(jsonResult);
      }
      catch(error){
       
      }
      
      objCommonFunctions.unlockScreen();
      
      if(hashResult !== null){
       var result = hashResult["result"];
       
       if(result === 1){
        var method = hashResult["method"];
        var url    = hashResult["url"];
        var json   = hashResult["json"];
        var odl    = hashResult["ODL"];
        
        objRestconf.viewResult(method, url, json, odl);
       }
       else{
        var reason = hashResult["reason"];
        alert(reason);
       }
      }
     }
     else{
      alert("CGI Error");
      objCommonFunctions.unlockScreen();
     }
    },
    error : function (){
     alert("Server Error");
     objCommonFunctions.unlockScreen();
    }
   });
  }
 };
 
 
 //
 // ODL のデータを削除する。
 //
 this.deleteOdlData = function (){
  if(confirm("本当に削除しますか?")){
   this.restconf(true);
  }
 };
 
 
 
 //
 // 結果を表示する。
 //
 this.viewResult = function (method, url, json, odl){
  objCommonFunctions.lockScreen("<div class='result_area' id='" + this.idResultArea + "'></div>");
  
  var elH2 = document.createElement("h2");
  var elImg = document.createElement("img");
  elImg.setAttribute("src", "img/cancel.png");
  elImg.setAttribute("width", "16");
  elImg.setAttribute("height", "16");
  elImg.setAttribute("alt", "cancel");
  elImg.setAttribute("class", "onclick_node");
  //elImg.onclick = new Function("objRestconf.removeScrollEvent(); objCommonFunctions.unlockScreen();");
  elImg.onclick = new Function("objCommonFunctions.unlockScreen();");
  
  elH2.appendChild(elImg);
  document.getElementById(this.idResultArea).appendChild(elH2);
  
  
  var elH3ResultUri = document.createElement("h3");
  elH3ResultUri.innerHTML = "送信先URL";
  var elDivResultUri = document.createElement("div");
  elDivResultUri.setAttribute("class", "result_zone");
  var elInputUri = document.createElement("input");
  elInputUri.setAttribute("type", "text");
  elInputUri.style.width = "840px";
  //elInputUri.setAttribute("size", "168");
  elInputUri.value = url;
  elInputUri.spellcheck = false;
  
  elDivResultUri.appendChild(elH3ResultUri);
  elDivResultUri.appendChild(elInputUri);
  document.getElementById(this.idResultArea).appendChild(elDivResultUri);
  
  
  if((method === "PUT") || (method === "POST")){
   var elH3ResultJson = document.createElement("h3");
   elH3ResultJson.innerHTML = "送信したJSON&nbsp;or&nbsp;XML";
   var elDivResultJson = document.createElement("div");
   elDivResultJson.setAttribute("class", "result_zone");
   var elTextareaJson = document.createElement('textarea');
   elTextareaJson.style.width = "840px";
   elTextareaJson.style.height = "192px";
   //elTextareaJson.setAttribute("cols", "140");
   //elTextareaJson.setAttribute("rows", "16");
   elTextareaJson.value = json;
   elTextareaJson.spellcheck = false;
   
   elDivResultJson.appendChild(elH3ResultJson);
   elDivResultJson.appendChild(elTextareaJson);
   document.getElementById(this.idResultArea).appendChild(elDivResultJson);
  }
  
  
  var elH3ResultOdl = document.createElement("h3");
  elH3ResultOdl.innerHTML = "ODL&nbsp;の応答";
  var elDivResultOdl = document.createElement("div");
  elDivResultOdl.setAttribute("class", "result_zone");
  var elTextareaOdl = document.createElement('textarea');
  elTextareaOdl.style.width = "840px";
  //elTextareaOdl.setAttribute("cols", "140");
  if((method === "PUT") || (method === "POST")){
   elTextareaOdl.style.height = "192px";
   //elTextareaOdl.setAttribute("rows", "16");
  }
  else{
   elTextareaOdl.style.height = "384px";
   //elTextareaOdl.setAttribute("rows", "32");
  }
  elTextareaOdl.value = odl;
  elTextareaOdl.spellcheck = false;
  
  elDivResultOdl.appendChild(elH3ResultOdl);
  elDivResultOdl.appendChild(elTextareaOdl);
  document.getElementById(this.idResultArea).appendChild(elDivResultOdl);
  
  //objRestconf.addScrollEvent();
 };
 
 
 
 //
 // 結果表示をマウスホイールで上下移動させる。
 //
 this.addScrollEvent = function () {
  var elDiv = document.getElementById(this.idResultArea);
  elDiv.addEventListener("mousewheel", objRestconf.scrollCommandViewer);
 };
 
 this.scrollCommandViewer = function (event){
  var scrollDelta = event.wheelDelta;
  scrollDelta = parseInt(scrollDelta / 4, 10);
  
  var elDiv = document.getElementById(objRestconf.idResultArea);
  var currentTop = elDiv.getBoundingClientRect().top;
  
  var divTop = currentTop + scrollDelta;
  
  elDiv.style.top = divTop.toString()  + "px";
  
  event.preventDefault();
 };
 
 this.removeScrollEvent = function (){
  var elDiv = document.getElementById(this.idResultArea);
  elDiv.removeEventListener("mousewheel", objRestconf.scrollCommandViewer);
 };
 
 
 
 //
 // UUID を取得する。
 //
 this.getUuid = function (inputId, N){
  $.ajax({
   type : "post",
   url  : "/cgi-bin/ODLman/get_uuid.cgi",
   data : {
    "input_id" : inputId,
    "N" : N
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
      var inputId = hashResult["input_id"];
      var N       = hashResult["N"];
      var uuid    = hashResult["uuid"];
      
      document.getElementById(objRestconf.idInputZone(inputId, N)).value = uuid;
      objRestconf.inputValue(inputId, N, uuid);
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
 // 入力候補作成。
 //
 this.readDataList = function (){
  var datalistElements = document.getElementById(this.idDatalistElements).value;
  objControleStorageL.setDataList(datalistElements);
 };
 
 this.writeDataList = function (){
  var dataList = objControleStorageL.getDataList();
  var textareaValue = "";
  
  for(var i = 0, j = dataList.length; i < j; i ++){
   if((dataList[i][0] !== null) && (dataList[i][0] !== undefined) && (dataList[i][0].length > 0)){
    var inputValue = dataList[i][0];
    var labelName  = dataList[i][1];
    textareaValue += inputValue + "," + labelName + "\n";
   }
  }
  
  document.getElementById(this.idDatalistElements).value = textareaValue;
 };
 
 this.makeDatalist = function (){
  var elDatalist = document.getElementById(this.idDatalistOptions);
  var optionList = elDatalist.childNodes;
  for(var k = optionList.length - 1; k >= 0; k --){
   elDatalist.removeChild(optionList[k]);
  }
  
  var dataList = objControleStorageL.getDataList();
  
  for(var i = 0, j = dataList.length; i < j; i ++){
   if((dataList[i][0] !== null) && (dataList[i][0] !== undefined) && (dataList[i][0].length > 0)){
    var inputValue = dataList[i][0];
    var labelName  = dataList[i][1];
    
    var elOption = document.createElement("option");
    elOption.setAttribute("value", inputValue);
    elOption.setAttribute("label", labelName);
    
    elDatalist.appendChild(elOption);
   }
  }
 };
 
 
 
 return(this);
}
