/**********************
* meui函数库
* author: ChenMufeng
* update: 2020.08.05
**********************/



/*=============================================================================================*/
/* 					拓展prototype以兼容IE(部分IE不支持某些JS方法或属性,故在此作兼容处理)
/*=============================================================================================*/
/**-------------------------------------------------------
 * IE9以下浏览器不支持 js bind 
 * 因为: js addEventListener为了兼容ie8及以下版本ie浏览器,会重写addEventListener方法,但重写的函数中会使用到js原生的bind(),但js原生bind()也是不支持ie8及以下版本的浏览器 
 */
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


/**-------------------------------------------------------
 * ie9以下浏览器不支持js filter
 */
if(!Array.prototype.filter){
	Array.prototype.filter = function(fun /*,thisp*/){
		var len = this.length;
		if(typeof fun != 'function'){
			throw new TypeError();
		}
		var res = new Array();
		var thisp = arguments[1];
		for(var i=0; i< len; i++){
			if(i in this){
				var val = this[i]; //in case fun mutates this
				if(fun.call(thisp, val, i, this)){
					res.push(val);
				}
			}
		}
		return res;
	};
}


/**-------------------------------------------------------
 * ie9以下浏览器不支持 js indexOf
 */
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(elt /*,from*/){
		var len = this.length >>> 0;
		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			? Math.ceil(from)
			: Math.floor(from);
		if(from < 0) from += len;
		for(; from < len; from++){
			if(from in this && this[from] === elt) return from;
		}
		return -1;
	};
}

/**
 * 判断是否数组（兼容ie8)
 * 因原始JS方法:Array.isArray(str)存在IE兼容问题,故自定义了isArray()函数
 * @param {*} str 要检测的字符串或数组
 * return {*} 返回值. true 是数组, false 非数组
 */
function isArray(str){
	return Object.prototype.toString.call(str) == "[object Array]";
}


/*=============================================================================================*/
/* 										函数库
/*=============================================================================================*/
/**-------------------------------------------------------
 * 严格判断一个值是否等于NaN
 * @param {*} value 
 * ISNAN("听风是风"); //false
 * ISNAN("123听风是风"); //false
 * ISNAN(123); //false
 * ISNAN(NaN); //true
 */
//const ISNAN = (value) => value !== value; //IE不支持箭头函数的写法
function ISNAN(value){
	return value !== value;
}


/**-------------------------------------------------------
 * 将html标签转化成字符串
 *（如：将<转化成&lt;>转化成&gt;) 
 * @param {string} str html代码
 * @returns {string} 返回去掉标签的字符串
 */
