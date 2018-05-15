// 説明   : Restconf 要素定義画面の作成。
// 作成日 : 2016/06/06
// 作成者 : 江野高広

var objRegister = new register();

function register (){
 this.idPrefix    = "register_";
 this.idRestconfHeaderTitle  = this.idPrefix + "header_title";
 this.idRestconfSubmitButton = this.idPrefix + "submit_button";
 this.idRestconfDeleteButton = this.idPrefix + "delete_button";
 this.idRestconfTitle = this.idPrefix + "title";
 this.idRestconfUrl   = this.idPrefix + "url";
 this.idJsonZone  = this.idPrefix + "json_zone";
 this.idGroupZone = this.idPrefix + "group_zone";
 this.idDatalistOptions = this.idPrefix + "datalist_options";
 this.idManualId = this.idPrefix + "manual_id";
 
 this.restconfId     = "";
 this.restconfTitle  = "";
 this.restconfUrl    = "";
 this.restconfMethod = 2;
 this.jsonSortList  = new Array();
 this.jsonList      = new Object();
 this.groupList     = new Array();
 this.inputSortList = new Object();
 this.inputList     = new Object();
 
 this.elementId1 = "key";
 this.elementId2 = "name";
 this.elementId3 = "type";
 this.elementId4 = "option";
 
 // Method のradio button のid
 this.idMethod = function (restconfMethod){
  return(this.idPrefix + "method-" + restconfMethod);
 };
 
 // JSON の表示枠のid
 this.idJson = function (jsonId){
  return(this.idPrefix + "json-" + jsonId);
 };
 
 // JSON のtextarea のid
 this.idJsonText = function (jsonId){
  return(this.idPrefix + "jsonText-" + jsonId);
 };
 
 // JSON の繰り返し指定のcheckbox のid
 this.idJsonRepeat = function (jsonId){
  return(this.idPrefix + "jsonRepeat-" + jsonId);
 };
 
 // グループの表示欄のid
 this.idGroup = function (groupId){
  return(this.idPrefix + "group-" + groupId);
 };
 
 // 値の定義欄のid
 this.idInput = function (inputId){
  return(this.idPrefix + "input-" + inputId);
 };
 
 // 値の要素1つの定義欄のid
 this.idElement = function (inputId, elementIndex){
  if(elementIndex === 1){
   return(this.idPrefix + "element_" + inputId + "-" + this.elementId1);
  }
  else if(elementIndex === 2){
   return(this.idPrefix + "element_" + inputId + "-" + this.elementId2);
  }
  else if(elementIndex === 3){
   return(this.idPrefix + "element_" + inputId + "-" + this.elementId3);
  }
  else if(elementIndex === 4){
   return(this.idPrefix + "element_" + inputId + "-" + this.elementId4);
  }
 };
 
 // element4 の枠のid
 this.idLi4 = function (inputId){
  return(this.idPrefix + "li_" + inputId + "-" + this.elementId4);
 };
 
 // HTML ID からデータID を取り出す。
 this.getDataId = function(htmlId){
  var splitHtmlIdList = htmlId.split("-");
  var dataId = splitHtmlIdList.pop();
  return(dataId);
 };
 
 
 
 //
 // 初期化
 //
 this.initialize = function (){
  this.restconfId     = "";
  this.restconfTitle  = "";
  this.restconfUrl    = "";
  this.restconfMethod = 2;
  
  document.getElementById(this.idRestconfHeaderTitle).innerHTML  = "-";
  document.getElementById(this.idRestconfSubmitButton).innerHTML = "新規作成";
  
  document.getElementById(this.idRestconfTitle).value = "";
  document.getElementById(this.idRestconfUrl).value   = "";
  document.getElementById(this.idJsonText("default")).value      = "";
  document.getElementById(this.idJsonText("default")).readOnly   = false;
  document.getElementById(this.idJsonText("default")).className  = "";
  document.getElementById(this.idJsonRepeat("default")).checked  = false;
  document.getElementById(this.idJsonRepeat("default")).disabled = false;
  
  document.getElementById(this.idRestconfDeleteButton).className = "disable";
  document.getElementById(this.idRestconfDeleteButton).onclick = null;
  
  document.getElementById(this.idManualId).value = "";
  document.getElementById(this.idManualId).readOnly = false;
  document.getElementById(this.idManualId).className  = "";
  
  document.getElementById(this.idMethod(1)).checked = false;
  document.getElementById(this.idMethod(3)).checked = false;
  document.getElementById(this.idMethod(2)).checked = true;
  
  var elDivJsonZone = document.getElementById(this.idJsonZone);
  
  for(var i = this.jsonSortList.length - 1; i >= 0; i --){
   var jsonId = this.jsonSortList[i];
   
   if(jsonId !== "default"){
    elDivJsonZone.removeChild(document.getElementById(this.idJson(jsonId)));
   }
   
   delete(this.jsonList[jsonId]);
   this.jsonSortList.splice(i, 1);
  }
 
  var elDivGroupZone = document.getElementById(this.idGroupZone);
  
  for(i = this.groupList.length - 1; i >= 0; i --){
   var groupId = this.groupList[i];
   
   var elDivGroup = document.getElementById(this.idGroup(groupId));
   
   for(var j = this.inputSortList[groupId].length - 1; j >= 0; j --){
    var inputId = this.inputSortList[groupId][j];
    
    elDivGroup.removeChild(document.getElementById(this.idInput(inputId)));
    
    delete(this.inputList[inputId]);
    this.inputSortList[groupId].splice(j, 1);
   }
   
   delete(this.inputSortList[groupId]);
   
   if(groupId !== "default"){
    elDivGroupZone.removeChild(elDivGroup);
   }
   
   this.groupList.splice(i, 1);
  }
  
  this.addJsonZone("default");
  this.addGroupZone("default");
  this.ddInputList(); 
 };
 
 
 
 //
 // タイトルを入れる。
 //
 this.addTitle = function (restconfTitle){
  document.getElementById(this.idRestconfTitle).value = restconfTitle;
  this.restconfTitle = restconfTitle;
 };
 
 
 
 //
 // URL を入れる。
 //
 this.addUrl = function (restconfUrl){
  document.getElementById(this.idRestconfUrl).value = restconfUrl;
  this.restconfUrl = restconfUrl;
 };
 
 
 
 //
 // JSON 表示欄を作る。
 //
 this.addJsonZone = function (jsonId, jsonRepeatType, jsonText){
  if((jsonId === null) || (jsonId === undefined)){
   jsonId =objCommonFunctions.makeRandomString(16);
   
   while(1){
    if(!(jsonId in this.jsonSortList)){
     break;
    }
    else{
     jsonId =objCommonFunctions.makeRandomString(16);
    }
   }
  }
  
  if((jsonRepeatType === null) || (jsonRepeatType === undefined)){
   jsonRepeatType = 0;
  }
  
  if((jsonText === null) || (jsonText === undefined)){
   jsonText = "";
  }
  
  if(!(jsonId in this.jsonList)){
   this.jsonSortList.push(jsonId);
   this.jsonList[jsonId] = new Object();
  }
  
  this.jsonList[jsonId]["repeat"] = jsonRepeatType;
  this.jsonList[jsonId]["text"]   = jsonText;
  
  var checkboxId = this.idJsonRepeat(jsonId);
  var textareaId = this.idJsonText(jsonId);
   
  if(jsonId !== "default"){
   var elDiv = document.createElement("div");
   elDiv.setAttribute("class", "json_zone");
   elDiv.setAttribute("id", this.idJson(jsonId));
   var elP1 = document.createElement("p");
   var elCheckbox = document.createElement("input");
   elCheckbox.setAttribute("type", "checkbox");
   elCheckbox.value = "1";
   elCheckbox.setAttribute("id", checkboxId);
   elCheckbox.checked = false;
   elCheckbox.onchange = new Function("objRegister.changeJsonRepeatType('" + jsonId + "')");
   var elLabel = document.createElement("label");
   elLabel.setAttribute("class", "checkbox1");
   elLabel.setAttribute("for", checkboxId);
   elLabel.innerHTML = "繰り返す";
   var elImg = document.createElement("img");
   elImg.setAttribute("src", "img/cancel.png");
   elImg.setAttribute("width", "16");
   elImg.setAttribute("height", "16");
   elImg.setAttribute("alt", "delete");
   elImg.setAttribute("class", "onclick_node");
   elImg.onclick = new Function("objRegister.deleteJson('" + jsonId + "')");
   var elP2 = document.createElement("p");
   var elTextarea = document.createElement("textarea");
   //elTextarea.setAttribute("cols", "58");
   //elTextarea.setAttribute("rows", "20");
   elTextarea.style.width = "364px";
   elTextarea.style.height = "242px";
   elTextarea.setAttribute("id", textareaId);
   elTextarea.value = "";
   elTextarea.spellcheck = false;
   elTextarea.onblur = new Function("objRegister.changeJsonText('" + jsonId + "'); objRegister.makeInputKeyDstalist();");
   
   if(this.restconfMethod === 1){
    elCheckbox.disabled = true;
    elTextarea.readOnly = true;
    elTextarea.className = "disable";
   }
   
   elP1.appendChild(elCheckbox);
   elP1.appendChild(elLabel);
   elP1.appendChild(elImg);
   elP2.appendChild(elTextarea);
   elDiv.appendChild(elP1);
   elDiv.appendChild(elP2);
   
   document.getElementById(this.idJsonZone).appendChild(elDiv);
  }
  
  if(jsonRepeatType === 1){
   document.getElementById(checkboxId).checked = true;
  }
  document.getElementById(textareaId).value = jsonText;
 };
 
 
 
 //
 // グループの表示欄を作る。
 //
 this.addGroupZone = function (groupId){
  if((groupId === null) || (groupId === undefined)){
   groupId =objCommonFunctions.makeRandomString(16);
   
   while(1){
    if(!(groupId in this.inputSortList)){
     break;
    }
    else{
     groupId =objCommonFunctions.makeRandomString(16);
    }
   }
  }
  
  if(!(groupId in this.inputSortList)){
   this.groupList.push(groupId);
   this.inputSortList[groupId] = new Array();
  }
  
  if(groupId !== "default"){
   var elDiv = document.createElement("div");
   elDiv.setAttribute("class", "group_zone");
   elDiv.setAttribute("id", this.idGroup(groupId));
   var elH3 = document.createElement("h3");
   var elSpan = document.createElement("span");
   elSpan.innerHTML = "繰り返し用入力欄";
   var elImg = document.createElement("img");
   elImg.setAttribute("src", "img/cancel.png");
   elImg.setAttribute("width", "16");
   elImg.setAttribute("height", "16");
   elImg.setAttribute("alt", "delete");
   elImg.setAttribute("class", "onclick_node");
   elImg.onclick = new Function("objRegister.deleteGroup('" + groupId + "')");
   elH3.appendChild(elSpan);
   elH3.appendChild(elImg);
   elDiv.appendChild(elH3);
   
   document.getElementById(this.idGroupZone).appendChild(elDiv);
  }
 };
 
 
 
 //
 // 値の定義欄を1つ追加する。
 //
 this.addInputZone = function (groupId, inputId, inputKey, inputName, inputType, inputOption){
  if((groupId === null) || (groupId === undefined)){
   groupId = "default";
  }
  
  if((inputKey === null) || (inputKey === undefined)){
   inputKey = "";
  }
  
  if((inputName === null) || (inputName === undefined)){
   inputName = "";
  }
  
  if((inputType === null) || (inputType === undefined)){
   inputType = 1;
  }
  
  if((inputOption === null) || (inputOption === undefined)){
   inputOption = "30";
  }
  
  if((inputId === null) || (inputId === undefined)){
   inputId = objCommonFunctions.makeRandomString(16);
   
   while(1){
    if(!(inputId in this.inputList)){
     break;
    }
    else{
     inputId = objCommonFunctions.makeRandomString(16);
    }
   }
  }
  
  this.inputSortList[groupId].push(inputId);
  this.inputList[inputId] = new Object();
  this.inputList[inputId][this.elementId1] = inputKey;
  this.inputList[inputId][this.elementId2] = inputName;
  this.inputList[inputId][this.elementId3] = inputType;
  
  var inputValue = "";
  if((inputType === 1) || (inputType === 2)){
   inputValue = inputOption;
  }
  else if(inputType === 3){
   try{
    inputValue = inputOption.join(",");
   }
   catch(error){
    inputValue = inputOption;
   }
  }
  else if((inputType === 4) || (inputType === 5)){
   try{
    var line = new Array();
    for(var i = 0, j = inputOption.length; i < j; i ++){
     line.push(inputOption[i].join(","));
    }
    inputValue = line.join("\n");
   }
   catch(error){
    inputValue = inputOption;
   }
  }
  
  this.inputList[inputId][this.elementId4] = inputValue;
  
  var elDiv = this.makeInputZone(inputId);
  document.getElementById(this.idGroup(groupId)).appendChild(elDiv);
 };
 
 
 
 //
 // 値の定義欄を1つ生成する。
 //
 this.makeInputZone = function (inputId){
  var inputKey  = this.inputList[inputId][this.elementId1];
  var inputName = this.inputList[inputId][this.elementId2];
  var inputType = this.inputList[inputId][this.elementId3];
  var idElement1 = this.idElement(inputId, 1);
  var idElement2 = this.idElement(inputId, 2);
  var idElement3 = this.idElement(inputId, 3);
  
  var elDiv = document.createElement("div");
  elDiv.setAttribute("class", "input_list");
  elDiv.setAttribute("id", this.idInput(inputId));
  var elUl = document.createElement("ul");
  
  var elLi1 = document.createElement("li");
  var elSpan1 = document.createElement("span");
  var elSpan2 = document.createElement("span");
  elSpan1.innerHTML = "###";
  elSpan2.innerHTML = "###";
  var elInputKey = document.createElement("input");
  elInputKey.setAttribute("type", "text");
  //elInputKey.setAttribute("size", "14");
  elInputKey.style.width = "90px";
  elInputKey.setAttribute("placeholder", "変数名");
  elInputKey.setAttribute("list", this.idDatalistOptions);
  elInputKey.value = inputKey;
  elInputKey.spellcheck = false;
  elInputKey.setAttribute("id", idElement1);
  elInputKey.onblur = new Function("objRegister.changeElement124('" + inputId + "', " + 1 + ")");
  //elInputKey.setAttribute("list", idDatalist);
  //var elDatalist = document.createElement("datalist");
  //elDatalist.setAttribute("id", idDatalist);
  elLi1.appendChild(elSpan1);
  elLi1.appendChild(elInputKey);
  elLi1.appendChild(elSpan2);
  //elLi1.appendChild(elDatalist);
  
  var elLi2 = document.createElement("li");
  var elInputName = document.createElement("input");
  elInputName.setAttribute("type", "text");
  //elInputName.setAttribute("size", "20");
  elInputName.style.width = "130px";
  elInputName.setAttribute("placeholder", "見出し");
  elInputName.value = inputName;
  elInputName.setAttribute("id", idElement2);
  elInputName.spellcheck = false;
  elInputName.onblur = new Function("objRegister.changeElement124('" + inputId + "', " + 2 + ")");
  elLi2.appendChild(elInputName);
  
  var elLi3 = document.createElement("li");
  var elSelect = document.createElement("select");
  elSelect.setAttribute("id", idElement3);
  var elOption1 = document.createElement("option");
  elOption1.value = "1";
  elOption1.innerHTML = "text";
  var elOption2 = document.createElement("option");
  elOption2.value = "2";
  elOption2.innerHTML = "password";
  var elOption3 = document.createElement("option");
  elOption3.value = "3";
  elOption3.innerHTML = "checkbox";
  var elOption4 = document.createElement("option");
  elOption4.value = "4";
  elOption4.innerHTML = "radio";
  var elOption5 = document.createElement("option");
  elOption5.value = "5";
  elOption5.innerHTML = "select";
  
  if(inputType === 1){
   elOption1.selected = true;
  }
  else if(inputType === 2){
   elOption2.selected = true;
  }
  else if(inputType === 3){
   elOption3.selected = true;
  }
  else if(inputType === 4){
   elOption4.selected = true;
  }
  else if(inputType === 5){
   elOption5.selected = true;
  }
  
  elSelect.appendChild(elOption1);
  elSelect.appendChild(elOption2);
  elSelect.appendChild(elOption3);
  elSelect.appendChild(elOption4);
  elSelect.appendChild(elOption5);
  elSelect.onchange = new Function("objRegister.changeElement3('" + inputId + "')");
  elLi3.appendChild(elSelect);
  
  var elLi4 = document.createElement("li");
  elLi4.setAttribute("id", this.idLi4(inputId)); 
  var element4List = this.makeElement4(inputId, inputType);
  for(var i = 0, j = element4List.length; i < j; i ++){
   elLi4.appendChild(element4List[i]);
  }
  
  var elLi5 = document.createElement("li");
  var elImg = document.createElement("img");
  elImg.setAttribute("src", "img/cancel.png");
  elImg.setAttribute("width", "16");
  elImg.setAttribute("height", "16");
  elImg.setAttribute("alt", "delete");
  elImg.setAttribute("class", "onclick_node");
  elImg.onclick = new Function("objRegister.deleteInput('" + inputId + "')");
  elLi5.appendChild(elImg);
  
  elUl.appendChild(elLi1);
  elUl.appendChild(elLi2);
  elUl.appendChild(elLi3);
  elUl.appendChild(elLi4);
  elUl.appendChild(elLi5);
  elDiv.appendChild(elUl);
  
  return(elDiv);
 };
 
 
 
 //
 // 属性、値の入力欄を作る。
 //
 this.makeElement4 = function (inputId, inputType){
  var idElement4 = this.idElement(inputId, 4);
  var inputElement4 = this.inputList[inputId][this.elementId4];
  
  if((inputType === 1) || (inputType === 2)){
   var elSpanLength = document.createElement("span");
   elSpanLength.innerHTML = "size&nbsp;:&nbsp;";
   var elInputLength = document.createElement("input");
   elInputLength.setAttribute("type", "number");
   elInputLength.setAttribute("min", "1");
   elInputLength.setAttribute("max", "60");
   elInputLength.value = inputElement4;
   elInputLength.setAttribute("id", idElement4);
   elInputLength.onblur = new Function("objRegister.changeElement124('" + inputId + "', " + 4 + ")");
   
   return([elSpanLength, elInputLength]);
  }
  else if(inputType === 3){
   var elInputCheck = document.createElement("input");
   elInputCheck.setAttribute("type", "text");
   //elInputCheck.setAttribute("size", "20");
   elInputCheck.style.width = "130px";
   elInputCheck.value = inputElement4;
   elInputCheck.setAttribute("id", idElement4);
   elInputCheck.setAttribute("placeholder", "チェック有りの値,無しの値");
   elInputCheck.spellcheck = false;
   elInputCheck.onblur = new Function("objRegister.changeElement124('" + inputId + "', " + 4 + ")");
   
   return([elInputCheck]);
  }
  else if((inputType === 4) || (inputType === 5)){
   var elTextarea = document.createElement("textarea");
   //elTextarea.setAttribute("cols", "20");
   //elTextarea.setAttribute("rows", "3");
   elTextarea.style.width = "135px";
   elTextarea.style.height = "36px";
   elTextarea.value = inputElement4;
   elTextarea.setAttribute("id", idElement4);
   elTextarea.setAttribute("placeholder", "値,表示名");
   elTextarea.spellcheck = false;
   elTextarea.onblur = new Function("objRegister.changeElement124('" + inputId + "', " + 4 + ")");
   
   return([elTextarea]);
  }
 };
 
 
 
 //
 // 型の変更
 //
 this.changeElement3= function (inputId){
  var inputType = this.inputList[inputId][this.elementId3];
  var inputElement3 = undefined;
  var idElement3 = this.idElement(inputId, 3);
  
  var optionList = document.getElementById(idElement3).options;
  for(var i = 0, j = optionList.length; i < j; i ++){
   if(optionList[i].selected){
    inputElement3 = parseInt(optionList[i].value, 10);
    break;
   }
  }
  
  // データの形が違う場合は「属性、値」の表示を変えて初期値にする。
  if(!(((inputType === 1) && (inputElement3 === 2)) || ((inputType === 2) && (inputElement3 === 1)) || ((inputType === 4) && (inputElement3 === 5)) || ((inputType === 5) && (inputElement3 === 4)))){
   var elLi4 = document.getElementById(this.idLi4(inputId));
   var element4ListOld = elLi4.childNodes;
   for(i = element4ListOld.length - 1; i >= 0; i --){
    elLi4.removeChild(element4ListOld[i]);
   }
  
   if((inputElement3 === 1) || (inputElement3 === 2)){
    this.inputList[inputId][this.elementId4] = "30";
   }
   else{
    this.inputList[inputId][this.elementId4] = "";
   }
  
   var element4List = this.makeElement4(inputId, inputElement3);
   for(i = 0, j = element4List.length; i < j; i ++){
    elLi4.appendChild(element4List[i]);
   }
  }
  
  this.inputList[inputId][this.elementId3] = inputElement3;
 };
 
 
 
 //
 // 変数名、見出し、値の変更
 //
 this.changeElement124 = function (inputId, elementIndex){
  var idElement = this.idElement(inputId, elementIndex);
  var input = document.getElementById(idElement).value;
  
  if(elementIndex === 1){
   this.inputList[inputId][this.elementId1] = input;
  }
  else if(elementIndex === 2){
   this.inputList[inputId][this.elementId2] = input;
  }
  else if(elementIndex === 4){
   this.inputList[inputId][this.elementId4] = input;
  }
 };
 
 
 
 //
 // JSON の繰り返し型の変更
 //
 this.changeJsonRepeatType = function (jsonId){
  var isRepeat = document.getElementById(this.idJsonRepeat(jsonId)).checked;
  
  if(isRepeat){
   this.jsonList[jsonId]["repeat"] = 1;
  }
  else{
   this.jsonList[jsonId]["repeat"] = 0;
  }
 };
 
 
 
 //
 // JSON のテキストの変更
 //
 this.changeJsonText = function (jsonId){
  var jsonText =  document.getElementById(this.idJsonText(jsonId)).value;
  this.jsonList[jsonId]["text"] = jsonText;
 };
 
 
 
 //
 // タイトルの変更
 //
 this.changeTitle = function (){
  var restconfTitle = document.getElementById(this.idRestconfTitle).value;
  this.restconfTitle = restconfTitle;
 };
 
 
 
 //
 // Method の変更。
 //
 this.changeMethod = function (restconfMethod){
  this.restconfMethod = restconfMethod;
  this.activeJsonArea();
 };
 
 
 
 //
 // URL の変更
 //
 this.changeUrl = function (){
  var restconfUrl = document.getElementById(this.idRestconfUrl).value;
  this.restconfUrl = restconfUrl;
 };
 
 
 
 //
 // データ取得。
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
       objRegister.initialize();
       
       objRegister.restconfId     = hashResult["restconf_id"];
       objRegister.restconfTitle  = hashResult["restconf_title"];
       objRegister.restconfUrl    = hashResult["restconf_url"];
       objRegister.restconfMethod = hashResult["restconf_method"];
       
       document.getElementById(objRegister.idRestconfHeaderTitle).innerHTML  = objRegister.restconfTitle;
       document.getElementById(objRegister.idRestconfSubmitButton).innerHTML = "更新";
       
       document.getElementById(objRegister.idRestconfTitle).value = objRegister.restconfTitle;
       document.getElementById(objRegister.idRestconfUrl).value   = objRegister.restconfUrl;

       if(objRegister.restconfMethod === 1){
        document.getElementById(objRegister.idMethod(2)).checked = false;
        document.getElementById(objRegister.idMethod(3)).checked = false;
        document.getElementById(objRegister.idMethod(1)).checked = true;
       }
       else if(objRegister.restconfMethod === 2){
        document.getElementById(objRegister.idMethod(1)).checked = false;
        document.getElementById(objRegister.idMethod(3)).checked = false;
        document.getElementById(objRegister.idMethod(2)).checked = true;
       }
       else if(objRegister.restconfMethod === 3){
        document.getElementById(objRegister.idMethod(1)).checked = false;
        document.getElementById(objRegister.idMethod(2)).checked = false;
        document.getElementById(objRegister.idMethod(3)).checked = true;
       }
  
       for(var i = 0, j = hashResult["json_sort_list"].length; i < j; i ++){
        var jsonId         = hashResult["json_sort_list"][i];
        var jsonRepeatType = hashResult["json_list"][jsonId]["repeat"];
        var jsonText       = hashResult["json_list"][jsonId]["text"];
   
        objRegister.addJsonZone(jsonId, jsonRepeatType, jsonText);
       }
       
       for(i = 0, j = hashResult["group_list"].length; i < j; i ++){
        var groupId = hashResult["group_list"][i];
   
        objRegister.addGroupZone(groupId);
   
        for(var k = 0, l = hashResult["input_sort_list"][groupId].length; k < l; k ++){
         var inputId     = hashResult["input_sort_list"][groupId][k];
         var inputKey    = hashResult["input_list"][inputId]["key"];
         var inputName   = hashResult["input_list"][inputId]["name"];
         var inputType   = hashResult["input_list"][inputId]["type"];
         var inputOption = hashResult["input_list"][inputId]["option"];
         objRegister.addInputZone(groupId, inputId, inputKey, inputName, inputType, inputOption);
        }
       }
       
       document.getElementById(objRegister.idRestconfDeleteButton).className = "enable";
       document.getElementById(objRegister.idRestconfDeleteButton).onclick = new Function("objRegister.deleteRestconf()");
       document.getElementById(objRegister.idManualId).value = objRegister.restconfId;
       document.getElementById(objRegister.idManualId).readOnly = true;
       document.getElementById(objRegister.idManualId).className = "disable";
       objRegister.activeJsonArea();
       objRegister.ddInputList();
       objRegister.makeInputKeyDstalist();
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
 // JSON の削除。
 //
 this.deleteJson = function (jsonId){
  delete(this.jsonList[jsonId]);
  
  for(var i = 0, j = this.jsonSortList.length; i < j; i ++){
   if(this.jsonSortList[i] === jsonId){
    this.jsonSortList.splice(i, 1);
    break;
   }
  }
  
  document.getElementById(this.idJsonZone).removeChild(document.getElementById(this.idJson(jsonId)));
 };
 
 
 
 //
 // VALUE の削除。
 //
 this.deleteInput = function (inputId){
  delete(inputId);
  
  var groupId = "";
  DELETVALUE : for(groupId in this.inputSortList){
   for(var i = 0, j = this.inputSortList[groupId].length; i < j; i ++){
    if(this.inputSortList[groupId][i] === inputId){
     this.inputSortList[groupId].splice(i, 1);
     break DELETVALUE;
    }
   }
  }
  
  document.getElementById(this.idGroup(groupId)).removeChild(document.getElementById(this.idInput(inputId)));
 };
 
 
 
 //
 // GROUP の削除。
 //
 this.deleteGroup = function (groupId){
  for(var i = this.inputSortList[groupId].length - 1; i >= 0; i --){
   var inputId = this.inputSortList[groupId][i];
   delete(this.inputList[inputId]);
   this.inputSortList[groupId].splice(i, 1);
  }
  
  delete(this.inputSortList[groupId]);
  
  for(var k = 0, l = this.groupList.length; k < l; k ++){
   if(this.groupList[k] === groupId){
    this.groupList.splice(k, 1);
    break;
   }
  }
  
  document.getElementById(this.idGroupZone).removeChild(document.getElementById(this.idGroup(groupId)));
 };
 
 
 
 //
 // JSON 入力欄のアクティブ化、非アクティブ化。
 //
 this.activeJsonArea = function (){
  for(var i = 0, j = this.jsonSortList.length; i < j; i ++){
   var jsonId = this.jsonSortList[i];
   
   var checkboxId = this.idJsonRepeat(jsonId);
   var textareaId = this.idJsonText(jsonId);
   
   if(this.restconfMethod === 1){
    document.getElementById(checkboxId).disabled = true;
    document.getElementById(textareaId).readOnly = true;
    document.getElementById(textareaId).className = "disable";
   }
   else{
    document.getElementById(checkboxId).disabled = false;
    document.getElementById(textareaId).readOnly = false;
    document.getElementById(textareaId).className = "";
   }
  }
 };
 
 
 
 //
 // D & D 操作を定義。
 //
 this.ddInputList = function (){
  $(".group_zone").sortable({
   connectWith : ".group_zone",
   items : "div",
//   start : function (event, ui) {
//    var fromGroupHtmlId = event.target.id; // 移動元のGROUP ID
//    var inputHtmlId = ui.item.attr("id"); // 移動されたVALUE ID
//    console.log("START : " + fromGroupHtmlId + " " + inputHtmlId);
//   },
//   remove : function(event, ui){
//    var fromGroupHtmlId = event.target.id;// 移動元のGROUP ID
//    var inputHtmlId = ui.item.attr("id");// 移動されたVALUE ID
//    console.log("REMOVE : " + fromGroupHtmlId + " " + inputHtmlId);
//   },
   receive : function (event, ui){// 移動元と移動先が同じ場合は発動しない。
    var toGroupHtmlId = event.target.id;// 移動先のGROUP ID
    var inputHtmlId = ui.item.attr("id");// 移動されたVALUE ID
    objRegister.toGroupHtmlId = toGroupHtmlId;
   },
   stop : function (event, ui){// receive の後に発動する。移動元と移動先が同じ場合は単独で発動する。
    var fromGroupHtmlId = event.target.id;// 移動元のGROUP ID
    var inputHtmlId = ui.item.attr("id");// 移動されたVALUE ID
    objRegister.moveSortList(fromGroupHtmlId, inputHtmlId);
    objRegister.toGroupHtmlId = "";
   }
  });
 };
 
 
 
 //
 // 画面の並び順に合わせてデータの並び順も変更する。
 //
 this.toGroupHtmlId = "";
 this.moveSortList = function (fromGroupHtmlId, inputHtmlId){
  var fromGroupId = this.getDataId(fromGroupHtmlId);
  var inputId     = this.getDataId(inputHtmlId);
  
  // 移動元から削除。
  for(var i = 0, j = this.inputSortList[fromGroupId].length; i < j; i ++){
   if(this.inputSortList[fromGroupId][i] === inputId){
    this.inputSortList[fromGroupId].splice(i, 1);
    break;
   }
  }
  
  var toGroupHtmlId = "";
  var toGroupId = "";
  
  if(this.toGroupHtmlId.length > 0){
   toGroupHtmlId = this.toGroupHtmlId;
   toGroupId     = this.getDataId(toGroupHtmlId);
  }
  else{
   toGroupHtmlId = fromGroupHtmlId;
   toGroupId     = fromGroupId;
  }
  
  // 移動先に追加。0番目は<h2>
  var inputElemetntList = document.getElementById(toGroupHtmlId).childNodes;
  for(i = 1, j = inputElemetntList.length; i < j; i ++){
   if(inputElemetntList[i].id === inputHtmlId){
    this.inputSortList[toGroupId].splice(i - 1, 0, inputId);
    break;
   }
  }
 };
 
 
 
 //
 // 更新する。
 //
 this.register = function (){
  var textJsonSortList  = JSON.stringify(this.jsonSortList);
  var textJsonList      = JSON.stringify(this.jsonList);
  var textGroupList     = JSON.stringify(this.groupList);
  var textInputSortList = JSON.stringify(this.inputSortList);
  var textInputList     = JSON.stringify(this.inputList);
  var manualRestconfId = document.getElementById(this.idManualId).value;
  
  $.ajax({
   type : "post",
   url  : "/cgi-bin/ODLman/register.cgi",
   data : {
    "restconf_id"     : this.restconfId,
    "manual_restconf_id" : manualRestconfId,
    "restconf_title"  : this.restconfTitle,
    "restconf_url"    : this.restconfUrl,
    "restconf_method" : this.restconfMethod,
    "text_json_sort_list"  : textJsonSortList,
    "text_json_list"       : textJsonList,
    "text_group_list"      : textGroupList,
    "text_input_sort_list" : textInputSortList,
    "text_input_list"      : textInputList
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
       var insertUpdate = hashResult["insert_update"];
       var restconfId       = hashResult["restconf_id"];
       var restconfTitle    = hashResult["restconf_title"];
       var restconfMethod   = hashResult["restconf_method"];
       
       if(insertUpdate === "insert"){
        var elDiv = objGetTitle.makeRestconfTitle("register", restconfId, restconfTitle, restconfMethod);
        document.getElementById(objGetTitle.idTitleArea).appendChild(elDiv);
       }
       else if(insertUpdate === "update"){
        objGetTitle.chageRestconfTitle(restconfId, restconfTitle, restconfMethod);
       }
       
       objRegister.initialize();
      }
      else{
       alert(hashResult["reason"]);
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
 // 登録削除
 //
 this.deleteRestconf = function(){
  if(confirm("本当に削除しますか?")){
   $.ajax({
    type : "post",
    url  : "/cgi-bin/ODLman/delete_restconf.cgi",
    data : {
     "restconf_id" : this.restconfId
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
        var restconfId = hashResult["restconf_id"];
        objGetTitle.removeRestconfTitle(restconfId);
        objRegister.initialize();
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
  }
 };
 
 
 
 //
 // input key でdatalist を作る。
 //
 this.makeInputKeyDstalist = function (){
  var inputKeyHash = new Object();
  
  var url = this.restconfUrl;
  var inputKeyListUrl = objCommonFunctions.getSkeleton(url);
  for(var i = 0, j = inputKeyListUrl.length; i < j; i ++){
   var inputKey = inputKeyListUrl[i];
   inputKeyHash[inputKey] = inputKey;
  }
  
  for(var jsonId in this.jsonList){
   var json = this.jsonList[jsonId]["text"];
   
   var inputKeyListJson = objCommonFunctions.getSkeleton(json);
   for(i = 0, j = inputKeyListJson.length; i < j; i ++){
    inputKey = inputKeyListJson[i];
    inputKeyHash[inputKey] = inputKey;
   }
  }
  
  var elDatalist = document.getElementById(this.idDatalistOptions);
  var optionList = elDatalist.childNodes;
  for(var k = optionList.length - 1; k >= 0; k --){
   elDatalist.removeChild(optionList[k]);
  }
  
  for(inputKey in inputKeyHash){
   var elOption = document.createElement("option");
   elOption.setAttribute("value", inputKey);
   elDatalist.appendChild(elOption);
  }
 };
 
 
 
 return(this);
}


/*
var testRestconfId = "4dlA3IoB5hHmusGB";
var testRestconfTitle = "テスト";
var testRestconfUrl = "test/test/test/test";
var testJsonSortList  = ["default", "jAAAAAAAA", "jBBBBBBBB"];
var testJsonList      = {"default" : {"repeat" : 0, "text" : "DEFAULT"}, "jAAAAAAAA" : {"repeat" : 1, "text" : "AAAAAAAA"}, "jBBBBBBBB" : {"repeat" : 0, "text" : "BBBBBBBB"}};
var testGroupList     = ["default", "gAAAAAAAA", "gBBBBBBBB"];
var testInputSortList = {"default" : ["v11111111"], "gAAAAAAAA" : ["v22222222", "v33333333"], "gBBBBBBBB" : ["v44444444", "v55555555", "v66666666"]};
var testInputList = {
 "v11111111" : {
  "key" : "ip address",
  "name" : "IP Address",
  "type" : 1,
  "option" : "15"
 },
 "v22222222" : {
  "key" : "password",
  "name" : "Password",
  "type" : 2,
  "option" : "20"
 },
 "v33333333" : {
  "key" : "IF status",
  "name" : "Interface Status",
  "type" : 3,
  "option" : "shut,no shut"
 },
 "v44444444" : {
  "key" : "test4",
  "name" : "TEST-04",
  "type" : 4,
  "option" : "T,E\nS,T\n0,4"
 },
 "v55555555" : {
  "key" : "test5",
  "name" : "TEST-05",
  "type" : 5,
  "option" : "T,E\nS,T\n0,5"
 },
 "v66666666" : {
  "key" : "test6",
  "name" : "TEST-06",
  "type" : 5,
  "option" : "T,E\nS,T\n0,6"
 }
};
*/
