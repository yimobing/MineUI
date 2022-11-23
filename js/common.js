/**-----------------------------
 * IE8及以下版本ie浏览器兼容js原生bind()函数
 * 因为: js addEventListener为了兼容ie8及以下版本ie浏览器,会重写addEventListener方法,但重写的函数中会使用到js原生的bind(),但js原生bind()也是不支持ie8及以下版本的浏览器
 -----------------------------*/
if(!Function.prototype.bind){
	Function.prototype.bind = function(){
		if(typeof this !== 'function'){
			throw new TypeError('Function.prototype.bind -what is trying to be bound is not callable');
		}
		var _this = this;
		var obj = arguments[0];
		var args = Array.prototype.slice.call(arguments,1);
		return function(){
			_this.apply(obj,args);
		}
	}
}


 /**-----------------------------
 * 封装$.ajax
 *   调用方法：
    eg.最简单的如下：
    ajax({
        url: '',
        data: {    
        },
        success:function(res){
        },
        error: function(res){}
    })
-----------------------------*/
 function ajax(options){
    var defaults = {
		heading: '', //接口名称或描述或接口关键词（用于接口回调成功或失败提示信息的关键词，让看得明白、体验更友好）
		debug: false, //是否启用调试模式,默认false（调试模式下，接口若出错将把具体错误信息提示给用户；非调试模式下，接口若出错只给用户友好提示）
        async: false,
        type: 'GET',
        url: '',
        dataType: "html",
        data: { },
        cache: false,
        beforeSend: function (XMLHttpRequest) { },
        success: function (res) { },
        complete: function (XMLHttpRequest, textStatus) { },
        error: function(res) { 
			var debug = typeof this.debug == 'undefined' ? false : (this.debug.toString().toLocaleLowerCase() == "true" ? true : false);
			if(debug){
				var tips = 'Error，接口出错'; //eg.Error, 楼盘名称接口出错
				var action = getStringParams('action', this.url);
				if(action != '' && action != null && typeof action != 'undefined') 
					tips +='<br>' + action;
				if(this.heading !== '') tips += '<br>(' + this.heading + ')';
				alertDialog(tips);
			}else{
				alertDialog("Error，出错了，非常抱歉~");
			}
		}
    }
    var settings = $.extend(true,{},defaults,options||{});
    $.ajax(settings); //ajax
 }



 /**-----------------------------
 * 弹出提示窗口
 * @param {*} ps_str 提示信息
 -----------------------------*/
function alertDialog(ps_str){
	var tips = ps_str;
	if(typeof meuiDialog!='undefined'){
		meuiDialog.alert({
			caption: '提示',
			message: tips,
			buttons: ['确定']
		})
	}else{
		tips = ps_str.toString().replace(/\<br\>/g,'\n');
		alert(tips);
	}
}


/**
 * 获取字符串参数（截取字符串的某个参数值）
 * @param {*}　ps_key 参数名(可缺省). 若本参数在字符串中不存存，则返回null, 若本参数缺省或空，则返回字符串中各个参数组成的对象
 * @param {＊}　ps_url URL字符串(可缺省).若本参数缺省或空, 则会自动读取当前浏览器中的ps_url
 * @return {*}　返回对应参数值或所有参数组成的对象
 */
function getStringParams(ps_key, ps_url){
	ps_url = (typeof ps_url == 'undefined' || ps_url.toString().replace(/([ ]+)/g, '') == '') ? location.search : ps_url.replace(/(.*?)\?(.*?)$/, '?$2');
	ps_url = ps_url.replace(/^\?/,'').split('&');
	var paramsObj = {};
	for(var i = 0, iLen = ps_url.length; i < iLen; i++){
		var param = ps_url[i].split('=');
		if(param[0].toString().replace(/([ ]+)/g, '') != '') paramsObj[param[0]] = param[1];
	}
	if(ps_key){
		return paramsObj[ps_key] || null;
	}
	return paramsObj;
}

  

/**
 * 判断字符串是否为JSON格式
 * return {*} 返回值：true 字符串是json格式,  false 字符串是空、null、数组等非json格式
 */
function isJsonString(str){
	if(typeof str === 'string'){
		try{
			var obj = JSON.parse(str);
			if(typeof obj == 'object' && obj){
				return true;
			}else{
				return false;
			}
		}catch(e){
			//console.log('error:' + str + '!!!' + e);
			return false;
		}
	}
	//console.log('It is not a string!');
	return false;
}



 /**-----------------------------
 *      toolTip对象
 -----------------------------*/