function HTMLEncode(str) {
    var temp = document.createElement("div");
    (temp.textContent != null) ? (temp.textContent = str) : (temp.innerText = str);
    var output = temp.innerHTML.toString().replace(/\"/g,"&quot;").replace(/\'/g,"&apos;"); //双引号转化成&quot; 单引号转化成 &apos; 
	output = output.replace(/\r/g,"").replace(/\n/g,"").replace(/\t/g,"").replace(/\\/g,"/"); //回车\换行\制表符替换成空, 反斜杠\替换成对应斜杠/
    temp = null;
    return output;
}

/*-------------------------------------------------------*/
/**
 * 将字符串转化成html标签（如：将&lt;转化成<;&gt;转化成>)
 * @param {string} text 原字符串
 * @returns {string} 返回新字符串
 */
function HTMLDecode(text) { 
    var temp = document.createElement("div"); 
    temp.innerHTML = text; 
    var output = temp.innerText || temp.textContent; 
    temp = null; 
    return output; 
}



/**-------------------------------------------------------
* 获取url参数(jquery方法)
eg.
·传递参数（建议将所有参数写成json格式)
var ls_parm = {a:"福建省",b:"泉州市",c:"87"}
var srcUrl = http://localhost/login.aspx?parm='+encodeURI(JSON.stringify(ls_parm));
·获取参数：
var $paramsJson = JSON.parse($.getUrlParam('parm')); //jq接收url传递过来的参数
var ls_a = '', ls_b = '', ls_c = '',
if($paramsJson!=null){
	ls_a = $paramsJson.a;
	ls_b = $paramsJson.b;
	ls_c = $paramsJson.c;
}
·注：
1.若参数为json格式，则要先把json用stringify()函数转化成字符串。
2.若参数值含中文，请用encodeURI()进行编码，否则参数中有中文时会乱码；接收参数时一般无需再ecodeURI()进行解码（也不会乱码）
*/
(function ($) {
	$.getUrlParam = function (name) {
	 var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	 var r = window.location.search.substr(1).match(reg);
	 if (r != null) return decodeURI(r[2]); return null;
	}
})(jQuery);



/**-------------------------------------------------------
 * 获取URL中某个参数（截取URL字符串的某个参数值）(JS方法)
 * @param {string}　ps_key 参数名(可缺省). 若本参数在字符串中不存存，则返回null, 若本参数缺省或空，则返回字符串中各个参数组成的对象
 * @param {string}　ps_url URL字符串(可缺省).若缺省或空, 则会自动读取当前浏览器中的url
 * @returns {string}　返回值可能有3种：1.对应参数值，2.所有参数组成的对象，3. null
 * 注：location.search 返回当前URL的查询部分（即问号 ? 之后的部分）
 * eg. 假设：
 * 当前页面URL：'http://www.yy.com?englisth=90&math=70'
 * 有一字符串：var str = 'http://www.xx.com?action=1234&username=张三&sex=男'
 * var action = getUrlParams('action', str); //结果：1234
 * var action = getUrlParams('', str); //结果：{action:"1234", username:"张三", sex:"男"}
 * var action = getUrlParams('english'); //结果：90
 * var action = getUrlParams(); //结果：{englisth:"90", math:"70"}
 */
function getUrlParams(ps_key, ps_url){
	ps_url = (typeof ps_url == 'undefined' || ps_url.toString().replace(/([ ]+)/g, '') == '') ? location.search : ps_url.replace(/(.*?)\?(.*?)$/, '?$2');
	ps_url = ps_url.replace(/^\?/,'').split('&');
	var paramsObj = {};
	for(var i = 0, iLen = ps_url.length; i < iLen; i++){
		var param = ps_url[i].split('=');
		if(param[0].toString().replace(/([ ]+)/g, '') != '') paramsObj[param[0]] = param[1];
	}
	if(ps_key){
		var paramValue = typeof paramsObj[ps_key] == 'undefined' ? paramsObj[ps_key] : decodeURI(paramsObj[ps_key]); //decodeURI解码
		return paramValue || null;
	}
	return paramsObj;
}



/**-------------------------------------------------------
 * 获取字符串中问号?后面的参数
 * 即：截取问号后面的字符串
 * @param {string} ps_url url地址
 * @returns {string} 返回问号后面的那串参数
 * eg. http://www.xx.com/?a=1&b=2 结果返回：a=1&b=2
 */
function getUrlQuestionString(ps_url){
	var params = '';
	if(ps_url.indexOf('?') >= 0){
		params = ps_url.substr(ps_url.indexOf('?') + 1, ps_url.length);
	}
	return params;
}





/*-------------------------------------------------------*/
/*						遮罩
/*-------------------------------------------------------*/
/**-------------------------------------------------------
 * 禁止滚动(手机端)公用函数
 */
function winScroll(event){
	event.preventDefault();//touchemove中添加event.preventDefault()后会阻止浏览器默认的滚动
}
/*-------------------------------------------------------
* 创建遮罩
* @param 第1个参数 遮罩的id,eg. '#mask1'
* @param 第2个参数 遮罩的z-index
* edit 20181018-1
*/
function createMask(){
	var node = typeof(arguments[0])=='undefined' || arguments[0]=='' ? '#panel-mask' : arguments[0];
	var zindex = typeof(arguments[1])=='undefined' || arguments[1]=='' ? 50 : arguments[1];
	//add 20180802-1 下2行
	var hideMaskId = node.toString().replace('#','').replace('.','');
	var _maskHideStr = '<input type="hidden" id="maskFlag" value="'+hideMaskId+'">';
	if($('#maskFlag').length==0) $('body').append(_maskHideStr);
	else $('#maskFlag').val(hideMaskId);
	var id = node.indexOf('#')>=0  ? node.toString().replace('#','') : node;
	var _str = '<div id="'+id+'"></div>';
	if($(node).length==0) $('body').append(_str);
	var scrollHeight = document.body.scrollHeight; //整个网页高度(内容高度)
	$(node).attr('style',"position:fixed;top:0;left:0;right:0;z-index:"+zindex+";width:100%;height:100%;background-color:rgba(0,0,0,.7);background-color:#000;opacity:0.65;filter:Alpha(opcity=65);");
	//$('html,body').css({'height':scrollHeight,'overflow':'hidden'}); 
	$('html,body').attr('style','width:100%;height:'+scrollHeight+';overflow:hidden'); //禁止滚动(pc端)	 注意,若'height':'100%'则会闪屏
	if(checker.checkIsMobile()){
		window.addEventListener('touchmove',winScroll,{passive:false}); //禁止滚动（手机端,兼容chome手机模拟)
	}
}

/*-------------------------------------------------------
* 销毁遮罩
* @param 第1个参数 要关闭的遮罩ID
* edit 20181018-1
*/
function destroyMask(){
	var node = typeof(arguments[0])=='undefined' || arguments[0]=='' ? '#panel-mask' : arguments[0]; //add 20180802-1
	//var node = '#panel-mask'; // edit 20180802-1
	if($(node).length>0) $(node).fadeOut('fast').remove();
	$('html,body').removeAttr('style'); //解除禁止滚动(pc端)
	if(checker.checkIsMobile()){
		$('html,body').off('touchmove,touchstart'); //解除禁止滚动(手机端)1//$(window).off('touchmove,touchstart');
		window.removeEventListener('touchmove',winScroll,{passive:false}); 	//解除禁止滚动(手机端)2(解除window绑定的touchmove事件)
	}
}
	






/*=============================================================================================*/
/* 										对象库
/*=============================================================================================*/

/*-------------------------------------------------------*/
/*				webFront对象/前端公用函数集合
/*-------------------------------------------------------*/
var webFront = {
}



/*-------------------------------------------------------*/
/*				clear对象,用于清空某些东西
/*-------------------------------------------------------*/
var clear = {
}


/*-------------------------------------------------------*/
/*				dialog对象,用于弹出提示信息窗口
/*-------------------------------------------------------*/
var dialog = {
	/**
	 * 弹出提示窗口
	 * @param {string} ps_str 提示信息字符串
	 */
	alert:function(ps_str){
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
}




/*-------------------------------------------------------*/
/*			IEHacker对象,用于IE低版浏览器兼容JS部分属性
/*-------------------------------------------------------*/
var IEHacker = {
	/**
	 * IE8及以下浏览器兼容addEventListener
	 * 默认的ie8\ie7\ie6等低版本ie浏览器不支持js的addEventListener方法,只支持attachEvent方法,故需定个兼容函数
	 * @param {*} ele 绑定的元素
	 * @param {*} event 事件
	 * @param {*} fn 函数体
	 * eg.
		var usernameDom = document.getElementById('#username');
		if(usernameDom == null) return;
		//兼容ie8-的写法
		this.addEventListener(usernameDom,'paste',function(e){})
		//不兼容ie8-的原生js
		usernameDom.addEventListener('paste', function (e){})
	 */
	addEventListener:function(ele,event,fn){
		if(ele.addEventListener){
			ele.addEventListener(event,fn,false);
		}else{
			ele.attachEvent('on'+event,fn.bind(ele)); //js原生bind()函数也有兼容问题,故也需写个兼容函数
		}
	}
} //END IEHacker对象




/*-------------------------------------------------------*/
/*			past对象, 用于复制黏贴
/*-------------------------------------------------------*/
 var paste = {   
	/**
	 * 帖电话号码到输入框中
	 * bug：微信不支持paste事件
	 * @param {object} objId 输入框ID属性值.eg <input type="text" id="i-e-phone">, 则 objId='i-e-phone'
	 */
	telNumber:function(objId){
		var $this = this;
		var telDom = document.getElementById(objId);
		if(telDom == null) return;
		IEHacker.addEventListener(telDom, 'paste', function(e){
			if ( !(e.clipboardData && e.clipboardData.items) ) {
				return ;
			}
			for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
				var item = e.clipboardData.items[i];
				//console.log('item:',item);
				if (item.kind === "string") { //字符串类型
					item.getAsString(function (str) { // str 是获取到的剪切版中的字符串
						var ls_tel = filter.html(str); 
						//过滤非数字字符
						if(!checker.checkIsNumeric(ls_tel)){  //含有非数字字符
							ls_tel = filter.notNumericChar(ls_tel); //删掉非数字字符
						}
						if(!checker.checkTel(ls_tel)){
							var message = '您黏贴的电话号码有误，请检查';
							dialog.alert(message);
						}
						var tagName = telDom.tagName.toLocaleLowerCase();
						if(tagName=='input' || tagName=='textarea') telDom.value = ls_tel;
						else telDom.innerText = ls_tel;
						$this.phoneHighlight(ls_tel); //电话高亮
					})
				} else if (item.kind === "file") { //文件类型
					//var pasteFile = item.getAsFile();// pasteFile就是获取到的文件
				}
			}
		})
	},

	/**
	 * 电话号码高亮
	 * @param {object} objId 元素(输入框)对象
	 * @param {string} ps_tel 元素值(输入框值)
	 */
	phoneHighlight:function(objId, ps_tel){
		var telDom = $(objId).parent().siblings().children('a');
		if(typeof telDom == 'undefined') return;
		if(telDom.length == 0) return;
		if(checker.checkTel(ps_tel))
			telDom.addClass('hover').attr('href', 'tel:' + ps_tel);
		else 
			telDom.removeClass('hover').attr('href', '');
	}
	 
} //end paste对象




/*-------------------------------------------------------*/
/*			filter对象,用于过滤某些东西
/*-------------------------------------------------------*/
var filter = {

	/**
	 * 过滤HTML代码
	 * @param {string} str 原字符串 
	 * @param {boolean} isHTML 是否过滤html,css,js,换行,空格等多余内容. true 是(默认)， false 否
	 * @returns {string} 返回无html标签的新字符串
	 */
	html:function(str, isHTML){
		var flag = typeof isHTML == 'undefined' ? true : (isHTML == false ? false : true);
		if(flag){ //1.过滤标签(会保留标签之间的内容,但标签去掉)
			if(typeof str == 'undefined' || str == null) return '';
			var str = str.toString().replace(/\<style[\s\S]*>[\s\S]*<\/style>/g,''); //过滤css
			str = str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g,''); //过滤JS
			str = str.replace(/<[^<>]+?>/g,'');  //过滤html标签
			str = str.replace(/\ +/g,''); //去掉空格
			str = str.replace(/[\r\n]+?/g,''); //去掉换行
			str = str.replace(/(&nbsp;|&ensp;|&emsp;|&thinsp;)/ig, ''); //去掉nbsp、ensp、emsp、thinsp等空格
		}
		if(typeof HTMLEncode === 'function') str = HTMLEncode(str); //2.标签转化成字符串
		return str;
		//return str.replace(/<[^<>]+?>/g,'');
	},

	/**
	 * 过滤非数字字符，即删除非数字字符
	 * @param {string} str 原字符串
	 * @returns {string} 返回新字符串
	 */
	notNumericChar:function(str){
		return str.toString().replace(/\D/g,'');
	},

	/**
	 * 过滤字符串中相同的字符 
	 * 一组字符串中相同的字符只保留第一个
	 * @param {string} ps_str 原始字符串
	 * @param {string} ps_char 要替换的字符（可缺省）.若缺省则默认替换所有相同字符,否则只替换指定字符
	 * @returns {string} 返回新字符串
	 * eg. var str = "0.56.578.59"
	 * var newStr = repeatedChar(str); //结果：0.56789 所有相同字符只保留第一个
	 * var newStr = repeatedChar(str, '.'); //结果 0.5657859 只替换相同的小数点（保留第一个小数点）
	 */
	repeatedChar:function(ps_str, ps_char){
		var char = typeof ps_char == 'undefined' ? '' : ps_char;
		var result = ps_str.replace(/./g, function(s,index){
			return ps_str.indexOf(s) == index ? s : char == '' ? '' : (char == s ? '' : s);
		});
		return result;
	},

	/**
	 * 过滤字符串中的空格
	 * @param {string} ps_str 要替换的字符串
	 * @param {string} ps_method 替换方式(可缺省). all 全部替换(默认), one 保留一个空格
	 * @returns {string} 返回新字符串
	 */
	blankSpace:function(ps_str, ps_method){
		if(typeof ps_str == 'undefined' || ps_str == null) return ps_str;
		var isAll = typeof ps_method == 'undefined' ? 'all' : ps_method == 'one' ? 'one' : 'all';
		if(isAll) return ps_str.toString().replace(/\ +/g,''); //去掉所有空格
		else return ps_str.toString().replace(/([ ]+)/g, ' ');
	},


	/**
	 * 过滤特殊字符、代码
	 * @param {string} ps_str 要过滤字符串
	 * @param {string} ps_type 过滤类型：js, css, space 空格, html, linefeed 换行符
	 * @returns {string} 返回新字符串
	 */
	charOrCode:function(ps_str, ps_type){
		if(typeof ps_str == 'undefined' || ps_str == null) return ps_str;
		var result = ps_str;
		var str = ps_str.toString();
		var type = ps_type.toLocaleLowerCase();
		if(type == 'js') result = str.replace(/\<script[\s\S]*>[\s\S]*<\/script>/g,''); //去掉js
		if(type == 'css') result = str.replace(/\<style[\s\S]*>[\s\S]*<\/style>/g,''); //去掉css
		if(type == 'space') { //去掉空格
			result = str.replace(/\ +/g,''); //去掉纯空格
			result = result.replace(/([&nbsp;|&ensp;|&emsp;|&thinsp;])/ig, ''); //去掉nbsp、ensp、emsp、thinsp等空格
		}
		if(type == 'html') result = str.replace(/<[^<>]+?>/g,'');  //去掉HTML标签
		if(type == 'linefeed') result = str.replace(/[\r\n]+?/g,''); //去掉换行
		return result;
	}

} //END filter对象




