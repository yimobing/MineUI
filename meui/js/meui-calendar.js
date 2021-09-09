////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*★★★★★★★★★★★★
** meuiCalendar日历插件
* 本插件是基于jedate日历插件进行封装，故需在本插件前引入jedate.js
* Author: mufeng
* Update: 2019.10.29
* ★★★★★★★★★★★★
*/


/**
* calendarUi对象用于获取元素属性
*/
var calendarUi = {
	getClassID:function(element){ //======获取元素class值,含jq调用的点
		var selector = '';
		if(typeof(element)=='object')//==eg. element为$(this)
			//selector = typeof(element.attr('id'))=='undefined' ?  '.'+element[0].className : '#'+element.attr('id');
			selector = element;
		else 
			selector = typeof($(element).attr('id'))=='undefined' ?  '.'+$(element)[0].className.trim() : '#'+$(element).attr('id');
		return selector;
	},
	getNodeType:function(element){//======获取元素类型好决定是用val还是text进行赋值:input、select或div、span等标签
		//element的值eg1. element = '.classname' ; eg2. element = '#id';
		var selector = this.getClassID(element);
		var obj = typeof(selector)=='object' ? selector : $(selector); //结果:$(this)或 $('#ID')
		var type = obj[0].tagName.toLocaleLowerCase(); //绑定元素的类型（即标签名称):input 、 span 、div 、 select
		//注:$('#selector')[0].tagName.toLocaleLowerCase(); 用于获取元素名称，如input span div等
		return type;
	}
}; //END OBJECT calendarUi


