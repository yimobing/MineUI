/**
* ------------------------------------
* meuiPreviewImage插件
* meui图片放大预览，并且可360度旋转
* 备注：旋转特效基于Jquery.Rorate.js，本插件为二次开发的。
* 注意：!!!如果使用asp.net winform的webBrowser控件嵌入网页，则本插件代码不能有任何控制台输出调试语句console.log()（有就必须注释掉），不然asp.net中的页面无法正常放大并旋转图片。
* Author:ChenMufeng
* Update:2020.02.27
* ------------------------------------
*/
/*
 * query.Rorate.js 
 * VERSION: 2.3 LAST UPDATE: 11.07.2013
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Made by Wilq32, wilq32@gmail.com, Wroclaw, Poland, 01.2009
 * Website: http://jqueryrotate.com
 */ 

(function($) {
    var supportedCSS,supportedCSSOrigin, styles=document.getElementsByTagName("head")[0].style,toCheck="transformProperty WebkitTransform OTransform msTransform MozTransform".split(" ");
    for (var a = 0; a < toCheck.length; a++) if (styles[toCheck[a]] !== undefined) { supportedCSS = toCheck[a]; }
    if (supportedCSS) {
      supportedCSSOrigin = supportedCSS.replace(/[tT]ransform/,"TransformOrigin");
      if (supportedCSSOrigin[0] == "T") supportedCSSOrigin[0] = "t";
    }

    // Bad eval to preven google closure to remove it from code o_O
    eval('IE = "v"=="\v"');

    jQuery.fn.extend({
      
        meuiPreviewImage:function(options){
            var defaults = {
              imgSource: '', //图片地址
              degrees: 45, //每次旋转度数
              direction: 'wise', //点击图片时旋转方向. wise 顺时针(默认), anti 逆时针
              showCloseButton:true //是否显示关闭按钮,默认true
            }
            var settings = $.extend(true, {}, defaults, options || {});
            if(settings.imgSource == '' || typeof settings.imgSource == 'undefined') return;
						var _direcStr = settings.direction == 'anti' ? '逆时针' : '顺时针';
            var _degreStr = settings.degrees + '度';
            var isCloseBtn = typeof settings.showCloseButton == 'undefined' ? true : (settings.showCloseButton === false ? false : true);
            var _isCloseStr = !isCloseBtn ? '' : '<i class="pic-close"></i>';
            
            var outerNode = '.meui-preview-image';
            var outerClass = outerNode.replace(/[\.\#]/g,'');
            var _allHtml = [
              '<div class="' + outerClass + '" style="display:none">',
                '<div class="preview-area">',
                  '<div class="pv-picture">',
                    '<img id="pic-img" src="">',
                    _isCloseStr,
                  '</div>',
                 '</div><!--/.preview-area-->',
                 '<div class="preview-mask"></div>',
                 '<div class="preview-rotate">',
                  '<div class="rotate-infos">图片旋转</div>',
                  '<div class="rotate-tips" style="display:none"><!--ie9以下浏览器时-->',
                    '<p>点图片，' + _direcStr + '旋转' + _degreStr + '。</p>',
                    '<p>点图片以外区域，关闭图片。</p>',
                  '</div>',
                  '<div class="rotate-buttons"><!--ie9以ie9以上浏览器-->',
                    '<p class="rot-btn rot-btn-normal"><i></i><span>复位</span></p>',
                    '<p class="rot-btn rot-btn-wise"><i></i><span>顺时针</span></p>',
                    '<p class="rot-btn rot-btn-anti"><i></i><span>逆时针</span></p>',
                    '<p class="rot-btn rot-btn-close"><i></i><span>关闭</span></p>',
                  '</div>',
                 '</div><!--/.review-rotate-->',
                '</div><!--/.meui-preview-image-->'
            ].join('\r\n');
            if($(outerNode).length == 0) $('body').append(_allHtml);
            //节点
            var $rotate = $('.preview-rotate'); //旋转
            var $mask = $('.preview-mask');//遮罩
            var $area = $('.preview-area'); //预览
            var $picture = $('.pv-picture');//大图
            var $img = $('#pic-img');//图片
            var imgUrl = settings.imgSource; //大图URL
            //显示大图
            $img.attr('src', imgUrl);
            $(outerNode).fadeIn('fast');
            
            //图片原始尺寸
            var image = new Image();
            image.src = imgUrl;
            if(navigator.appName == "Microsoft Internet Explorer" && parseInt(navigator.appVersion.split(";")[1].replace(/[ ]/g, "").replace("MSIE","")) < 9){ //IE8,IE7,IE6
               //console.log("当前浏览器为IE9以下版本"); 
               $('.rotate-tips').show().next().hide();
            }
            if(navigator.appName == "Microsoft Internet Explorer"){ //IE
               donSeriralEvents();
            }else{ //非IE
                image.onload = function(){ //为防止图片出现宽高为0的情，需要在 image.src之后用 image.onload来执行以后的代码。但是IE8及以下浏览器又不支持image.onload事件
                  donSeriralEvents();
                }
            }
            var userAgent = navigator.userAgent.toLowerCase(); //获取浏览器标识
            if(userAgent.indexOf('firefox') >= 0) { //火狐浏览器时
              image.src = imgUrl;  //image.src放到image.onload后面
            }
            
            //=====执行系列事件
            function donSeriralEvents(){
              var imgW = image.width, imgH = image.height;
              //图片打开方式与位置
              var winW = $(window).outerWidth(), winH = $(window).outerHeight();
              var leftW = (winW - imgW) / 2, topH = (winH - imgH) /3; 
              if(leftW<0) leftW = 35;
              if(topH<0) topH = 35;
              topH  = topH < 0 ? 35 : topH;
              //console.log('imgSrc:',imgSrc, '\nwinW:',winW, '\nimgW:',imgW, '\nimgH:',imgH, '\nwinH:',winH, '\ntopH:',topH);
              $picture.css({'left':leftW,'right':leftW,'top':topH/*,'bottom':topH*/});
              $('html,body').css({'height':'100%','overflow':'hidden'});
    
              //=====点击放大图片区域防止冒泡
              $img.on('click',function(e){
                e.stopPropagation();
              }); 
              
              /*+----------------+*/
              //=====点击打叉图标,关闭大图
              //$(document).on('click',function(){
              $('.pic-close').on('click',function(){
                closeImageBlock();
              })

              //======点击其它区域,关闭大图
              $(document).on('click', function(e) {
                if ($(e.target).closest('#pic-img').length != 0) return; //e.target.closest(selector).length==0 说明点击的不是元素selector区域,反之则是
                closeImageBlock();
              })

              function closeImageBlock(){
                /*$(outerNode).fadeOut('fast',function(){
                  $(this).remove();
                })*/
                $(outerNode).hide();
                $(this).remove();
                $img.attr('src','');
                $picture.removeAttr('style');
                $('html,body').removeAttr('style');
              }
    
              /*+------- 图片旋转---------+*/
              var angles = 0; 
              var degrees = settings.degrees; //每次旋转的度数
              var wiseCount = 0; //顺时针旋转次数统计
              var antiCount = 0; //逆时针旋转次数统计
              //顺时针旋转参数
              var wiseClockJson = {
                bind:{
                  click: function(e){
                    e.stopPropagation();
                    angles +=degrees;
                    //为兼容IE8及以下浏览器,这里不能使用$img, 而要用 $('图片节点ID'), 不能无法转动图片
                    $('#pic-img').rotate({ animateTo:angles}); 
                    //$img.rotate({ animateTo:angles});
                    //$(this).rotate({ animateTo:angles});
                    wiseCount++;
                  }
                }
              }
              //逆时针旋转参数
              var antiClockJson = {
                bind:{
                  click: function(e){
                    e.stopPropagation();
                    angles +=-degrees;
                    //为兼容IE8及以下浏览器,这里不能使用$img, 而要用 $('图片节点ID'), 不能无法转动图片
                    $('#pic-img').rotate({ animateTo:angles}); 
                    //$img.rotate({ animateTo:angles});
                    antiCount++;
                  }
                }
              }
              $('.rot-btn-wise').rotate(wiseClockJson);
              $(".rot-btn-anti").rotate(antiClockJson);
              if(settings.direction == 'anti') $img.rotate(antiClockJson);
              else $img.rotate(wiseClockJson);
              
              //=====停止旋转/旋转复位
              $(".rot-btn-normal").rotate({
                bind:{
                  click: function(e){
                    e.stopPropagation();
                    /*
                    var wiseDegree = wiseCount * degrees; //顺时针旋转总度数
                    var antiDegree = antiCount * degrees; //逆时针旋转总度数
                    var allDegree = wiseDegree - antiDegree; //总旋转度数
                    var remainDegree = allDegree%360; //取余数
                    var returnDegree =  parseInt(remainDegree) < 0 ? remainDegree : (360 - remainDegree);
                    alert('顺时针总度数：'+wiseDegree, '\n逆时针总度数：'+antiDegree, '\n总旋转度数：'+allDegree, '\n余数：'+remainDegree, '\n多少度复位：'+returnDegree);
                    $img.rotate({ animateTo:returnDegree})
                    */
                    $img.rotate({ animateTo:360})
                  }
                }
              })
              
            } //END FUNCTION preventEvent
        }, //END FUNCTION meuiRotate
        
        
        rotate:function(parameters){
          if (this.length===0||typeof parameters=="undefined") return;
          if (typeof parameters=="number") parameters={angle:parameters};
          var returned=[];
          for (var i=0,i0=this.length;i<i0;i++)
          {
            var element=this.get(i);
            if (!element.Wilq32 || !element.Wilq32.PhotoEffect) {

              var paramClone = $.extend(true, {}, parameters);
              var newRotObject = new Wilq32.PhotoEffect(element,paramClone)._rootObj;

              returned.push($(newRotObject));
            }
            else {
              element.Wilq32.PhotoEffect._handleRotation(parameters);
            }
          }
          return returned;
        },
        getRotateAngle: function(){
          var ret = [0];
          for (var i=0,i0=this.length;i<i0;i++)
          {
            var element=this.get(i);
            if (element.Wilq32 && element.Wilq32.PhotoEffect) {
              ret[i] = element.Wilq32.PhotoEffect._angle;
            }
          }
          return ret;
        },
        stopRotate: function(){
          for (var i=0,i0=this.length;i<i0;i++)
          {
            var element=this.get(i);
            if (element.Wilq32 && element.Wilq32.PhotoEffect) {
              clearTimeout(element.Wilq32.PhotoEffect._timer);
            }
          }
        }
    });

    // Library agnostic interface

    Wilq32=window.Wilq32||{};
    Wilq32.PhotoEffect=(function(){

      if (supportedCSS) {
        return function(img,parameters){
          img.Wilq32 = {
            PhotoEffect: this
          };

          this._img = this._rootObj = this._eventObj = img;
          this._handleRotation(parameters);
        }
      } else {
        return function(img,parameters) {
          this._parent = img.parentNode; //add by chr 20190507-3
          this._img = img;
          this._onLoadDelegate = [parameters];
          this._rootObj=document.createElement('span');
          this._rootObj.style.display="inline-block";
          this._rootObj.Wilq32 =
            {
              PhotoEffect: this
            };
          img.parentNode.insertBefore(this._rootObj,img);

          if (img.complete) {
            this._Loader();
          } else {
            var self=this;
            // TODO: Remove jQuery dependency
            jQuery(this._img).bind("load", function(){ self._Loader(); });
          }
        }
      }
    })();

    Wilq32.PhotoEffect.prototype = {
      _setupParameters : function (parameters){
        this._parameters = this._parameters || {};
        if (typeof this._angle !== "number") { this._angle = 0 ; }
        if (typeof parameters.angle==="number") { this._angle = parameters.angle; }
        this._parameters.animateTo = (typeof parameters.animateTo === "number") ? (parameters.animateTo) : (this._angle);

        this._parameters.step = parameters.step || this._parameters.step || null;
        this._parameters.easing = parameters.easing || this._parameters.easing || this._defaultEasing;
        this._parameters.duration = 'duration' in parameters ? parameters.duration : parameters.duration || this._parameters.duration || 1000;
        this._parameters.callback = parameters.callback || this._parameters.callback || this._emptyFunction;
        this._parameters.center = parameters.center || this._parameters.center || ["50%","50%"];
        if (typeof this._parameters.center[0] == "string") {
          this._rotationCenterX = (parseInt(this._parameters.center[0],10) / 100) * this._imgWidth * this._aspectW;
        } else {
          this._rotationCenterX = this._parameters.center[0];
        }
        if (typeof this._parameters.center[1] == "string") {
          this._rotationCenterY = (parseInt(this._parameters.center[1],10) / 100) * this._imgHeight * this._aspectH;
        } else {
          this._rotationCenterY = this._parameters.center[1];
        }

        if (parameters.bind && parameters.bind != this._parameters.bind) { this._BindEvents(parameters.bind); }
      },
      _emptyFunction: function(){},
      _defaultEasing: function (x, t, b, c, d) { return -c * ((t=t/d-1)*t*t*t - 1) + b },
      _handleRotation : function(parameters, dontcheck){
        if (!supportedCSS && !this._img.complete && !dontcheck) {
          this._onLoadDelegate.push(parameters);
          return;
        }
        this._setupParameters(parameters);
        if (this._angle==this._parameters.animateTo) {
          this._rotate(this._angle);
        }
        else {
          this._animateStart();
        }
      },

      _BindEvents:function(events){
        if (events && this._eventObj)
        {
          // Unbinding previous Events
          if (this._parameters.bind){
            var oldEvents = this._parameters.bind;
            for (var a in oldEvents) if (oldEvents.hasOwnProperty(a))
              // TODO: Remove jQuery dependency
              jQuery(this._eventObj).unbind(a,oldEvents[a]);
          }

        this._parameters.bind = events;
        for (var a in events) if (events.hasOwnProperty(a))
          // TODO: Remove jQuery dependency
          jQuery(this._eventObj).bind(a,events[a]);
        }
      },

      _Loader:(function()
      {
        if (IE) //ie浏览器时
          return function() {
            //edit by chr 20190507-2
            //原
            //var width=this._img.width;
            //var height=this._img.height;
            //改后下5行
            var img = new Image();
                img.src = this._img.src;
            var width = img.width;
            var height = img.height;
            //alert('width:'+width);
          
            this._imgWidth = width;
            this._imgHeight = height;
            //alert(this._img.previousSibling.tagName);
            //alert('src——：'+this._img.src+'\n'+this._img.tagName);
            if(this._img.parentNode!=null) this._img.parentNode.removeChild(this._img); //edit 20190507-3
            
            //删除第1个group节点,防止第N次打开前之前的图片依然会出现 add by chr 20190507-3 
            var groupNode = document.getElementsByTagName('group');
            if(groupNode.length>0){
              this._rootObj.removeChild(this._rootObj.childNodes[0]);
            }
            
            this._vimage = this.createVMLNode('image');
            this._vimage.src = this._img.src;
            this._vimage.style.height=height+"px";
            this._vimage.style.width=width+"px";
            this._vimage.style.position="absolute"; // FIXES IE PROBLEM - its only rendered if its on absolute position!
            this._vimage.style.top = "0px";
            this._vimage.style.left = "0px";
            this._aspectW = this._aspectH = 1;
    
            /* Group minifying a small 1px precision problem when rotating object */
            this._container = this.createVMLNode('group');
            this._container.style.width=width;
            this._container.style.height=height;
            this._container.style.position="absolute";
            this._container.style.top="0px";
            this._container.style.left="0px";
            this._container.setAttribute('coordsize',width-1+','+(height-1)); // This -1, -1 trying to fix ugly problem with small displacement on IE
            this._container.appendChild(this._vimage);

            this._rootObj.appendChild(this._container);
            this._rootObj.style.position="relative"; // FIXES IE PROBLEM
            this._rootObj.style.width=width+"px";
            this._rootObj.style.height=height+"px";
            this._rootObj.setAttribute('id',this._img.getAttribute('id'));
            this._rootObj.className=this._img.className;
            this._eventObj = this._rootObj;
            var parameters;
            while (parameters = this._onLoadDelegate.shift()) {
              this._handleRotation(parameters, true);
            }
          }
          else return function () {
            this._rootObj.setAttribute('id',this._img.getAttribute('id'));
            this._rootObj.className=this._img.className;

            this._imgWidth=this._img.naturalWidth;
            this._imgHeight=this._img.naturalHeight;
            var _widthMax=Math.sqrt((this._imgHeight)*(this._imgHeight) + (this._imgWidth) * (this._imgWidth));
            this._width = _widthMax * 3;
            this._height = _widthMax * 3;

            this._aspectW = this._img.offsetWidth/this._img.naturalWidth;
            this._aspectH = this._img.offsetHeight/this._img.naturalHeight;

            this._img.parentNode.removeChild(this._img);


            this._canvas=document.createElement('canvas');
            this._canvas.setAttribute('width',this._width);
            this._canvas.style.position="relative";
            this._canvas.style.left = -this._img.height * this._aspectW + "px";
            this._canvas.style.top = -this._img.width * this._aspectH + "px";
            this._canvas.Wilq32 = this._rootObj.Wilq32;

            this._rootObj.appendChild(this._canvas);
            this._rootObj.style.width=this._img.width*this._aspectW+"px";
            this._rootObj.style.height=this._img.height*this._aspectH+"px";
            this._eventObj = this._canvas;

            this._cnv=this._canvas.getContext('2d');
            var parameters;
            while (parameters = this._onLoadDelegate.shift()) {
              this._handleRotation(parameters, true);
            }
          }
      })(),

      _animateStart:function()
      {
        if (this._timer) {
          clearTimeout(this._timer);
        }
        this._animateStartTime = +new Date;
        this._animateStartAngle = this._angle;
        this._animate();
      },
      _animate:function()
      {
        var actualTime = +new Date;
        var checkEnd = actualTime - this._animateStartTime > this._parameters.duration;

        // TODO: Bug for animatedGif for static rotation ? (to test)
        if (checkEnd && !this._parameters.animatedGif)
        {
          clearTimeout(this._timer);
        }
        else
        {
          if (this._canvas||this._vimage||this._img) {
            var angle = this._parameters.easing(0, actualTime - this._animateStartTime, this._animateStartAngle, this._parameters.animateTo - this._animateStartAngle, this._parameters.duration);
            this._rotate((~~(angle*10))/10);
          }
          if (this._parameters.step) {
            this._parameters.step(this._angle);
          }
          var self = this;
          this._timer = setTimeout(function()
          {
            self._animate.call(self);
          }, 10);
        }

      // To fix Bug that prevents using recursive function in callback I moved this function to back
      if (this._parameters.callback && checkEnd){
        this._angle = this._parameters.animateTo;
        this._rotate(this._angle);
        this._parameters.callback.call(this._rootObj);
      }
      },

      _rotate : (function()
      {
        var rad = Math.PI/180;
        if (IE)
          return function(angle)
        {
          this._angle = angle;
          this._container.style.rotation=(angle%360)+"deg";
          this._vimage.style.top = -(this._rotationCenterY - this._imgHeight/2) + "px";
          this._vimage.style.left = -(this._rotationCenterX - this._imgWidth/2) + "px";
          this._container.style.top = this._rotationCenterY - this._imgHeight/2 + "px";
          this._container.style.left = this._rotationCenterX - this._imgWidth/2 + "px";

        }
          else if (supportedCSS)
          return function(angle){
            this._angle = angle;
            this._img.style[supportedCSS]="rotate("+(angle%360)+"deg)";
            this._img.style[supportedCSSOrigin]=this._parameters.center.join(" ");
          }
          else
            return function(angle)
          {
            this._angle = angle;
            angle=(angle%360)* rad;
            // clear canvas
            this._canvas.width = this._width;//+this._widthAdd;
            this._canvas.height = this._height;//+this._heightAdd;

            // REMEMBER: all drawings are read from backwards.. so first function is translate, then rotate, then translate, translate..
            this._cnv.translate(this._imgWidth*this._aspectW,this._imgHeight*this._aspectH);  // at least center image on screen
            this._cnv.translate(this._rotationCenterX,this._rotationCenterY);     // we move image back to its orginal
            this._cnv.rotate(angle);                    // rotate image
            this._cnv.translate(-this._rotationCenterX,-this._rotationCenterY);   // move image to its center, so we can rotate around its center
            this._cnv.scale(this._aspectW,this._aspectH); // SCALE - if needed ;)
            this._cnv.drawImage(this._img, 0, 0);             // First - we draw image
          }

      })()
      }

      if (IE)
      {
        
        Wilq32.PhotoEffect.prototype.createVMLNode=(function(){
          document.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
          try {
            !document.namespaces.rvml && document.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
            return function (tagName) {
              return document.createElement('<rvml:' + tagName + ' class="rvml">');
            };
          } catch (e) {
            return function (tagName) {
              return document.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
            };
          }
        })();
      }

})(jQuery);