/*-------------------------------------------------------*/
/*			move对象,用于移动某些东西（的位置等）
/*-------------------------------------------------------*/
var move = {
	/**
	 * 将光标移动到最后
	 * 即：设置光标位置到结尾并显示出来（兼容IE)（小bug：无法使用ctrl+A等快捷键)
	 * @param {*} elemId 元素节点ID.
	 */
	cursorPositionToLast:function(elemId){
		var elem = document.getElementById(elemId);
		var caretPos = elem.value.length;
		if (elem != null) {
			if (elem.createTextRange) {
				var range = elem.createTextRange();
				range.move('character', caretPos);
				range.select();
			}else {
				elem.setSelectionRange(caretPos, caretPos);
				elem.focus();
				//空格键
				var evt = document.createEvent("KeyboardEvent");
				evt.initKeyboardEvent("keypress", true, true, null, false, false, false, false, 0, 32);
				elem.dispatchEvent(evt);
				// 退格键
				evt = document.createEvent("KeyboardEvent");
				evt.initKeyboardEvent("keypress", true, true, null, false, false, false, false, 8, 0);
				elem.dispatchEvent(evt);
			}
		}
	}

} //END move对象




/*-------------------------------------------------------*/
/*			checker对象,用于校验
/*-------------------------------------------------------*/
var checker = {
	/**
	 * 检验字符串是否仅包含数字
	 * @param {*} str 
	 */
	checkIsNumeric:function(str){
		var reg = /^[0-9]+$/;
		var bools = reg.test(str) ? true: false;
		return bools;
	},

	/**
	 * 检验字符串是否小数或整数（正负小数、正负整数）
	 * @param {*} str 字符串
	 * @param {*} isPositiveOrNegative 检验类型（可缺省）。值：'both' 正负小数、正负整数(默认),'positive' 正整数、正小数，'negative' 负整数、负小数
	 */
	checkIsDecimal:function(str,isPositiveOrNegative){
		var types = typeof isPositiveOrNegative == 'undefined' ? 'both' : isPositiveOrNegative;
		var reg = /^\-?[0-9]+\.?[0-9]+$/; 
		if(types == 'positive') reg = /^[0-9]+\.?[0-9]+$/; //正整数、正小数
		if(types == 'negative') reg = /^\-[0-9]+\.?[0-9]+$/; //负整数、负小数
		var bools = !reg.test(str) ? false : true;
		return bools;
	},	

	/**
	* 检测是否图片
	* @param {boolean} 返回值：true 是, false 否
	*/
	checkIsImage:function(str){
		var reg = /\.(png|gif|png|jpeg|webp)$/;
		return reg.test(str);
	},


	/**
	 * 验证手机号码(正则表达式验证)
	 * @param {string} str 电话字符串
	 * @param {string} method 验证方式(可选).值: mobilephone 只能移动电话(默认), telephone 只能固定电话, both 移动电话或固定两者皆可
	 */
	checkTel:function(str, method){
		var method = typeof method == 'undefined' ? 'mobilephone' : method; //默认只验证的是“移动电话”
		//if(str.trim().length==11) return true; //..只检验是否11位
		//if(str.trim().length<=12 && str.trim().length>=6) return true; //..只检验是否6-12位(含固话、手机号）//不兼容ie8
		//if($.trim(str).length<=12 && $.trim(str).length>=6) return true; //..只检验是否6-12位(含固话、手机号）兼容ie8及以下版本
		//如果节点不存在，直接str.trim()会报错
		var bools = false;
		//var reg1 = /^0?1[3|4|5|7|8|9][0-9]\d{8}$/; //手机号码：13,14,15,17,18,19开头电话号码
		var reg1 = /^(0|86)?1\d{10}$/; //手机号码：11位数字. 最前面的 0是长途冠码, 86是中国区号
		var reg2 = /^((0|\+)?86(\s{1})?)?(0?\d{2,3}(\-|\s{1})?)?\d{7,8}$/; //固定电话：前面086或+86是中国区号, 中间10或010或0595是区号, 后面7-8位是号码
		if(method == 'telephone'){ //只能移动电话
			bools = reg2.test(str) ? true : false;
		}
		if(method == 'mobilephone'){ //只能固定电话
			bools = reg1.test($.trim(str)) ? true : false;
		}
		if(method == 'both'){ //移动电话或固定两者皆可
			bools = reg1.test($.trim(str)) || reg2.test(str) ? true : false;
		}
		return bools;
	},
	
	/**
	 * 判断是否小数
	 * @param {string} str 
	 */
	checkDecimal:function(str){
		var reg = /^[0-9]+\.[0-9]+$/;
		if(reg.test(str)) return true;
	},

	/**
	 * 判断是否贷款利率(即是否小数eg. 0.5,0.38,0.29)
	 * @param {string} str 数字字符
	 * @reutnr {boolean} true 是, false 否
	 */
	checkLendRate:function(str){ //
		var flag = true
		if($.trim(str)!=''){
			var reg = /^0+\.[0-9]+$/;
			if(!reg.test(str)) flag = false;
		}
		return flag;
	},
	/**
	 * 邮箱校验
	 * @param {*} email 邮箱字符
	 * @returns {boolean} true 格式正确, false 格式错误
	 */
	checkEmail:function(email){
		var emailReg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,4}$/;
		return emailReg.test(email);
	},

	/**
	 * 判断json是否为空
	 * 即判断json对象中的data数组是否有数据(数组或单个数据)
	 * true json非空（即有值）。eg.var json={"data":[{"value":"1001"}]}
	 * false json为空。eg1. var json=''; eg2.var json={}; eg3.var json={data:[]}
	 * @param {JSON} json json数据
	 */
	checkJsonHasData:function(json){
		/*
		var flag = true;
		if(!json) flag = true; // eg.var json = {} 或 var json = ''时
		if(typeof(json)!='object') flag = false; //不是json对象.eg.var json = ''
		if(typeof(json)=='object' && typeof(json.data)=='undefined') flag = false; //是json对象,但不存在数组
		if(typeof(json)=='object' && typeof(json.data)!='undefined' && json.data.length<=0) flag = false; //是json对象，也存在数组，但数组长度为0(没数据)
		//return flag;
		*/
		var flag = false;
		if(typeof json == 'object'){
			if(!$.isEmptyObject(json)){ //json!={}
				if(typeof json.data != 'undefined'){
					if(json.data.length > 0) flag = true;
				}
			}
		}
		return flag;
   },
	
   /**
	* 获取json长度
	* @param {*} $json
	* @returns {numeber} 返回数组长度
	*/
	getJsonLength:function($json){
		var length = 0;
		if(typeof($json.data)!='undefined') length = $json.data.length;
		else{
			for(var i in $json){
				length++;
			}
		}
		return length;
	},


	/**
	 * 判断字符串是否为JSON格式
	 * return {boolean} 返回值: true 是json,  false 是空、null、数组等非json
	 */
	isJsonString: function(str){
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
	},
	
	/**
	 * 检测是否手机端,如果是，返回true
	 * @returns {boolean} 返回值: true 是, false 否
	 */
	checkIsMobile:function(){
		var userAgentInfo = navigator.userAgent.toLowerCase();
		//console.log(userAgentInfo);
		var Agents = ["mobile","android","iphone","sysbian","windows phone","iPad","ipod","blackberry"];
		var flag = false;
		for(var i=0; i<Agents.length; i++){
			if(userAgentInfo.indexOf(Agents[i])>=0){
				flag = true;
				break;
			}
		}
		return flag;
	},
	
	/**
	 * 检测是否苹果公司的产品(iphone、ipad、mac、ipod)
	 * 即:检测是否苹果iphone手机(ios系统)
	 * @returns {boolean} 返回值: true 是, false 否
	 */
	checkIsApple:function(){
		var boolean = false;
		if (/iphone|ipod|mac|ipad/i.test(navigator.userAgent.toLocaleLowerCase())){
			boolean = true;
		}
		return boolean;	
	},
	

	/**
	* 检测是否IE浏览器
	* @returns {Booleans} 返回值：true 是ie, false 非ie
	*/
	checkIsIE:function(){
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
		var isIE = window.ActiveXObject || "ActiveXObject" in window;
		return isIE ? true : false;
	},


	/**
	 * 检测IE浏览器版本号
	 * @returns {number|string} 若是ie浏览器则返回对应版本号(整数), 否则返回一段文字
	 */
	checkIEVersion:function(){
		/*if(navigator.appName == "Microsoft Internet Explorer"){ //ie5-ie10
			var version = parseInt(navigator.appVersion.split(";")[1].toString().replace(/[ ]/g, "").replace("MSIE",""));
			return version;
		}else{
			if(navigator.userAgent.toLocaleLowerCase().search(/trident/i)) return 11; //检测ie11不能用这句，chrome也有trident
			else return '抱歉，不是IE浏览器，无法检测IE版本';
		}
		// if(navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].toString().replace(/[ ]/g, "").replace("MSIE",""))<9){
       	// 	alert("您的浏览器版本过低，请下载IE9及以上版本");
		// }
		*/
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var banben = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return 6;
            }else if(banben == 7){ 
                return 7; //ie7或ie5
            }else if(banben == 8){ 
                return 8;
            }else if(banben == 9){ 
                return 9;
            }else if(banben == 10){ 
                return 10;
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return 11;
            }else{ 
                return 0; //IE版本过低(ie5以下版本)
			}
		}else{
			return '抱歉，不是IE浏览器，无法检测IE版本';
		} 
	},

	
	/**
	 * 检测浏览器类型(ie,firefox,google chrome,safari,opera)
	 * @returns {string} 返回浏览器标识名
	 */
	checkBrowserType:function(){ //
		var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串 
        var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器 
        //var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera; //判断是否IE浏览器 
        var isIE = window.ActiveXObject || "ActiveXObject" in window;
        //var isEdge = userAgent.indexOf("Windows NT 6.1; Trident/7.0;") > -1 && !isIE; //判断是否IE的Edge浏览器 
        var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
        var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器 
        var isSafari = userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器 
        var isChrome = userAgent.indexOf("Chrome") > -1 && userAgent.indexOf("Safari") > -1&&!isEdge; //判断Chrome浏览器 
    
        if (isIE)  
        { 
            var reIE = new RegExp("MSIE (\\d+\\.\\d+);"); 
            reIE.test(userAgent); 
            var banben = parseFloat(RegExp["$1"]); 
            if(userAgent.indexOf('MSIE 6.0')!=-1){
                return "ie6";
            }else if(banben == 7){ 
                return "ie7"; //ie7或ie5
            }else if(banben == 8){ 
                return "ie8";
            }else if(banben == 9){ 
                return "ie9";
            }else if(banben == 10){ 
                return "ie10";
            } else if(userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)){ 
                return "ie11";
            }else{ 
                return "0"; //IE版本过低(ie5以下版本)
            } 
        }        
        if (isFF) { return "firefox";} 
        if (isOpera) { return "opera";} 
        if (isSafari) { return "safari";} 
        if (isChrome) { return "chrome";} 
        if (isEdge) { return "edge";} 
	}

} //END checker对象