var toolTip = {
     /**
	 * 当ajax执行成功进入success后，但返回的信息错误(如“返回的json字符串为空或为error状态”) 时弹出提示信息
	 * @param {*} ps_msg  JSON字符串
	 * @param {*} ps_url 接口url字段
	 * @param {*} ps_describe 接口描述(中文)
	 * @param {*} ps_debug 是否调用启用调试模式
	 * 返回值：true 接口一切正常， false 接口出错
	 */
	emptyTips:function(ps_msg, ps_url, ps_describe, ps_debug){
		if(typeof ps_url == 'undefined') return false;
		if(typeof ps_describe == 'undefined') ps_describe ='';
		var friendlyMsg = '读取失败，请重试！'; //友好提示信息
		var tips = ps_describe.toString().replace(/([ ]+)/g, '') == '' ? '' : '[ ' + ps_describe + ' ]'; // [获取XX结果]
		var ps_action = getStringParams('action', ps_url); //接口名称(英文)
		var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() == "true" ? true : false);
		
		// 1.空字符串状态：即ps_msg='' 或 ps_msg={} 时
		if(!ps_msg || $.isEmptyObject(ps_msg)){ 
			tips += '<br>错误：返回JSON字符串为空';
			tips += '<br>请检查接口：' + ps_action;
			debug ? alertDialog(tips) : alertDialog(friendlyMsg);
			return true;
		}
		if(!isJsonString(ps_msg)){
			if(ps_msg !== ''){
				tips += '<br>错误：请检查接口 ' + ps_action;
				tips += '<br>返回字符串：' + ps_msg;
				tips += '<br>(该字符串不是JSON格式！)';
				debug ? alertDialog(tips) : alertDialog(friendlyMsg);
				return true;
			}
		}

		var json = JSON.parse(ps_msg); 
		if(typeof json["return"]!='undefined'){ // 2.ERROR状态： {return:"error", data:"权限错误"} 或 {return:"error", data:"登录超时，请重新登录"}
			var ls_data = typeof json["data"] == 'undefined' ? '' : json["data"];
			if(json["return"]!='ok'){ //登录超时
				if(ls_data.indexOf("登录超时") >= 0){
					alertDialog(ls_data);
				}else if(ls_data.indexOf("次数超过") >= 0){ //查询次数超过N次
					alertDialog(ls_data);
				}else{ //接口错误
					tips += '<br>错误：请检查接口 ' + ps_action;
					tips += '<br>返回JSON字符串如下';
					tips += '<br>' + ps_msg;
					debug ? alertDialog(tips) : alertDialog(friendlyMsg);
				}
				return true;
			}
		}
		return false;
	},



	/**
	 * 当ajax执行成功进入success后, 获取到的json长度为零(即json={data:[]})时弹出错误提示信息
	 * @param {*} ps_msg  JSON字符串
	 * @param {*} ps_url 接口url字段
	 * @param {*} ps_describe 接口描述(中文)、
	 * @param {*} ps_debug 是否调用启用调试模式
	 * @return {boolean} 返回值：true 接口一切正常， false 接口出错(data长度为零或data为空或data属性不存在)
	 */
	zeroLenthTips:function(ps_msg, ps_url, ps_describe, ps_debug){
		if(typeof ps_url == 'undefined') return false;
		if(typeof ps_describe == 'undefined') ps_describe ='';
		var friendlyMsg = '读取失败，请重试！'; //友好提示信息
		var tips = ps_describe.toString().replace(/([ ]+)/g, '') == '' ? '' : '[ ' + ps_describe + ' ]'; // [获取XX结果]
		var ps_action = getStringParams('action', ps_url); //接口名称(英文)
		if(!this.emptyTips(ps_msg, ps_url, ps_describe, ps_debug)){ // OK状态：有返回数据
			var json = JSON.parse(ps_msg);
			var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() == "true" ? true : false);
			if(typeof json.data == 'undefined'){
				tips += '<br>错误：返回JSON不含Data属性';
				tips += '<br>请检查接口：' + ps_action;
				debug ? alertDialog(tips) : alertDialog(friendlyMsg);
				return true;
			}
			if(json.data.length == 0){
				tips += '<br>错误：返回JSON数据Data空';
				tips += '<br>请检查接口：' + ps_action;
				debug ? alertDialog(tips) : alertDialog(friendlyMsg);
				return true;
			}
		}
		return false;
	},

	/**
	 * 接口进入Error:function(){}状态时的提示信息
	 * @param {*} ps_msg  接口出错信息
	 * @param {*} ps_url 接口url字段
	 * @param {*} ps_describe 接口描述(中文)、
	 * @param {*} ps_debug 是否调用启用调试模式
	 * @return {boolean} 返回值：true 接口正常， false 接口进入到Error状态
	 */
	wrongTips:function(ps_msg, ps_url, ps_describe, ps_debug){
		if(typeof ps_url == 'undefined') return false;
		if(typeof ps_describe == 'undefined') ps_describe ='';
		var friendlyMsg = 'Error，出错了，非常抱歉~'; //友好提示信息
		var debug = typeof ps_debug == 'undefined' ? false : (ps_debug.toString().toLocaleLowerCase() == "true" ? true : false);
		if(debug){
			var tips = 'Error，接口出错'; //eg.Error, 楼盘名称接口出错
			var action = getStringParams('action', ps_url);
			if(action != '' && action != null && typeof action != 'undefined') 
				tips +='<br>' + action;
			if(ps_describe !== '') tips += '<br>(' + ps_describe + ')';
			alertDialog(tips);
			return true;
		}else{
			alertDialog(friendlyMsg);
			return true;
		}
		return false;
	}

} //end toolTip对象