/**
* meuiCalendar对象用于生成日历插件
	eg.
	$('#startDate').val(meuiCalendar.getNowtime()); //当天
	$('#startDate').val(meuiCalendar.getMonthFirstDay()); //当月第1天
	$('#startDate').val(meuiCalendar.getMonthLastDay()); //当月最后一天
	$('#startDate').val(meuiCalendar.getYear()+'-'+meuiCalendar.getMonth()+'-05'); //当月5号
	$('#startDate').val(meuiCalendar.getQuarterStartDay()); //本季度开始日期第1天
	$('#startDate').val(meuiCalendar.getQuarterEndDay()); //本季度结束日期最后1天
	$('#startDate').val(meuiCalendar.getYearFirstDay()); //本年第1天
	$('#startDate').val(meuiCalendar.getYearLastDay()); //本年最后1天
*/
var meuiCalendar = {
		/*
		*jeDate日历控件写成插件方便调用（需用到jquery.jedate.js)
		日期控件调用方法
		*	方法1：meuiCalendar.jeCalendar(obj,json,callBack); 
		* 方法2（兼容旧版）：meuiCalendar.jeCalendar(obj,false); 
		*	@param obj 当前所在标签对象或#ID或.className(必须).eg. $('#date') 或 '#date' 或 '.date'
		*	@param json json对象(可缺省)，格式：{"empty":false,"theme":"green","format":"YYYY-MM-DD hh:mm:ss"} 
			empty 标签默认日期是否为空(可缺省),true|空,false|不空(默认当天日期); 
			theme 日历控件主题(可缺省), green|绿色,blue|蓝色，默认green 
			format 日期格式(可缺省), 一般有几个值:"YYYY-MM-DD"、 "YYYY-MM-DD hh:mm:ss"、 "YYYY-MM-DD hh:mm"，默认 "YYYY-MM-DD"(eg.2018-07-25)
			minDate 最小日期(可缺省)
			maxDate 最大日期(可缺省)
			其中 YYYY 年, MM 月, DD 天, hh 小时(24小时制), mm 分, ss 秒
		* @param callBack 回调函数(可缺省)
		
		eg. 含有class="jedate"的标签都调用日历控件（注意：input标签不能有value属性，如：<input type="text" value="2018-07-25">，不然会报错）
		$(selector).each(function(){
			//meuiCalendar.jeCalendar($(this)); //默认日期为当天，如：2018-07-25
			//meuiCalendar.jeCalendar($(this),false); //默认日期为空
			//meuiCalendar.jeCalendar($(this),{"empty":true,"theme":"blue"}); //默认日期为当天，主题为蓝色
			meuiCalendar.jeCalendar($(this),{},callBack); //默认日期当天，主题为默认主题，且选择完日期后有回调函数
			meuiCalendar.jeCalendar($(this),{"empty":false,"theme":"blue"},callBack); //默认日期为空，主题为蓝色，且选择完日期后有回调函数
			function callBack(e){
				//console.log('返回日期值：',e.value);
				alert('我是日历回调函数');
			}
		})
	*/	
	jeCalendar:function(element,params,callBack){ 
			var selector = calendarUi.getClassID(element);
			var obj = typeof(selector)=='object' ? selector : $(selector);
			var boolean = true,
					theme = 'green';
			var format = 'YYYY-MM-DD', //默认日期格式
					minDate = '1900-01-01 00:00:00', //日期最小值,时分秒能选择的最小值必须是00:00:00 //edit 20181027-1
					maxDate = '3000-12-31 23:59:59'; //日期最大值,时分秒能选择的最大值必须是23:59:59 //edit 20181027-1
 			
			var hhmmss = this.getHHMMSS(),
					hours = this.getHours(),
					minutes = this.getMinutes(),
					seconds = this.getSeconds();
					
			if(typeof(params)!='undefined'){
				if(typeof(params.empty)!='undefined'){
					if(params.empty) boolean = false;
				}	
				if(!params) boolean = false;
				if(typeof(params.theme)!='undefined'){
					theme = params.theme=='green' ? '' : params.theme
				}	
				if(typeof(params.format)!='undefined') format = params.format;
				if(typeof(params.minDate)!='undefined') minDate = params.minDate;
				if(typeof(params.maxDate)!='undefined') maxDate = params.maxDate;
			}
		
			//if(typeof(showCursor)=='function') showCursor(obj); //添加假光标
			if(typeof obj.jeDate == 'undefined') return;
			obj.jeDate({
			 theme:theme,
			 format: format, //日期格式format: 'YYYY-MM-DD hh:mm:ss', //日期格式
			 isinitVal:boolean, //是否填充日期为初始化日期 true 是; false 否
			 //initDate:[{hh:10,mm:00,ss:00},false], //初始化日期-默认日期initDate 必须配合 isinitVal 且 isinitVal 为 true，才有作用
			 initDate:[{hh:hours,mm:minutes,ss:seconds},false], 
			 multiPane:true, //true单面板展示  false多面板展示
			 minDate:minDate, //最小时间值
			 maxDate:maxDate, //最大时间值
			 onClose:false, //选中后是否立即关闭 false 马上关闭 true点击确定才关闭
			 okfun:function(obj){ //回调函数
			 	//console.log(obj.elem); //当前输入框id
				//console.log(obj.val); //日期生成的值，如2018-04-06
				//if(typeof(removeCursor)=='function') removeCursor(obj); //移除当前节点以外的所有假光标
				if(typeof(callBack)=='function') callBack({"value":obj.val}); //add 20180929-1 20191029
	
			 }
		});
	},
	
	/**
	* 生成当前日期
	* @params 日期格式（可缺省）
	* params 是json字符串（可为空），格式如：{"format":"YYYY-MM-DD hh:mm","zero":true} 
	*	params可为空，返回时间格式：2018-07-25;
	* "format"参数值有两种： 'YYYY-MM-DD hh:mm' | 'YYYY-MM-DD hh:mm:ss' 分别对应返回  2018-07-25 24:00 | 2018-07-25 23:29:12 时间方式
	* "zero" 月、天、小时、分、秒小于0时前面是否补0，默认true(补0), false 不补0
	* eg1. meuiCalendar.getNowtime(); //2018-07-25
	* eg2. meuiCalendar.getNowtime({"format":"YYYY-MM-DD hh:mm"}); //2018-07-25 14:25
	* eg3. meuiCalendar.getNowtime({"format":"YYYY-MM-DD hh:mm:ss"}); //2018-07-25 14:25:31
	*/
	getNowtime:function(params){ 
		var mydate = new Date();
		var Y = mydate.getFullYear(),
				M = mydate.getMonth()+1,
				D = mydate.getDate(),
				h = mydate.getHours(),
				m = mydate.getMinutes(),
				s = mydate.getSeconds();
				
		var boolean = true;
		var suffix = '';
		if(typeof(params)!='undefined'){
			if(typeof(params.zero)!='undefined'){
				boolean = params.zero=='false' || params.zero==false ? false : true;
			}
		}
		if(boolean){//小于10的月分及天数前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(M<10) M = "0"+M;
			if(D<10) D = "0"+D;
			if(h<10) h = '0'+h;
			if(m<10) m = '0'+m;
			if(s<10) s= '0'+s;
		}
	
		if(typeof(params)!='undefined'){
			if(typeof(params.format)!='undefined'){
				if(params.format=='YYYY-MM-DD hh:mm') suffix = ' '+h+':'+m;
				if(params.format=='YYYY-MM-DD hh:mm:ss') suffix = ' '+h+':'+m+':'+s;
			}
		}

		var nowtime = Y+'-'+M+'-'+D+suffix;
		return nowtime;
	},

	getYear:function(){ //===生成当前年份(本年)
		var mydate = new Date();
		var Y = mydate.getFullYear();
		return Y;
	},

	getMonth:function(){ //===生成当前月份(本月)
		var mydate = new Date();
		var M = typeof(arguments[1])=='undefined' ? mydate.getMonth()+1 : arguments[1]; //当前月份或第2个参数(传递过来的月份) edit 20180421-1
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){ //小于10的月份前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(M<10) M = "0"+M;
		}
		return M;
	},

	getDay:function(){ //===生成当前日(本日)
		var mydate = new Date();
		var D = mydate.getDate();
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){//小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0)
			if(D<10) D = "0"+D;
		}
		return D;
	},
	
	getHours:function(){ //生成当前小时(24小时制)
		var date = new Date(),
				hours = date.getHours();
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){ //小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0
			if(hours<10) hours = '0'+hours;
		}
		return hours;
	},
	
	getMinutes:function(){ //生成当前分钟
		var date = new Date(),
				minutes = date.getMinutes();
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){ //小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0
			if(minutes<10) minutes = '0'+minutes;
		}
		return minutes;
	},
	
	getSeconds:function(){ //生成当前秒数
		var date = new Date(),
				seconds = date.getSeconds();
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		if(boolean){ //小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0
			if(seconds<10) seconds = '0'+seconds;
		}
		return seconds;
	},
	
	getHHMM:function(){ //生成当前 小时:分
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		//小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0
		var hhmmss = this.getHours(boolean)+':'+this.getMinutes(boolean);
		return hhmmss;
	},
	
	getHHMMSS:function(){ //生成当前 小时:分:秒
		var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
		//小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0
		var hhmmss = this.getHours(boolean)+':'+this.getMinutes(boolean)+':'+this.getSeconds(boolean);
		return hhmmss;
	}, 


	getMonthFirstDay:function(){ //===获取当前月份的第1天
			var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
			var day = '-01';
			if(!boolean){//小于10的天数前面是否补0(默认补0，如果函数传递参数false则不补0)
					day = "-1";
			}
			var valDay = this.getYear() + '-' + this.getMonth(boolean) + day;
			return valDay;
	},
	
	getMonthLastDay:function(){ //===获取当前月份的最后一天 eg.getMonthLastDay(false);//获取当前月分的最后一天. eg2.getMonthLastDay(false,10);//获取10月的最后一天
			var boolean = (arguments[0]=='false' || arguments[0]==false) ? false : true;
			var year = this.getYear();//当前年
			//var month = parseInt(this.getMonth('false')); //当前月份
			
			var month = typeof(arguments[1])=='undefined' ? parseInt(this.getMonth('false')) : arguments[1]; //当前月份 或 传递过来的第2个参数作为月份 edit 20180421-1
			
			var day = '30';
			if(month==1||month==3||month==5||month==7||month==8||month==10||month==12) day = '31'; //1,3,5,7,8,10,12月为大月
			//if(month==4||month==6||month==9||month==11) day = '30'; //4,6,9,11月为小月
			if(month==2){
					if(year%4==0) day = '29'; //闰年2月共有29天
					else day = '28'; //平年2月只有28天
			}
			//var montLastDay = year + '-' + this.getMonth(boolean) + '-' + day;
			var montLastDay = year + '-' + this.getMonth(boolean,month) + '-' + day; //edit 20180421-1
			return montLastDay;
	},
	
	
	getQuarterStartDay:function(){ //===获取当前季度的开始日期eg.2018-7-1

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
	
	getQuarterEndDay:function(){ //===获取当前季度的结束日期日期eg.第1季度的最后一天为2018-03-31，第2季度的最后一天为 2018-06-30
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
	
	getYearFirstDay:function(){ //===获取年度第1天
			var boolean = (arguments[0]=='false' || arguments[0]==false)? false : true;
			var monthDay = '-01-01';
			if(!boolean) monthDay = '-1-1';
			var valDay = this.getYear() + monthDay;
			return valDay;
	},
	
	getYearLastDay:function(){ //=====获取年度最后一天
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
	}
	
}; //END OBJECT meuiCalendar