/*-------------------------------------------------------*/
/*			objcetAttr对象,用于获取元素属性
/*-------------------------------------------------------*/
var objectAttr = {
	/**
	 * 获取元素属性(class或id)
	 * @param {string | object} dom 元素节点
	 * dom参数示例：'.title', '#title', $('#title')
	 */
	getClassID:function(dom){
		if(typeof dom == 'undefined') return '';
		if(dom.toString().replace(/([ ]+)/g, '') == '') return '';
		var selector = '';
		if(typeof(dom) == 'object'){
			selector = dom;
		}else{ //保留一个空格,该空格替换成点号或井号
			if($(dom).length == 0) return '';
			selector = typeof($(dom).attr('id')) == 'undefined' ?  
				'.' + $(dom)[0].className.trim().toString().replace(/([ ]+)/g, ' ').replace(/ /g, '.')
				: 
				'#' + $(dom).attr('id').trim().toString().replace(/([ ]+)/g, ' ').replace(/ /g, '#');
		}
		return selector;
	},

	/**
	 * 获取元素类型
	 * @param {string | object} dom 元素节点
	 * @returns {string} 返回元素标签名(小写). eg. input、textarea、span、div、select
	 * dom参数示例：'.title', '#title', $('#title')
	 */
	getNodeType:function(dom){
		var selector = this.getClassID(dom);
		var obj = typeof(selector) == 'object' ? selector : $(selector);
		var type = typeof obj[0] == 'undefined' ? '' : obj[0].tagName.toLocaleLowerCase();
		return type;
	},

	/**
	* 获取元素值
	* @param {string | object} dom 元素节点
	* dom 参数示例：'.title', '#title', $('#title')
	*/
	getElementValue:function(dom){
		var type = this.getNodeType(dom);	
		var value = '';
		if(type != ''){
			value = (type == 'input' || type == 'textarea') ? $(dom).val() : $(dom).text();
		}
		return value;
	}

} //END objectAttr对象




/*-------------------------------------------------------*/
/*			drawer,用于提取字符串
/*-------------------------------------------------------*/
var drawer = {
	/**
	 * 提取标签或字符串某个属性的值
	 * @param {string} ps_str 原字符串
	 * @param {string} ps_attr 属性名
	 * @returns {string} 返回属性值
	 */
	getPropertyValue: function(ps_str, ps_attr){
		var reg = new RegExp('/.*?' + ps_attr + '=[\"|\'](.*?)[\"|\'].*/', "gi");
		var reg = eval('/.*?' + ps_attr + '=[\"|\'](.*?)[\"|\'].*/gi'); //eg. var reg = /.*?data-user_hm=[\"|\'](.*?)[\"|\'].*/gi;
		return ps_str.toString().replace(reg, '$1');
	}
}



