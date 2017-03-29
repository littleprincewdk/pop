/**
 * Created by wudengke on 2017/3/12.
 */
$(function(){
    var $Window=$(window),
        windowWidth=$Window.width(),
        windowHeight=$Window.height(),
        $Body=$("body"),
        $BackDrop=null,
        MZX_Z_INDEX=9999,
        MAX_Z_INDEX=100;
    //加载动画
    var loading={
        rotatingPlane:{
            num:0
        },
        doubleBounce:{
            num:2,
            commonClass:"child",
            privateClass:"double-bounce"
        },
        wave:{
            num:5,
            commonClass:"rect",
            privateClass:"rect"
        },
        wanderingCubes:{
            num:2,
            commonClass:"cube",
            privateClass:"cube"
        },
        spinner:{
            num:0,
            extraClass:"spinner-pulse"
        },
        chasingDots:{
            num:2,
            commonClass:"child",
            privateClass:"dot"
        },
        threeBounce:{
            num:2,
            commonClass:"child",
            privateClass:"bounce"
        },
        circle:{
            num:12,
            commonClass:"child",
            privateClass:"circle"
        },
        cubeGrid:{
            num:9,
            commonClass:"cube",
            privateClass:"cube"
        },
        fadingCircle:{
            num:12,
            commonClass:"circle",
            privateClass:"circle"
        },
        foldingCube:{
            num:4,
            commonClass:"cube",
            privateClass:"cube"
        }

    };

    function XPop(dom,settings){
        this.defaults={
            dragMode:true,
            backdropMode:true,
            resizeMode:true,
            margin:30
        };
        this.settings=$.extend(true,{},this.defaults,settings);
        this._init(dom);
    }
    XPop.prototype={
        _init:function(dom){
            this.$Wrapper=$(dom);
            if(this.$Wrapper.length==0){
                throw("XPop:dom is null!");
            }
            //this.$Content=this.$Wrapper.children(".xpop-content");
            this.width=this.$Wrapper.width();
            this.height=this.$Wrapper.height();
            this.$Header=this.$Wrapper.find(".xpop-header");
            var offset=this.$Wrapper.offset();
            this.left=offset.left;
            this.top=offset.top;
            this.originalStatus={width:this.width,height:this.height,left:this.left,right:this.right};
            this.minimizeSize={width:200,height:43};

            this._show();

            if(this.settings.dragMode){
                this._initDragEvent();
            }
            this._initMaximizeEvent();
            this._initMinimizeEvent();
            this._initCloseEvent();
            this._initOkEvent();
            this._initCancelEvent();
            this._initResizeEvent();
            this._bindEvent();
        },
        _bindEvent:function(){
            this.on("show.XPop",function(){
                //console.log("show")
            }).on("close.XPop",function(){
                //console.log("close")
            })
        },
        _show:function(){
            //设置遮罩
            if(this.settings.backdropMode){
                if($BackDrop==null){
                    $BackDrop=$("<div class='xpop-backdrop'></div>").appendTo($Body).show();
                }else{
                    $BackDrop.show();
                }
            }
            //设置大小
            switch (this.$Wrapper.attr("data-size")){
                case "largeHeight":
                    this._largeHeight();
                    break;
                default:

                    break;
            }
            //设置位置
            switch (this.$Wrapper.attr("data-position")){
                case "center":
                    this._centerPosition();
                    break;
                case "normal":
                    this._normalPosition();
                    break;
                default:
                    this._normalPosition();
                    break;
            }
            //动画显示
            //?????
            this.$Wrapper.show(1,function(){
                this.$Wrapper.addClass("xpop-animated-bounceIn");
                this.trigger("show.XPop");
            }.bind(this));
            /*this.$Wrapper.show().addClass("xpop-animated-bounceIn");
            this.trigger("show.XPop");*/
        },
        _initDragEvent:function(){
            this.dragStart=false;
            this.$Header.css("cursor","move").on("mousedown.XPop.drag",function(e){
                this.dragStart=true;
                this.x=e.clientX;
                this.y=e.clientY;
            }.bind(this)).on("mousemove.XPop.drag",function(e){
                if(this.dragStart){
                    e.preventDefault();
                }
            }.bind(this));
            $Body.on("mouseup.XPop.drag",function(){
                this.dragStart=false;
            }.bind(this)).on("mousemove.XPop.drag",function(e){
                if(this.dragStart){
                    var deltaX=e.clientX-this.x,deltaY=e.clientY-this.y;
                    this._setPos({left:this.left+deltaX,top:this.top+deltaY});
                    this.trigger("dragging.XPop");//正在拖动
                    this.x=e.clientX;
                    this.y=e.clientY;
                }
            }.bind(this)).on("mouseleave.XPop.drag",function(){
                this.dragStart=false;
            }.bind(this))
        },
        _initMaximizeEvent:function(){
            this.$Wrapper.find("[data-tool=maximize]").on("click.XPop.minimize",function(e){
                var _self=$(e.target);
                if(_self.hasClass("restore")){
                    _self.removeClass("restore").siblings(".minimize").show();
                    this.$Wrapper.removeClass("maximized");
                    this._restore();
                }else{
                    this._maximize();
                    _self.addClass("restore").siblings(".minimize").hide();
                    this.$Wrapper.addClass("maximized");
                }

            }.bind(this))
        },
        _initMinimizeEvent:function(){
            this.$Wrapper.find("[data-tool=minimize]").on("click.XPop.maximize",function(e){
                var _self=$(e.target);
                if(_self.hasClass("restore")){
                    _self.removeClass("restore").siblings(".maximize").show();
                    this.$Wrapper.removeClass("minimized");
                    this._restore();
                }else{
                    this._minimize();
                    _self.addClass("restore").siblings(".maximize").hide();
                    this.$Wrapper.addClass("minimized");
                }

            }.bind(this))
        },
        _initCloseEvent:function(){
            this.$Wrapper.find("[data-tool=close]").on("click.XPop.close",function(){
                this._close();
            }.bind(this))
        },
        _initOkEvent:function(){
            this.$Wrapper.find("[data-tool=ok]").on("click.XPop.ok",function(){
                this.value=true;
                this.trigger("ok.XPop");//点击ok按钮
                this._close(true);
            }.bind(this))
        },
        _initCancelEvent:function(){
            this.$Wrapper.find("[data-tool=cancel]").on("click.XPop.cancel",function(){
                this.value=false;
                this.trigger("cancel.XPop");//点击cancel按钮
                this._close(false);
            }.bind(this))
        },
        _initResizeEvent:function(){
            $Window.on("resize.XPop.resize",function(){
                windowWidth=$Window.width();
                windowHeight=$Window.height();
                if(this.$Wrapper.hasClass("maximized")){
                    this.width= windowWidth;
                    this.height= windowHeight;
                }else{
                    this.width=this.$Wrapper.width();
                    this.height=this.$Wrapper.height();
                }

                this._setSize({width:this.width,height:this.height});
            }.bind(this))
        },
        _setPos:function(offset,isScale){
            var position={};

            if($.type(offset.left)!="undefined") {
                this.left=position.left=offset.left;
            }
            if($.type(offset.right)!="undefined"){
                this.left=position.left=windowWidth-this.minimizeSize.width-offset.right;
            }
            if($.type(offset.top)!="undefined") {
                this.top=position.top=offset.top;
            }
            if($.type(offset.bottom)!="undefined"){
                this.top=position.top=windowHeight-this.minimizeSize.height-offset.bottom;
            }
            this.$Wrapper.css(position);
            if(!isScale){
                this.originalStatus.left=position.left;
                this.originalStatus.top=position.top;
            }
        },
        _setSize:function(measure,isScale){
            var size={};
            if($.type(measure.width)!="undefined") {
                if($.type(measure.width)=="string"&&measure.width.indexOf("%")>-1){//支持百分比
                    measure.width=windowWidth*parseInt(measure.width)/100;
                }
                this.width=size.width=measure.width;
            }
            if($.type(measure.height)!="undefined") {
                if($.type(measure.height)=="string"&&measure.height.indexOf("%")>-1){//支持百分比
                    measure.height=windowHeight*parseInt(measure.height)/100;
                }
                this.height=size.height=measure.height;
            }
            this.$Wrapper.css(size);
            if(!isScale){
                if($.type(size.width)!="undefined"){
                    this.originalStatus.width=size.width;
                }
                if($.type(size.height)!="undefined") {
                    this.originalStatus.height = size.height;
                }
            }
        },
        _normalPosition:function(){
            this._setPos({
                left:windowWidth/2-this.width/2,
                top:this.settings.margin
            });
        },
        _centerPosition:function(){
            this._setPos({
                left:(windowWidth-this.width)/2,
                top:(windowHeight-this.height)/2
            });
        },
        _largeHeight:function(){
            this._setSize({
                height:windowHeight-this.settings.margin*2
            })
        },
        _maximize:function(){
            this._setPos({left:0,top:0},true);
            this._setSize({width:"100%",height:"100%"},true);
        },
        _minimize:function(){
            this._setPos({left:0,bottom:0},true);
            this._setSize({width:this.minimizeSize.width,height:this.minimizeSize.height},true);
        },
        _restore:function(){
            this._setPos({left:this.originalStatus.left,top:this.originalStatus.top});
            this._setSize({width:this.originalStatus.width,height:this.originalStatus.height});
        },
        _close:function(){
            $Window.off(".XPop");
            this.$Header.off(".XPop");
            this.$Wrapper.addClass("xpop-animated-bounceOut");
            if($BackDrop!=null){
                $BackDrop.hide();
            }
            setTimeout(function(arguments){
                var param=[].slice.call(arguments);
                param.unshift("close.XPop");
                this.trigger.apply(this,param);
                this.$Wrapper.remove();
            }.bind(this,arguments),300);
        },
        on:function(event,callback){
            this.$Wrapper.on(event,callback.bind(this));
            return this;
        },
        off:function(event){
            this.$Wrapper.off(event);
            return this;
        },
        trigger:function(event,args){
            this.$Wrapper.trigger(event,args);
            return this;
        }
    };
    $.extend(XPop,{
        pop:function(type,msg,title,options){
            var settings={
                backdropMode:false,
                dragMode:false,
                resizeMode:false,

                maximizable:false,
                minimizable:false,
                closable:false,

                okBtn:false,
                okBtnText:"确定",
                cancelBtn:false,
                cancelBtnText:"取消",
                closeBtn:false,
                closeBtnText:"关闭"
            };
            var $XPop_content=$('<div class="xpop"><div class="xpop-content"></div></div>'),
                $XPop_header=$('<div class="xpop-header"></div>'),
                $XPop_body=$('<div class="xpop-body"></div>'),
                $XPop_footer=$('<div class="xpop-footer"></div>');

            switch (type){
                case "tip":
                    $.extend(true,settings,{
                        delay:2000
                    });
                    if($.type(title)=="object"||$.type(title)=="undefined"){
                        options=title;
                        $.extend(true,settings,options);
                    }else if($.type(title)=="string"){
                        $.extend(true,settings,options);
                    }
                    break;
                case "confirm":
                    $.extend(true,settings,{
                        okBtn:true,
                        cancelBtn:true
                    });
                    if(msg instanceof $|| msg.nodeType==1){
                        msg=$(msg).prop("outerHTML");
                    }
                    if($.type(title)=="object"||$.type(title)=="undefined"){
                        options=title;
                        $.extend(true,settings,options);
                    }else if($.type(title)=="string"){
                        $.extend(true,settings,options);
                        $XPop_header.html(title).appendTo($XPop_content.children(".xpop-content"));
                    }
                    break;
                case "prompt":
                    $.extend(true,settings,{
                        okBtn:true,
                        cancelBtn:true
                    });
                    if($.type(title)=="object"||$.type(title)=="undefined"){
                        options=title;
                        $.extend(true,settings,options);
                        $XPop_header.html(msg).appendTo($XPop_content.children(".xpop-content"));
                        msg='<input type="text" value=""/>';console.log(msg);
                    }else if($.type(title)=="string"){
                        $.extend(true,settings,options);
                        $XPop_header.html(title).appendTo($XPop_content.children(".xpop-content"));//只要title
                        msg='<input type="text" value="'+msg+'"/>';//第二个参数为value
                    }
                    break;
                case "url":
                    $.extend(true,settings,{
                        dragMode:true,
                        closable:true,
                        maximizable:true,
                        minimizable:true
                    });
                    if($.type(title)=="object"||$.type(title)=="undefined"){
                        options=title;
                        $.extend(true,settings,options);
                        $XPop_header.html(msg).appendTo($XPop_content.children(".xpop-content"));//url做标题
                    }else if($.type(title)=="string"){
                        $.extend(true,settings,options);
                        $XPop_header.html(title).appendTo($XPop_content.children(".xpop-content"));
                    }
                    msg='<iframe src="'+msg+'" scrolling="auto" allowtransparency="true" frameborder="0"></iframe>';
                    break;
                case "loading":
                    $.extend(true,settings,{
                        //backdropMode:true
                    });
                    var msgHump=msg;
                    if(msg.indexOf("-")>-1){
                        msgHump=$.camelCase(msg);
                    }
                    if(msgHump=="foldingCube"){
                        msg='<div class="x-loading-folding-cube">' +
                            '<div class="x-loading-cube1 x-loading-cube"></div> ' +
                            '<div class="x-loading-cube2 x-loading-cube"></div> ' +
                            '<div class="x-loading-cube4 x-loading-cube"></div> ' +
                            '<div class="x-loading-cube3 x-loading-cube"></div> ' +
                            '</div>';
                        break;
                    }else{
                        var loadingAnim=loading[msgHump];
                        if($.isEmptyObject(loadingAnim)){
                            throw ("XPop:loading animation is valid!");
                        }else{
                            var msgUnderScore=msgHump.replace(/[A-Z]/,function(s){
                                return "-"+s.toLowerCase();
                            });
                            var extraClass=$.type(loadingAnim.extraClass)!="undefined"?loadingAnim.extraClass:"";
                            msg='<div class="x-loading-'+msgUnderScore+' '+extraClass+'">';
                            for(var i=0;i<loadingAnim.num;i++){
                                msg+='<div class="x-loading-'+loadingAnim.commonClass+' x-loading-'+loadingAnim.privateClass+(i+1)+'"></div>';
                            }
                            msg+='</div>';
                        }
                    }
            }

            $XPop_body.html(msg);

            if(settings.closable){
                $('<button class="close" data-tool="close"></button>').appendTo($XPop_header);
            }
            if(settings.maximizable){
                $('<button class="maximize" data-tool="maximize"></button>').appendTo($XPop_header);
            }
            if(settings.minimizable){
                $('<button class="minimize" data-tool="minimize"></button>').appendTo($XPop_header);
            }

            if(settings.closeBtn){
                $('<button class="xpop-btn btn-primary" data-tool="close">'+settings.closeBtnText+'</button>').appendTo($XPop_footer);
            }
            if(settings.cancelBtn){
                $('<button class="xpop-btn btn-primary" data-tool="cancel">'+settings.cancelBtnText+'</button>').appendTo($XPop_footer);
            }
            if(settings.okBtn){
                $('<button class="xpop-btn btn-primary" data-tool="ok">'+settings.okBtnText+'</button>').appendTo($XPop_footer);
            }

            switch(type){
                case "tip":
                    $XPop_content.addClass("xpop-tip").attr("data-position","center")
                        .children(".xpop-content").append($XPop_body)
                        .end().appendTo($Body);
                    return $XPop_content.XPop(settings).on("show.XPop",function(){
                        setTimeout(function(){
                            this._close();
                        }.bind(this),settings.delay);
                    });
                    break;
                case "confirm":
                    $XPop_content.addClass("xpop-confirm")
                        .children(".xpop-content").append($XPop_body).append($XPop_footer)
                        .end().appendTo($Body);

                    return $XPop_content.XPop(settings);
                    break;
                case "prompt":
                    $XPop_content.addClass("xpop-prompt")
                        .children(".xpop-content").append($XPop_body).append($XPop_footer)
                        .end().appendTo($Body);

                    return $XPop_content.XPop(settings);
                    break;
                case "url":
                    $XPop_content.addClass("xpop-url").attr("data-size","largeHeight")
                        .children(".xpop-content").append($XPop_body)
                        .end().appendTo($Body);

                    return $XPop_content.XPop(settings);
                    break;
                case "loading":
                    $XPop_content.addClass("xpop-loading").attr("data-position","center")
                        .children(".xpop-content").append($XPop_body)
                        .end().appendTo($Body);

                    return $XPop_content.XPop(settings);
                    break;
            }
        }
    });
    $.fn.extend({
        XPop:function(settings){return new XPop(this,settings)}
    });
    window.XPop=XPop;
});