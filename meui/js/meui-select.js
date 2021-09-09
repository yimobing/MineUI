////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*★★★★★★★★★★★★
** meuiSelect下拉插件(移动端）
* 本插件是基于iosSelect进行封装，依赖于iosSelect提供的IosSelect()方法, 故需在本插件前引入iosSelct.js
* Author: mufeng
* Update: 2018.12.1
* ★★★★★★★★★★★★
*/



/**
* selectUi对象
*/
var selectUi = {
	
	/**判断json对象中的data数组是否有数据(数组或单个数据)
	* 返回值: 有 返回 true; 无 返回 false
	* @param $json json数组
	*/
	checkJsonHasData:function($json){
		 var flag = true;
		 if(typeof($json)!='object') flag = false; //不是json对象
		 if(typeof($json)=='object' && typeof($json.data)=='undefined') flag = false; //是json对象,但不存在数组
		 if(typeof($json)=='object' && typeof($json.data)!='undefined' && $json.data.length<=0) flag = false; //是json对象，也存在数组，但数组长度为0(没数据)
		 return flag;
	},
	
	/**获取元素class值
	* 含jq调用的点
	*/
	getClassID:function(element){ 
		var selector = '';
		if(typeof(element)=='object')//==eg. element为$(this)
			//selector = typeof(element.attr('id'))=='undefined' ?  '.'+element[0].className : '#'+element.attr('id');
			selector = element;
		else 
			selector = typeof($(element).attr('id'))=='undefined' ?  '.'+$(element)[0].className.trim() : '#'+$(element).attr('id');
		return selector;
	},
	
	/**获取元素类型
	* 好决定是用val还是text进行赋值:input、select或div、span等
	*/
	getNodeType:function(element){ 
		//element的值eg1. element = '.classname' ; eg2. element = '#id';
		var selector = this.getClassID(element);
		var obj = typeof(selector)=='object' ? selector : $(selector); //结果:$(this)或 $('#ID')
		var type = obj[0].tagName.toLocaleLowerCase(); //绑定元素的类型（即标签名称):input 、 span 、div 、 select
		//注:$('#selector')[0].tagName.toLocaleLowerCase(); 用于获取元素名称，如input span div等
		return type;
	}
	
}; //END OBJECT selectUi


		

/**
* meuiSelect对象
*/
var meuiSelect = {
	/**
	* 单个下拉
	*/
	singleJson:function(options){
		var defaults = {
			//前台传递过来的参数1(主要参数)
			object:null,	//当前下拉对象,当前输入框(必须)
			jsonData:null, //json数据(必须)
			jsonFormat:null, //json格式,标准json为 {bh:'',mc:''} 或 {id:'',value:''}时本参数可缺省(默认["id","value"])，否则填写json中的参数，格式：[编号参数,值参数]
			callBack:null,  //回调函数(可缺省),默认null
			//前台传递过来的参数2(次要参数)
			container:'.menu-list', //绑定生成下拉的节点(可缺省,前台不用传递)
			showAnimate:false, //是否动画效果(可缺省),默认false
			title:null, 			//下拉标题(可缺省),默认空
			itemHeight: 35,		//每个选项高度(可缺省),默认35px
			itemShowCount:6, //下拉可视范围内的个数(可缺省),默认6个
			oneLevelId:null, //初始值,下拉默认定位在第几个选项(可缺省),默认中间那个或中间上一个

			//返回给前台的参数(兼容旧版)
			oldId:null,  //旧ID
			oldValue:null, //旧值(未选中下拉前输入框中的值)
			id:null, //新ID
			value:null, //新值
			newId:null,  //新ID
			newValue:null //新值(选择下拉后输入框中的值)
		}
		var settings = $.extend({},defaults,options);
		
		//主要参数
		var obj = settings.object,
				jsonData = settings.jsonData,
				jsonFormat = settings.jsonFormat==null ? '' : settings.jsonFormat;
				
		//次要参数
		var node = settings.container,
				animate = settings.showAnimate,
				caption = settings.title,
				height = settings.itemHeight,
				amount = settings.itemShowCount;
				
		var $json = this.jsonChange(jsonData.data,jsonFormat); //json标准化
		//console.log('标准json',$json);
		if(typeof(showCursor)=='function') showCursor(obj); //添加假光标
		if($json!=''&& typeof($json)!='undefined'){
			
			//旧ID、旧值(传给前台供调用)
			var oldId = ( obj.attr('data-bh')=='' || typeof(obj.attr('data-bh'))=='undefined' ) ? '' : obj.attr('data-bh'), //输入框旧ID
					oldValue = ( obj.val()=='' || typeof(obj.val())=='undefined' ) ?  obj.text() : obj.val(); //输入框旧值
			settings.oldId = oldId;   
			settings.oldValue = oldValue;
			
			//默认下拉选中值
			var option = Math.ceil($json.length/2)==0 ? 0 : Math.ceil($json.length/2)-1,
					oneLevelId = $json[option].id, //默认初始值为中间那个或中间的上一个
					defaultId = obj.attr('data-bh')=='' || typeof(obj.attr('data-bh'))=='undefined' ? oneLevelId : obj.attr('data-bh'); //已有值的元素一打开下拉默认精准定位到那个选项
			if(defaultId == oneLevelId){
				for(var i=0;i<$json.length;i++){
					if(oldValue==$json[i].value) defaultId = $json[i].id;
				}
			}
			var initId = settings.oneLevelId==null ?  defaultId : settings.oneLevelId;
			
			var scrollT = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop; //当前页面滚动的高度(滚动的距离)
			$('html,body').animate({scrollTop: scrollT + 1}, 'slow'); //先让页面小范围移动一点点(兼容苹果手机ios12及以上版本中滚动会穿透的问题) edit 20200618-1


			//调用iosSelect单个下拉插件
			var newSelect = new IosSelect(1, 
			 [$json],										//绑定json
			 {
					container: node, 				//绑定生成下拉的节点
					showAnimate:animate,    //是否动画效果 true 或 false
					title:caption,					//标题
					itemHeight:height,			//每个选项高度
					itemShowCount:amount,		//下拉可视范围内的个数
					oneLevelId:initId,		//初始值,下拉默认定位在哪个选项
					callback: function (selectOneObj) {
						
						//新ID、新值(传给前台供调用)
						var newId = selectOneObj.id,
								newValue = selectOneObj.value; //输入框新值
						settings.id = newId;
						settings.value = newValue;
						settings.newId = newId;
						settings.newValue = newValue; 
						
						//给输入框赋新ID、新值
						obj.attr('data-bh',newId); 
						if(selectUi.getNodeType(obj)=='input' || selectUi.getNodeType(obj) == 'textarea') obj.val(newValue); //下拉框类型：input|span|div|label等
						else obj.text(newValue);
						
						var res = {"id":newId, "value":newValue, "oldId":oldId, "oldValue":oldValue}
						if(typeof(settings.callBack)=='function') settings.callBack(res); //调用回调函数
						if(typeof(removeCursor)=='function') removeCursor(obj); //移除当前节点以外的所有假光标
						 
					}
			 })
		} //END IF
		
		
		
	},
	

	/**
	*省市区三级联动下拉
	*/
	multistageJson:function(options){ //=====省市区县三级联动下拉
		var defaults = {
			//前台传递过来的参数1(主要参数)
			object:null,	//当前下拉对象,当前输入框(必须)
			jsonData:null, //json数据(必须),可使用"省市区"数据源中的json,也可使用自定义的json
			jsonFormat:['province','city','county'], //显示值JSON格式(可缺省)
			keyFormat: ['provinceId', 'cityId', 'countyId'], //隐藏值JSON格式 (可缺省)
			callBack:null,  //回调函数(可缺省),默认null
			//前台传递过来的参数2(次要参数)
			container:'.menu-list', //绑定生成下拉的节点(可缺省,前台不用传递)
			showAnimate:false, //是否动画效果(可缺省),默认false
			title:null, 			//下拉标题(可缺省),默认空
			itemHeight: 35,		//每个选项高度(可缺省),默认35px
			itemShowCount:6, //下拉可视范围内的个数(可缺省),默认6个
			//返回给前台的参数(兼容旧版)
			oldValue:null, //旧值(未选中下拉前输入框中的值)
			value:null,
			newValue:null //新值(选择下拉后输入框中的值)
		}
		var settings = $.extend({},defaults,options);
		
		
		//主要参数
		var obj = settings.object,
				jsonData = settings.jsonData,
				jsonFormat = settings.jsonFormat,
				keyFormat = settings.keyFormat;
				
		//次要参数
		var node = settings.container,
				animate = settings.showAnimate,
				caption = settings.title,
				height = settings.itemHeight,
				amount = settings.itemShowCount;
			
		//三级联动json标准化
		var $iosProvincesJson = {}, //省份json
				$iosCitysJson = {}, //城市json
				$iosCountysJson = {}, //区县json
				iosArray = [];

		if(jsonData instanceof Array){ //jsonData为数组时
			$iosProvincesJson = jsonData[0],
			$iosCitysJson = jsonData[1],
			$iosCountysJson = jsonData[2],
			iosArray = [$iosProvincesJson,$iosCitysJson,$iosCountysJson];
		}else{ //jsonData为json时
			if(!jsonData || $.isEmptyObject(jsonData)){
				console.log('提示：三级联动下拉JSON为空');
				return false;
			}
			if(typeof jsonData.data == 'undefined'){
				console.log('提示：三级联动下拉JSON不含属性data');
				return false;
			}
			if(jsonData.data.length == 0) {
				console.log('提示：三级联动下拉JSON data为空');
				return false;
			}
			$iosProvincesJson = this.jsonConvert(jsonData, jsonFormat, keyFormat, 'province');
			$iosCitysJson = this.jsonConvert(jsonData,  jsonFormat, keyFormat, 'city');
			$iosCountysJson = this.jsonConvert(jsonData,  jsonFormat, keyFormat, 'county'),
			iosArray = [$iosProvincesJson.data,$iosCitysJson.data,$iosCountysJson.data];
		}
		//console.log('province:',$iosProvincesJson,'\ncity:',$iosCitysJson,'\ncounty:',$iosCountysJson);
			
			
		if(typeof(showCursor)=='function') showCursor(obj); //添加假光标
		
		//旧值(传给前台供调用)
		var	oldValue = ( obj.val()=='' || typeof(obj.val())=='undefined' ) ?  obj.text() : obj.val(); //输入框旧值
		settings.oldValue = oldValue;
		
			
		//默认下拉选中值
		this.provinceCityCountInit(obj,oldValue,jsonData);
		
		var oneLevelId = obj.attr('data-province'),
			twoLevelId = obj.attr('data-city'),
			threeLevelId = obj.attr('data-county');
		
		var scrollT = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop; //当前页面滚动的高度(滚动的距离)
		$('html,body').animate({scrollTop: scrollT + 1}, 'slow'); //先让页面小范围移动一点点(兼容苹果手机ios12及以上版本中滚动会穿透的问题) edit 20200618-1
	
		//三级联动选中下拉事件
		var iosSelect = new IosSelect(3,iosArray, //绑定json
			{
				container: node, 				//绑定生成下拉的节点
				showAnimate: animate,    //是否动画效果 true 或 false
				title: caption,					//标题
				itemHeight: height,			//每个选项高度
				itemShowCount: amount,		//下拉可视范围内的个数
				relation: [1, 1], //省、市、县对应关系(一下拉选中就触动，比如 选择福建省，二级市就只显示福建省对应的市)
				oneLevelId: oneLevelId, //初始值:一级(省)ID
				twoLevelId: twoLevelId, //初始值:二级(市)ID
				threeLevelId: threeLevelId, //初始值:三级(县)ID
				
				callback: function (selectOneObj, selectTwoObj, selectThreeObj){ //回调函数
					//新值(传给前台供调用)
					var newValue = selectOneObj.value + '-' + selectTwoObj.value + '-' + selectThreeObj.value; //新值
					settings.newValue = newValue; 
					settings.value = newValue;
					var shengId = selectOneObj.keyid,
						shiId = selectTwoObj.keyid,
						quId = selectThreeObj.keyid;
		
					//给输入框赋新ID、新值
					obj.attr('data-province', selectOneObj.id); //赋值一级ID
					obj.attr('data-city', selectTwoObj.id); //赋值二级ID
					obj.attr('data-county', selectThreeObj.id); //赋值三级ID
					//隐藏值（键值ID)
					obj.attr('data-provinceId', shengId);
					obj.attr('data-cityId', shiId);
					obj.attr('data-countyId', quId);

					if(selectUi.getNodeType(obj)=='input' || selectUi.getNodeType(obj) == 'textarea') obj.val(newValue); //下拉框类型：input|span|div|label等
					else obj.text(newValue);
					
					var res = {"value":newValue, "oldValue":oldValue, "provinceId":shengId, "cityId":shiId, "countyId":quId}
					if(typeof(settings.callBack)=='function') settings.callBack(res); //调用回调函数
					if(typeof(removeCursor)=='function') removeCursor(obj); //移除当前节点以外的所有假光标	
				}
		})
	},
	
	
	
	/*
	* 省市区三级联动下拉值自动定位到所点击元素的初始值
	* 比如：所点击元素元素的初始值为：福建省-泉州市-丰泽区，那么下拉一打开显示给用户的也要是：福建省-泉州市-丰泽区
	* @param element 所点击的元素
	* @param value 所点击元素初始值
	* @param json 省市区三级联动json
	*/
	provinceCityCountInit:function(element,value,json){
		var arr = value.split('-');
		var provinceName = arr[0];
		var cityName = arr[1];
		var countyName = arr[2];
		var provinceId = cityId = countyId = provinceCount = cityCount = countyCount = 0;
		if(json instanceof Array){ //json为数组时
			var _provinceArr = json[0],
					_cityArr = json[1],
					_countyArr = json[2];
			for(var i=0;i<_provinceArr.length;i++){
				if(_provinceArr[i].value==provinceName) {provinceId = _provinceArr[i].id; break;}
			}
			for(var i=0;i<_cityArr.length;i++){
				if(_cityArr[i].value==cityName) {cityId = _cityArr[i].id; break;}
			}
			for(var i=0;i<_countyArr.length;i++){
				if(_countyArr[i].value==countyName) {countyId = _countyArr[i].id; break;}
			}
			//console.log('provinceId:',provinceId,'\ncityId:',cityId,'\ncountyId:',countyId);
		}else{ //json为json时
			$.each(json.data,function(i,items1){
					provinceCount ++;
					if(items1.province==provinceName) 
							provinceId = provinceCount - 1;
					$.each(items1.data,function(j,items2){
							cityCount++;
							if(items2.city==cityName) 
									cityId = cityCount - 1;
							$.each(items2.data,function(k,items3){
									countyCount ++;
									if(items3.county==countyName) 
											countyId = countyCount - 1;
							})
					})
			});
		}
		if($(element).text()=='' && $(element).val()==''){ //无值时才赋值
				var tagName = $(element)[0].tagName.toLocaleLowerCase();
				if(tagName == 'input' || tagName == 'textarea') $(element).val(value); 
				else $(element).text(value);
		}
		$(element).attr({'data-province':provinceId,'data-city':cityId,'data-county':countyId});
	},
	
	
	/**
	* json标准化处理
	* 将不符合下拉规范的json转换成标准化的json
	* 标准json格式 eg. {id:'1',value:'中国'}
	* @param $json 要转化的json数据
	* @param arr 不标准的json格式 eg.['s_id','s_name']
	*/
	jsonChange:function($json,arr){
		var $pageJson=[],id=[],value=[];
		
		if(typeof($json)!='undefined'){ //add本行 20180627-1
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
		}
		return $pageJson;
		//console.log('json:',$json,'\npagejson:',$pageJson);
	},
	
	
	
	/**
	* 省市区三级联动json转换
	* @param $selectJson 要转化的json数据
	* @param $target 返回数据类型（值：province,city,county)
	* 返回 ： 省份、城市、或区县json 
	* $selectJson格式如下：
		var $pawnLocationJson = {data:[{province:'福建省',data:[{city:'泉州市',data:[{county:'丰泽区'},{county:'鲤城区'},{county:'洛江区'},{county:'泉港区'},{county:'惠安县'},{county:'安溪县'},{county:'永春县'},{county:'德化县'},{county:'石狮市'},{county:'晋江市'},{county:'南安市'}]},{city:'福州市',data:[{county:'鼓楼区'},{county:'台江区'},{county:'仓山区'}]}]},{province:'浙江省',data:[{city:'杭州市',data:[{county:'西湖区'},{county:'上城区'},{county:'下城区'}]},{city:'嘉兴市',data:[{county:'南湖区'},{county:'秀洲区'}]}]},{province:'山东省',data:[{city:'烟台市',data:[{county:'小烟区'},{county:'大烟区'}]},{city:'济南市',data:[{county:'小济区'},{county:'大济区'}]}]}]};
	*/
	jsonConvert:function($selectJson, jsonformat, keyformat, $target){
		var province_id = [],
				province_value = [],
				province_parentId = [],
				city_id = [],
				city_value = [],
				city_parentId = [],
				county_id = [],
				county_value = [],
				county_parentId = [],
				province = [],
				city = [],
				county = [];
				newArr = [];
		
		var n1 = 0;
		var n2 = 0;
		
		//字段
		var filed_sheng_mc = jsonformat[0],
			field_shi_mc = jsonformat[1],
			field_qu_mc = jsonformat[2];
		var field_sheng_bh = keyformat[0],
			field_shi_bh = keyformat[1],
			field_qu_bh = keyformat[2];
		
		//..省数组
		var $provinceJson = $selectJson.data;		
		for(var i=0;i<$provinceJson.length;i++){
			var shengId = typeof $provinceJson[i][field_sheng_bh] == 'undefined' ? i : $provinceJson[i][field_sheng_bh];
			province_id[i] = i;
			province_value[i] = $provinceJson[i][filed_sheng_mc];
			province_parentId[i] = 0;
			province.push({'id':province_id[i], 'keyId':shengId, 'value':province_value[i], 'parentId':province_parentId[i]});
			
			//..市数组
			var $cityJson = $selectJson.data[i].data;
			for(var j=0;j<$cityJson.length;j++){
					//alert('n1:'+n1+' i:'+i+' j:'+j);
					var shiId = typeof $cityJson[j][field_shi_bh] == 'undefined' ? n1 : $cityJson[j][field_shi_bh];
					city_id[n1] = n1;
					city_value[n1] = $cityJson[j][field_shi_mc];
					city_parentId[n1] = province_id[i];
					city.push({'id':city_id[n1], 'keyId':shiId, 'value':city_value[n1], 'parentId':city_parentId[n1]});
					
					//..县/区数组
					var $countyJson = $selectJson.data[i].data[j].data;
					for(var k=0;k<$countyJson.length;k++){
						var quId = typeof $countyJson[k][field_qu_bh] == 'undefined' ? n2 : $countyJson[k][field_qu_bh];
						county_id[n2] = n2;
						county_value[n2] = $countyJson[k][field_qu_mc];
						county_parentId[n2] = city_id[n1];	
						county.push({'id':county_id[n2], 'keyId':quId, 'value':county_value[n2], 'parentId':county_parentId[n2]});
						n2++;
					}
					n1++;
			}
		
		}
		//console.log('province:',province,'\ncity:',city,'\ncounty:',county);
		/*
			var iosProvinces = { data: province };
			var iosCitys = { data: city };
			var iosCountys = { data: county };
			console.log('province:',iosProvinces,'\ncity:',iosCitys,'\ncounty:',iosCountys);
		*/
		
		if($target=='province') $jsonlist = { data: province };
		if($target=='city') $jsonlist = { data:city };
		if($target=='county') $jsonlist = { data: county };
		return $jsonlist;
		//console.log($selectJsonlist); //输出省、市、且（区）
	},



	/*+-------------------------获取省市区县数据源-------------------------------+*/
	/**获取全国所有省份数据json
	* 前端页面需引入省市区数据源 chineseDistricts.js
	* iosProvinces为数据源中的[省份]数组
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
	* 前端页面需引入省市区数据源 chineseDistricts.js
	* iosCitys为数据源中的[城市]数组
	* @param {string} provinceId 省份ID
	*/
	getCityJson:function(provinceId){
			if(provinceId!=''&&typeof(provinceId)!='undefined'){
					var $cityJson = {data:[]};
					var $json = {};
					for(var i=0;i<iosCitys.length;i++){
							if(iosCitys[i].parentId==provinceId){
									$json = {bh:iosCitys[i].id,mc:iosCitys[i].value};
									$cityJson.data.push($json);
							}
					}
					return $cityJson;
			}
	},

	/**获取全国每个地级市对应的县(区)数据json
	* 前端页面需引入省市区数据源 chineseDistricts.js
	* iosCountys是数据源中的[区县]数组
	* @param {string} cityId 城市ID
	*/
	getCountyJson:function(cityId){
			if(cityId!=''&&typeof(cityId)!='undefined'){
					var $countyJson = {data:[]};
					var $json = {};
					for(var i=0;i<iosCountys.length;i++){
							if(iosCountys[i].parentId==cityId){
									$json = {bh:iosCountys[i].id,mc:iosCountys[i].value};
									$countyJson.data.push($json);
							}
					}
					return $countyJson;
			}
	},


	/*+--------------------------获取省份编号------------------------------+*/
	/**
	 * 获取省份编号（根据省份名称）
	 * @param {string} ps_shengName 省份名称
	 * @param {array} ps_shengArr 指定省份数据源用哪个数组（可缺省）
	 */
	getProvinceIDByProvinceName:function(ps_shengName, ps_shengArr){
		var _provinceArr = typeof ps_shengArr == 'undefined'  || ps_shengArr == null ? iosProvinces : ps_shengArr;
		var _provinceId = '';
		for(i=0;i<_provinceArr.length;i++){
			if(ps_shengName==_provinceArr[i].value){
				_provinceId = _provinceArr[i].id;
				break;
			}
		}
		return _provinceId;
	 },


	/**
	 * 获取省份编号（根据城市名称）
	 * @param {string} ps_shiName 城市名称
	 * @param {array} ps_shiArr 指定城市数据源用哪个数组（可缺省）
	 */
	 getProvinceIDByCityName:function(ps_shiName, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _provinceId = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiName==_cityArr[i].value){
				_provinceId = _cityArr[i].parentId;
				break;
			}
		}
		return _provinceId;
	 },
	 

	 /*+--------------------------获取省份名称------------------------------+*/
	 /**
	  * 获取省份名称（根据省份ID）
	  * @param {string} ps_shengId 省份ID
	  * @param {array} ps_shengArr 指定省份数据源用哪个数组（可缺省）
	  */
	 getProvinceNameByProvinceId:function(ps_shengId, ps_shengArr){
		var _provinceArr = typeof ps_shengArr == 'undefined'  || ps_shengArr == null ? iosProvinces : ps_shengArr;
		var _provinceName = '';
		for(i=0;i<_provinceArr.length;i++){
			if(ps_shengId==_provinceArr[i].id){
				_provinceName = _provinceArr[i].value;
				break;
			}
		}
		return _provinceName;
	},


	/*+---------------------------获取城市编号-----------------------------+*/
	/**
     * 获取城市编号（根据城市名称）
	 * @param {string} ps_shiName 城市名称
	 * @param {array} ps_shiArr指定城市数据源用哪个数组（可缺省）
	 */
	getCityIDByCityName:function(ps_shiName, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityId = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiName==_cityArr[i].value){
				_cityId = _cityArr[i].id;
				break;
			}
		}
		return _cityId;
	},


	 /**
	 * 获取城市编号（根据区县名称）
	 * @param {string} ps_quName 区县值
	 * @param {array} ps_quArr 指定区县数据源用哪个数组（可缺省）
	 */
	getCityIDByCountyName:function(ps_quName, ps_quArr){
		var _countyArr = typeof ps_quArr == 'undefined'  || ps_quArr == null ? iosCountys : ps_quArr;
		var _cityId = '';
		for(i=0;i<_countyArr.length;i++){
			if(ps_quName==_countyArr[i].value){
				_cityId = _countyArr[i].parentId;
				break;
			}
		}
		return _cityId;
	},


	/*+------------------------获取城市名称--------------------------------+*/
	/**
     * 获取城市名称（根据城市编号）
	 * @param {string} ps_shiId 城市编号
	 * @param {array} ps_shiArr 指定城市数据源用哪个数组（可缺省）
	 */
	getCityNameByCityId:function(ps_shiId, ps_shiArr){
		var _cityArr = typeof ps_shiArr == 'undefined'  || ps_shiArr == null ? iosCitys : ps_shiArr;
		var _cityName = '';
		for(i=0;i<_cityArr.length;i++){
			if(ps_shiId==_cityArr[i].id){
				_cityName = _cityArr[i].value;
				break;
			}
		}
		return _cityName;
	}


	
	
	
}; ////END OBJECT meuiSelect