/*-------------------------------------------------------*/
/*			convert对象,用于转换数据类型等
/*-------------------------------------------------------*/
var convert = {
		
	/**
	 * 小数转化成百分数
	 * eg. 0.5 <=> 50%
	 * @param {*} ps_decimalStr 小数字符串
	 * @param {*} ps_method 取值方式:
		round 四舍五入，eg1. Math.floor(12.3)=12, eg2. Math.floor(12.8)=13
		loor 向下取数（即舍去小数，仅取整数部分）. 
		ceil 向上取整(即舍去小数，即小数部分一律向整数部分进位，整数部分+1)
	 * @param {*} ps_digit 小数位数,仅当ps_method='round'时有效（默认-1，即不处理原样返回.eg. 56.23% <=> 0.5623）
	 * @param {*} ps_isEmptyTips 空值时是否返回一个默认字符串，默认false
	 * eg.
	 	Math.floor(0.05)=0, eg2.Math.floor(12.3)=12, eg3. Math.floor(12.8)=12
		Math.ceil(0.05)=1, eg2. Math.ceil(12.3)=13, eg3. Math.ceil(12.8)=13
	 */
	decimal2Percent:function(ps_decimalStr, ps_method, ps_digit, ps_isEmptyTips){
		var method = typeof ps_method == 'undefined' || ps_method == '' ? 'round' : ps_method;
		var digit = typeof ps_digit == 'undefined' || ps_digit == '' ? -1 : parseInt(ps_digit);
		var isEmptyTips = typeof ps_isEmptyTips == 'undefined' ? false : (ps_isEmptyTips == true ? true : false);
		var percent = '';
		var decimal = ps_decimalStr.toString().replace(/[\%]/g,'');
		decimal = filter.repeatedChar(decimal,'.'); //只保留第1个小数点，其余去掉
		if(decimal != ''){
			if(method == 'round') {
				//percent = ps_decimalStr * 100;
				percent = decimal * 1000000 / 10000; //解决小数乘法bug
				if(digit >= 0) percent = percent.toFixed(digit);
			}
			if(method == 'floor') percent = Math.floor(decimal);
			if(method == 'ceil') percent = Math.ceil(decimal);
		}else{
			if(ps_isEmptyTips) percent = "如30%，请输入0.3";
		}
		return percent == '' ? '' : percent + '%';
	},


   /**
	* 百分数转成小数
	* eg. 50% <=> 0.5
	* @param {string} ps_percentStr 百分数字符串
	* @param {*} ps_digit 小数位数（默认-1，即不处理原样返回，eg. 0.5323 <=> 0.5323)
	*/
	percent2Decimal:function(ps_percentStr, ps_digit){
		var decimal = '';
		var percent = ps_percentStr;
		//if(percent.indexOf('%') >= 0){
			var digit = typeof ps_digit == 'undefined' || ps_digit == '' ? -1 : parseInt(ps_digit);
			//var decimal = percent.toString().replace(/[\%]/g, '') / 100;
			decimal = percent.toString().replace(/[\%]/g, '') * 1000000 / 100000000; //解决小数乘法bug
			if(parseInt(digit) > 0) decimal = decimal.toFixed(parseInt(digit));
		//}else{
			//decimal = percent;
		//}
		return decimal;
	},

	/**
	 * 将“元”转化成“万元”
	 * @param {*} ps_str “元”字符串
	 * @param {*} ps_method 取值方式(可缺省). round 四舍五入(默认), floor 向下取整, ceil 向下取整
	 * @param {*} ps_digit 小数位数(可缺省).(仅当ps_method='round'时有效), 默认-1，即不处理原样返回.eg.10546 <=> 10546）
	 * @param {*} ps_isEmptyTips 空值时是否返回一个默认字符串(可缺省).默认false
	 */
	yuan2TenThousand:function(ps_str, ps_method, ps_digit, ps_isEmptyTips){
		var method = typeof ps_method == 'undefined' ? 'round' : ps_method;
		var digit = typeof ps_digit == 'undefined' ? -1 : parseInt(ps_digit);
		var isEmptyTips = typeof ps_isEmptyTips == 'undefined' ? false : ps_isEmptyTips == true ? true : false;
		var wanYuan = '';
		if($.trim(ps_str) != ''){
				//wanYuan = ps_str / 10000;
				wanYuan = ps_str * 1000000 / 10000000000; //解决小数乘法bug
			if(method == 'round'){
				if(digit >= 0) wanYuan = wanYuan.toFixed(digit);
			}
			if(method == 'floor') wanYuan = Math.floor(wanYuan);
			if(method == 'ceil') wanYuan = Math.ceil(wanYuan);
		}else{
			if(ps_isEmptyTips) wanYuan = "";
		}
		return wanYuan;
	},

	/**
	 * 将“万元”转化成“元”
	 * @param {*} ps_str “万元”字符串
	 * @param {*} ps_digit 小数位数(可缺省). 大于0的数字表示几位小数，0 向下取整, -1(默认) 不处理原样返回(eg. 15000.37 <=> 15000.37)
	 */
	tenThousand2Yuan:function(ps_str, ps_digit){
		if($.trim(ps_str) == '') return '';
		var yuan = '';
		var digit = typeof ps_digit == 'undefined' ? -1 : parseInt(ps_digit);
		//yuan = ps_str * 10000;
		yuan = ps_str * 10000000000 / 1000000; //解决小数乘法bug
		if(parseInt(digit) > 0) yuan = yuan.toFixed(parseInt(digit));
		if(parseInt(digit) == 0) yuan = Math.floor(yuan);
		return yuan;
	},


	/**
	 * 将值为零的字符串转化成空值
	 * @param {*} ps_str 转化的字符串
	 * @param {*} return 若字符串为零，则返回空值；否则返回原字符串
	 * eg1.0, 0.00, 0.000, 0.0000, -0.0000 这些只包含负号、小数点、数字0，故返回值为空""
	   eg2.0.1, 0.5, 0.01, -0.01 这些字和零不相等，故返回值为原字符串
	 */
	zeroString2Empty:function(ps_str){
		if(typeof ps_str == 'undefined' || ps_str == null) return ps_str;
		var newstr = ps_str.toString().replace(/([ ]+)/g, ''); //去掉所有空格
		var flag = false;
		if (newstr != "")
		{
			for (var i = 0; i < newstr.length; i++)
			{
				var eachstr = newstr[i].toString();
				if (eachstr != "0" && eachstr != "." && eachstr != "-")
				{
					flag = true;
					break;
				}
			}
		}
		return flag ? ps_str : '';
	},

	/**
	 * 将空符串转化成数值0
	 * @param {*} ps_str 要转化的字符串
	 * @param {*} return 若字符串为空，则返回0；否则返回原字符串
	 */
	emptyString2Zero:function(ps_str){
		if(typeof ps_str == 'undefined' || ps_str == null) return ps_str; 
		var newstr = ps_str.toString().replace(/([ ]+)/g, '');
		return newstr == '' ? 0 : ps_str;
	}


} //END convert对象




/*-------------------------------------------------------*/
/*			restrict对象, 用于限制输入类型
/*-------------------------------------------------------*/
var restrict = {
	/**
	 * 只能输入：正整数
	 * eg. 10
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	onlyInterval: function(str){
		var value = str.toString().replace(/[^\d]/g,'');
		return value;
	},

	/**
	 * 只能输入：正小数
	 * eg. 10.53
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	onlyFloat: function(str){
		var value = str.toString().replace(/[^\d\.]/g,'');
		value = filter.repeatedChar(value, '.'); //只保留一个小数点
		return value;
	},

	/**
	 * 只能输入：正负整数（即正整数、负整数）
	 * 适用于：手机号码、固定电话
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	negativeInterval: function(str){
		var value = str.toString().replace(/[^\d\-]/g,'');
		value = filter.repeatedChar(value, '-'); //只保留一个负号
		value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
		return value;
	},

	/**
	 * 只能输入：正负小数（即正整数、负整数、正小数、负小数）
	 * eg. 10.53, -10.53 
	 * @param {string} str 字符串值
	 * @returns {number} 返回字符
	 */
	negativeFloat: function(str){
		var value = str.toString().replace(/[^\d\.\-]/g,'');
		value = filter.repeatedChar(value, '.'); //只保留一个小数点
		value = filter.repeatedChar(value, '-'); //只保留一个负号
		value = value.indexOf('-') > 0 ? '-' + value.replace('-', '') : value; //把负号提到最前面
		return value;
	}

} //END restrict对象





