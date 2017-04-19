Xpop 一款弹框插件
-
[demo](http://princekin.tjxuechuang.com/projects/xpop/index.html)
##功能

###modal
html

	/*
	 * data-tool="close"//关闭功能
	 * data-tool="maximize"//最大化功能功能
	 * data-tool="minimize"//最小化功能
	 * data-tool="ok"//confirm时值为true
	 */
	<div class="xpop xpop-modal">
	    <div class="xpop-content">
	        <div class="xpop-header">
	            <h4 class="xpop-title">XPop Title</h4>
	            <button class="close" data-tool="close"></button>
	            <button class="maximize" data-tool="maximize"></button>
	            <button class="minimize" data-tool="minimize"></button>
	        </div>
	        <div class="xpop-body">
	            简洁、直观、强悍的前端开发框架，让web开发更迅速、简单。
	        </div>
	        <div class="xpop-footer">
	            <button class="xpop-btn btn-default" data-tool="close">close</button>
	            <button class="xpop-btn btn-primary" data-tool="ok">ok</button>
	        </div>
	    </div>
	</div>
js

	$(".xpop").XPop({
        dragMode:true,
        backdropMode:true
    });
###tip
js

	XPop.pop("tip","成功");
###confirm
js

	XPop.pop("confirm","成功","title").on("close.XPop",function (e,v) {
        console.log(v);//用户点击确定v是true，点击false，v是false
    });
###prompt
js

	XPop.pop("prompt","输入口令").on("close.XPop",function (e,v) {
        console.log(v);//v是用户输入的值
    });
###loading
js

	var loading=XPop.pop("loading","wave");
    setTimeout(function(){
        loading._close();
    },3000);//3秒后隐去
###用元素作为内容
js

	XPop.pop("confirm",$("#target"),"捕获内容"{
		dragMode:true,
		closable:true,
		maximizable:true,
		minimizable:true
	});
###url作为内容
js
	
	XPop.pop("url","https://www.baidu.com/","百度");
##配置项
- dragMode:是否可拖动
- resizeMode:是否可缩放
- backdropMode:是否有遮罩

##加载动画
	rotatingPlane,doubleBounce,wave,wanderingCubes,spinner,chasingDots,threeBounce,circle,cubeGrid,fadingCircle,foldingCube