/*-------------------------------------------------------*/
/*			calendar 日历对象, 用于操作与日期相关的动作
/*-------------------------------------------------------*/
var calendar = {
	/**
	 * 判断字符串是否为日期(时间)格式(此处不考虑只有年份的日期.如"2018")
	 * @param {string} str 字符串
	 * @returns {Boolean} 返回布尔值. true 是日期格式, false 不是日期格式
	 * eg. 2018-09, 2018-09-12, 2018-09-12 14:32:51 都是日期格式, 空, null, 2018(只有年份)不是日期格式
	 */
	isDateString:function(str){
		return isNaN(str) && !isNaN(Date.parse(str)) ? true : false;
	},

	/**
	 * 两个日期相减得到天数
	 * 思路: 格式化时间也是用时间戳
	 * @param {DATE} date1 开始日期
	 * @param {DATE} date2 结束日期
	 * eg1. var a1="12-19-2018"; var a2="2019/1/7"; var b = getNumberOfDays(a1,a2)
	 */
	getNumberOfDays:function(date1, date2){//获得天数
		if(!this.isDateString(date1) || !this.isDateString(date2)) return 0;
		var a1 = Date.parse(new Date(date1));
		var a2 = Date.parse(new Date(date2));
		var day = parseInt((a2-a1)/ (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
		return day;
	},

	/**
	 * 格式化日期 / 标准化日期时间
	 * 说明: 该方法有效防止后台传数据格式发生变化. eg.10-19-2017 <==> 2017/10/19
	 * 思路：后台的时间日期 => 时间戳 =>标准的时间日期 y=年，m=月，d=天，h=时，u=分，s=秒
	 * @param {string} dateTime 日期字符串
	 * @param {string} formatStr 日期格式(可缺省).默认返回"年-月-日 时:分:秒"的格式. eg1. "yyyy-MM-dd HH:mm:ss" 返回"年-月-日 时:分:秒"eg2. "yyyy-MM-dd" 返回"年-月-日"
	 * @returns {string} 返回标准化日期字符串
	 * eg. var a="2017/12/31 23:12:54"; console.log(dateFormat(a));
	 */
	dateFormat:function(dateTime, formatStr){//格式化时间
		var formatStr = typeof formatStr == 'undefined' ? 'yyyy-MM-dd HH:mm:ss' : formatStr;
		var dateParse = Date.parse(new Date(dateTime));//转成时间戳
		var time = new Date(dateParse);//再转成标准时间
		var y = String(time.getFullYear());
		var m = String(time.getMonth()+1);
		var d = String(time.getDate());
		var h = String(time.getHours());
		var u = String(time.getMinutes());
		var s = String(time.getSeconds());
		if(formatStr == 'yyyy-MM-dd HH:mm:ss') return y + '-' + m + '-' + d + ' ' + h + ':' + u + ':' + s;
		else if(formatStr == 'yyyy-MM-dd HH:mm') return y + '-' + m + '-' + d + ' ' + h + ':' + u;
		else if(formatStr == 'yyyy-MM-dd') return y + '-' + m + '-' + d;
		else if(formatStr == 'dd/MM/yyyy') return d + '/' + m + '/' + y;
		else if(formatStr == 'MM/dd/yyyy') return m + '/' + d + '/' + y;
		else if(formatStr == 'yyyy/MM/dd') return y + '/' + m + '/' + d;
		else return {"year":y, "mon":m, "day":d, "hours":h, "minutes":u, "seconds":s}; //return m+"/"+d//直接输入自己想要的格式
	},

	/**
	 * 根据当天获取某一天
	 * @param {Number} day 天数(可缺省), 默认当天
	 * @returns {string} 返回某一天的日期. eg. 2020-05-07
	 * eg. getDay(0) 当天,  getDay(7)) 7天后, getDay(-7) 7天前
	 */
	getDay:function(day){
		function doHandleMonth(month){
		　　var m = month;
		　　if(month.toString().length == 1){
		　　　　m = "0" + month;
		　　}
		　　return m;
		}
		if(typeof day == 'undefined') day = 0;
		var today = new Date();
		var targetday_milliseconds=today.getTime() + 1000*60*60*24*day;
		today.setTime(targetday_milliseconds); //注意，这行是关键代码
		var tYear = today.getFullYear();
		var tMonth = today.getMonth();
		var tDate = today.getDate();
		tMonth = doHandleMonth(tMonth + 1);
		tDate = doHandleMonth(tDate);
		return tYear + "-" + tMonth + "-" + tDate;
	}	
}







/*=============================================================================================*/
/* 					兼容旧版 
/*为兼容以前程序故保留了部分老函数(已停更). 这些老函数或已重构,或独立开发成插件,故不再更新维护.
/*=============================================================================================*/
/**-------------------------------------------------------
* 获取URL参数(JS方法) (兼容旧版)
eg.URL为：http://www.xx.com/index.php?id=1001&image=awesome.jpg
var id = getQueryVariable("id"); //结果：1001
var image = getQueryVariable("image"); //结果：awesome.jpg
*/
function getQueryVariable(variable)
{
	/*var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		if(pair[0] == variable){return pair[1];}
	}
	return(null);*/
	return getUrlParams(variable);
}

/**-------------------------------------------------------
 * 加载日历控件/日期初始化赋值
 * @param {object} selector 要初始化的Dom节点
 * @param {boolean} ps_dayToday 日期是否默认当天（可缺省）. true 是, false 否(此时日期为空)
 */
function calendarInit(selector, ps_dayToday){
	var bools = typeof ps_dayToday == 'undefined' ? true : (ps_dayToday == false ? false : true);
	if(typeof(selector)!='undefined'){
		$(selector).each(function(){
			newCalendar.jeCalendar($(this), bools);
		})
	}
}


/*-------------------------------------------------------*/
//===newCalendar对象, 日历，时间对象
var newCalendar = {
	/**
	 * 获取当天日期.eg.2017-09-05
	 */
	getNowtime:function(){
		var mydate = new Date();
		var Y = mydate.getFullYear(),
			M = mydate.getMonth()+1,
			D = mydate.getDate(),
			h = mydate.getHours(),
			m = mydate.getMinutes(),
			s = mydate.getSeconds();
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){//小于10的月分及天数前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(M<10) M = "0"+M;
			if(D<10) D = "0"+D;
		}
		var nowtime = Y+'-'+M+'-'+D;
		return nowtime;
	},
	
	/**
	 * 获取当前年份(本年)
	 */
	getYear:function(){
		var mydate = new Date();
		var Y = mydate.getFullYear();
		return Y;
	},

	/**
	 * 获取当前月份(本月)
	 */
	getMonth:function(){
		var mydate = new Date();
		var M = mydate.getMonth()+1;
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){ //小于10的月份前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(M<10) M = "0"+M;
		}
		return M;
	},

	/**
	 * 获取当前日(本日)
	 */
	getDay:function(){
		var mydate = new Date();
		var D = mydate.getDate();
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){//小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(D<10) D = "0"+D;
		}
		return D;
	},

	/**
	 * 获取当前月份的第1天
	 */
	getMonthFirstDay:function(){
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		var day = '-01';
		if(!boolean){//小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0)
				day = "-1";
		}
		var valDay = this.getYear() + '-' + this.getMonth(boolean) + day;
		return valDay;
	},
	
	/**
	 * 获取当前月份的最后一天
	 */
	getMonthLastDay:function(){
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		var year = this.getYear();//当前年
		var month = parseInt(this.getMonth('false')); //当前月份
		var day = '30';
		if(month==1||month==3||month==5||month==7||month==8||month==10||month==12) day = '31'; //1,3,5,7,8,10,12月为大月
		//if(month==4||month==6||month==9||month==11) day = '30'; //4,6,9,11月为小月
		if(month==2){
				if(year%4==0) day = '29'; //闰年2月共有29天
				else day = '28'; //平年2月只有28天
		}
		var montLastDay = year + '-' + this.getMonth(boolean) + '-' + day;
		return montLastDay;
	},
	
	/**
	 * 获取当前季度的开始日期eg.2018-7-1
	 */
	getQuarterStartDay:function(){
		//1,2,3为第1季度; 4,5,6为第2季度; 7,8,9为第3季度; 10,11,12为第4季度
		var month = this.getMonth('false'); //当前月份
		var startMonth = month; //季度开始月份
		var day = '1';
		//..当前是1、4、7、10月
		//if(month%3==1) startMonth = month;
		//..当前是2,5,8,11月
		if((parseInt(month)+1)%3==0) startMonth = parseInt(month)-1;
		//..当前是3,6,9,12月
		if(parseInt(month)%3==0) startMonth = parseInt(month)-2;
		var boolean = (arguments[0]=='false' || arguments[0]==false)? false : true;
		if(boolean){ 
			day = '01';
			if(startMonth<10) startMonth = '0' + startMonth; //月份小于10月时补0
		}
		var startDay = this.getYear()+'-'+startMonth+'-'+day;
		return startDay;
	},
	
	/**
	 * 获取当前季度的结束日期日期
	 * eg.第1季度的最后一天为2018-03-31，第2季度的最后一天为 2018-06-30
	 */
	getQuarterEndDay:function(){
		var boolean = (arguments[0]=='false' || arguments[0]==false)? false : true;
		//1,2,3为第1季度; 4,5,6为第2季度; 7,8,9为第3季度; 10,11,12为第4季度
		//每个季度的最后一个月分别为：3月,6月,9月,12月（其中3月、12月为大月有31天，6月、9月为小月只有30天）
		var month = this.getMonth('false'); //当前月份
		var endMonth = month; //季度结束月份
		var day = '30';
		//..当前是1、4、7、10月
		if(month%3==1) endMonth = parseInt(month)+2;//3、6、9,12
		//..当前是2,5,8,11月
		if((parseInt(month)+1)%3==0) endMonth = parseInt(month)+1;//3,6,9,12
		//..当前是3,6,9,12月
		if(parseInt(month)%3==0) endMonth = parseInt(month);//3,6,9,12
		if(endMonth==3 || endMonth==12) day = '31'; //如果该季度的最扣一个月为大月（3月、12月）
		//else //如果该季度的最扣一个月为小月（6月，9月）
		if(boolean){ 
			if(endMonth<10) endMonth = '0' + endMonth; //月份小于10月时补0
		}
		var endDay = this.getYear()+'-'+endMonth+'-'+day;
		return endDay;
	},
	
	/**
	 * 获取年度第1天
	 */
	getYearFirstDay:function(){
		var boolean = (arguments[0]=='false' || arguments[0]==false)? false : true;
		var monthDay = '-01-01';
		if(!boolean) monthDay = '-1-1';
		var valDay = this.getYear() + monthDay;
		return valDay;
	},
	
	/**
	 * 获取年度最后一天
	 */
	getYearLastDay:function(){
		var valDay = this.getYear()+'-12-31';
		return valDay;
	},

	/**
	 * 获取当前日期前N天的日期(一般n小于30)
	 * @param {Number} numc 前N天
	 * @param {Boolean} 月份、天数小于10时，是否前面补零, 默认true(可缺省)
	 * eg. 昨天 numc = 2, 前天 numc = 3
	 */
	getPrevNDay:function(numc, zeroFill){ 
		var isFilled = typeof zeroFill == 'undefined' ? true : (zeroFill == false ? false : true); //默认true
		var numc = typeof(numc) == 'undefined' ? 0 : numc;
		var nowDay = this.getDay(isFilled); //当日(如7号,10号)
		var nowMonth = this.getMonth(isFilled); //当前月
		var lastMonth = parseInt(nowMonth - 1); //上一个月
		var lastMonthLastDay = this.getMonthLastDay(true, lastMonth); //上个月的最后一天(格式:年-月-日,如2018-4-30)
		var	lastDay = lastMonthLastDay.substring(lastMonthLastDay.lastIndexOf('-')+1); //上个月最后一天(格式:日,如30号)
		var nDay = 0; //前n天的日期(如前n天是13号)
		var prevNDay = '';
		if(numc!=0){
			var result = nowDay - numc + 1;
			if(result>0){ //前n天还是当前月
				nDay = parseInt(nowDay - numc + 1);
				if(isFilled){
					if(nDay < 10) nDay = '0' + nDay;
				}
				prevNDay = this.getYear() + '-' + nowMonth + '-' + nDay;
			}else{ //前n天是上个月
				nDay = parseInt(lastDay) + parseInt(result);
				if(isFilled){
					if(nDay < 10) nDay = '0' + nDay;
					if(lastMonth < 10) lastMonth = '0' + lastMonth;
				}
				prevNDay = this.getYear() + '-' + lastMonth + '-' + nDay;
			}
		}
		return prevNDay;
	},

	
	/**
	* 日历控件写成插件方便调用（需用到jquery.jedate.js)
	* @param element 要加载日期的元素id或class ; 
	* @param boolean 第2个参数可缺省，如不传或boolean=true，则元素默认日期为当天日期,如第2个参数为false,则日期为空
	* eg1. $("#panel-search .search-date").each(function(){ newCalendar.jeCalendar($(this),false);});
	* eg2. $("#panel-search .search-date").each(function(){ newCalendar.jeCalendar($(this));});
	*/
	jeCalendar:function(element){ 
		var selector = objectAttr.getClassID(element);
		var obj = typeof(selector)=='object' ? selector : $(selector);
		var boolean = (arguments[1]!=false && (arguments[1]=='' || typeof(arguments[1])=='undefined')) ? true : arguments[1];
		//alert(arguments[1]);
		if(typeof obj.jeDate == 'undefined') return;
		obj.jeDate({
			format: 'YYYY-MM-DD', //日期格式format: 'YYYY-MM-DD hh:mm:ss', //日期格式
			isinitVal:boolean, //是否填充日期为初始化日期 true 是; false 否
			initDate:[{hh:10,mm:00,ss:00},false], //初始化日期-默认日期initDate 必须配合 isinitVal 且 isinitVal 为 true，才有作用
			multiPane:true, //true单面板展示  false多面板展示
			minDate:'2015-06-16 10:20:25', //最小时间值
			maxDate:'2085-06-16 18:30:35', //最大时间值
			onClose:false //选中后是否立即关闭 false 马上关闭 true点击确定才关闭
		})
	}
	
}; //END newCalendar对象








/*-------------------------------------------------------*/
//===dropDown对象(PC-下拉控件)
var dropDown = {
	/**
	* 单个下拉
	* @param $json json对象
	* @param obj 当前点击事件的对象,一般为$(this)
	* @param 第3个参数. 第3个参数为数组形式，传递json中特殊字段名称的数组
	* @param 第4个参数，回调函数
	* 注意：默认json字段为id和value,如果不是这两个名称，则前台调用要传递第三个参数
	*e1.默认json格式(标准格式的json)为id+value或bh+mc
	- id+value的json
	 var $json= {data:[{id:'001',value:'1幢'},{id:'002',value:'2幢'},{id:'003',value:'3幢'}]};
	 dropDown.singleJson($json,$(this));
	- bh+mc的json
	var $json= {data:[{bh:'001',mc:'1幢'},{bh:'002',mc:'2幢'},{bh:'003',mc:'3幢'}]};
	dropDown.singleJson($json,$(this));
	
	*e2.特殊的json格式
	- json中有两个字段时)
	var $json= {data:[{fp_bank_bh:'001',fp_bank_mc:'1幢'},{fp_bank_bh:'002',fp_bank_mc:'2幢'},{fp_bank_bh:'003',fp_bank_mc:'3幢'}]};
	dropDown.singleJson($json,$(this),['fp_bank_bh','fp_bank_mc']);
	
	- json中只有一个字段时
	var $json= {data:[{fp_bank_mc:'1幢'},{fp_bank_mc:'2幢'},{fp_bank_mc:'3幢'}]};
	dropDown.singleJson($json,$(this),['fp_bank_mc']);
	
	*eg3.有回调函数(回调函数不带参数)
	 - 非标准json时，有回调函数要传递4个参数
		var $json= {data:[{fp_bank_bh:'001',fp_bank_mc:'1幢'},{fp_bank_bh:'002',fp_bank_mc:'2幢'},{fp_bank_bh:'003',fp_bank_mc:'3幢'}]};
		dropDown.singleJson($areaJson,$(this),['fp_bank_bh','fp_bank_mc'],locateCallBackFunc);
		function locateCallBackFunc(){alert('位置下拉回调函数');}
	- 标准json时，有回调函数只传递3个参数	
		var $json= {data:[{id:'001',value:'1幢'},{id:'002',value:'2幢'},{id:'003',value:'3幢'}]};
		dropDown.singleJson($areaJson,$(this),locateCallBackFunc);
		function locateCallBackFunc(){alert('位置下拉回调函数');}
		
	*eg4.有回调函数(回调函数带有参数)
	- 标准json时，有回调函数只传递3个参数	
		var $json= {data:[{id:'001',value:'1幢'},{id:'002',value:'2幢'},{id:'003',value:'3幢'}]};
		dropDown.singleJson($areaJson,$(this),function(){locateCallBackFunc(a,b)});
		function locateCallBackFunc(){alert('位置下拉回调函数带参数');}
	*/
	singleJson:function(json,obj){		
		var customFields = typeof(arguments[2])=='undefined' ? '' : arguments[2];
		var callBackFunc = typeof(arguments[3])=='undefined'? '' : arguments[3]; //第3个参数：回调函数
		if(typeof(arguments[2])=='function' && typeof(arguments[3])=='undefined'){ //若只传递3个参数,且第3个参数不是数组,而是函数
			callBackFunc = arguments[2];
		}
		var child = $(obj).find('.d_related');
		var bh = child.attr('data-bh'),
				mc = child.val(),
				placeholder = child.attr('placeholder'),
				txt = typeof placeholder=='undefined' || placeholder=='' ? '请选择' : placeholder;
		var	node = $(obj).find('ul');
		$(node).empty();
		var _html = '', scrollT = 0, j = 0;
		var $json = json.data;
		$json = this.jsonChange($json,customFields); //json转化成标准格式的json（id,value字段组成的json) .eg.{id:'1',value:'福建'}	
		if($json!=''){
			$.each($json,function(i,items){
				var classname = '';
				if(bh==items.id) {
					classname = ' class="on"';
					j = i;
				}
				_html+= '<li data-bh="'+items.id+'"'+classname+'>'+items.value+'</li>';
			})
		}else{
			_html+='<li>'+txt+'</li>';
		}
		if($(node).length>0) {	
			$('.d_list>ul').slideUp('fast','linear'); //所有下拉收起
			$(node).append(_html).slideDown('fast','linear'); //本身下拉
			scrollT = $(node).find('li').outerHeight() * (j-1);
			$(node).animate({scrollTop:scrollT},10); //滚动到指定位置
		}
		//选中下拉项事件
		$('.d_list').on('click','ul>li',function(e){
			e.stopPropagation(); //阻止冒泡
			var $this = $(this).parents('.d_list');
			var bh = typeof($(this).attr('data-bh'))=='undefined' ? '' : $(this).attr('data-bh');
			var text = $(this).text();
			$(this).parent().prevAll('input').val(text).attr('data-bh',bh); //edit 20180611
			$(this).parent().slideUp('fast','linear');
			//清空相关联的下拉值
			if($this[0].id.indexOf('province')>=0 || $this[0].id.indexOf('sheng')>=0) $('#city,#county,#shi,#qu').val('').attr('data-bh',''); //如果是省
			if($this[0].id.indexOf('city')>=0 || $this[0].id.indexOf('shi')>=0) $('#county,#qu').val('').attr('data-bh',''); //如果是市
			if(typeof(callBackFunc)=='function') callBackFunc(); //调用回调函数
		})
		//点击某个元素以外的地方隐藏该元素
		//$('body').bind('click',function(e){
		$(document).on('click', function(e){
			var target = $(e.target); //注:e.target.closest(selector).length==0 说明点击的不是元素selector区域,反之则是
			if($('.d_list').length>0){
				if(target.closest('.d_list').length!=0) return;
				$('.d_list>ul').slideUp('fast','linear');
			}
		})
	},


	/**获取全国所有省份数据json
	* 说明:需在对应页面引入省市县(区)数据源(chineseDistricts.js)
	* 数组iosProvinces是数据源中的省份数组
	* Date:2018.2.11
	*/
	getProvinceJson:function(){
		var $provinceJson = {data:[]};
		var $json = {};
		for(var i=0;i<iosProvinces.length;i++){
			$json = {bh:iosProvinces[i].id,mc:iosProvinces[i].value};
			$provinceJson.data.push($json);
		}
		return $provinceJson;
	},
	/**获取全国每个省份对应的地级市数据json
	* 说明:需在对应页面引入省市县(区)数据源(chineseDistricts.js)
	* 数组iosCitys是数据源中的市数组
	* @param provinceId 省份对应的编号ID
	* Date:2018.2.11
	*/
	getCityJson:function(provinceId){
		var $cityJson = {data:[]};
		var $json = {};
		if(provinceId!=''&&typeof(provinceId)!='undefined'){
			for(var i=0;i<iosCitys.length;i++){
				if(iosCitys[i].parentId==provinceId){
					$json = {bh:iosCitys[i].id,mc:iosCitys[i].value};
					$cityJson.data.push($json);
				}
			}
		}
		return $cityJson;
	},
	/**获取全国每个地级市对应的县(区)数据json
	* 说明:需在对应页面引入省市县(区)数据源(chineseDistricts.js)
	* * 数组iosCountys是数据源中的县(区)数组
	* @param cityId 市对应的编号ID
	* Date:2018.2.11
	*/
	getCountyJson:function(cityId){
		var $countyJson = {data:[]};
		var $json = {};
		if(cityId!=''&&typeof(cityId)!='undefined'){	
			for(var i=0;i<iosCountys.length;i++){
				if(iosCountys[i].parentId==cityId){
					$json = {bh:iosCountys[i].id,mc:iosCountys[i].value};
					$countyJson.data.push($json);
				}
			}		
		}
		return $countyJson;
	},
	
	/**
	 * 将不符合下拉规范的json转换成标准化的json,eg. {id:'1',value:'中国'}
	 * @param {*} $json 
	 * @param {*} arr 
	 */
	jsonChange:function($json,arr){
		var $pageJson=[],id=[],value=[];
		for(var i=0;i<$json.length;i++){
			if(typeof($json[i].bh)=='undefined') id[i] = [i];
			else id[i] = $json[i].bh;
			//if(typeof($json[i].mc)=='undefined') value[i] = '';
			if(typeof($json[i].mc)=='undefined') value[i] = $json[i].value;
			else value[i] = $json[i].mc;
			if(typeof(arr)=='object'){
				var e0 = arr[0], e1 = arr[1];
				if(typeof(e1)!='undefined'){ //arr数组有两个元素时
					id[i] = typeof($json[i][e0])=='undefined' ? [i] : $json[i][e0];
					value[i] = typeof($json[i][e1])=='undefined' ? $json[i].value : $json[i][e1];
				}else{ //arr数组只有1个元素时
					id[i] = i; // id[i] = [i]; //edit 20190108-1
					value[i] = typeof($json[i][e0])=='undefined' ? $json[i].value : $json[i][e0];
				}
			}
			$pageJson.push({id:id[i],value:value[i]});
		}	
		return $pageJson;
	}

}; //END dropDown对象



