// ==================================================
// 
// GazeImg.gQuery.js v1.0.1
// (c) 2020-present, JU Chengren (Ganxiaozhe)
//
// Licensed GPLv3 for open source use
// or GazeImg Commercial License for commercial use
//
// ==================================================
;(function($, window, document){
	'use strict';
	if(!$){throw new Error('GazeImg.js need gQuery: https://gquery.net/');}
	console.log('%c GazeImg v1.0.1 %c www.gquery.net/plugins/gazeimg/ \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');

	let __gi = {
		s: {close:0, move:0},
		iloader: function(src){
			return new Promise(function(resolve, reject){
				const image = new Image();

				image.onload = function(){resolve(image);};
				image.onerror = function(){reject(image);};

				image.src = src;
				if(image.complete){resolve(image);}
			});
		},
		ishowBind: function(){
			$('img[data-gishow]').removeAttr('data-gishow').addClass('gi-click').on('click', function(){
				let im = {$i:$(this)};
				im.src = im.$i.attr('src');
				__gi.show(im.src);
			});
		},
		show: function(src){
			let t = {};
			t.stage = "<div class='gazeimg-container'>"+
				"<div class='gazeimg-bg'></div>"+
				"<div class='gazeimg-inner'>"+
					"<div class='gazeimg-stage'>"+
						"<div class='gazeimg-content'><div class='loader'></div></div>"+
					"</div>"+
				"</div>"+
			"</div>";
			$('body').append(t.stage).addClass('gi-nobar');
			__gi.showBind();

			__gi.iloader(src).then(function(img){
				// 容器尺寸
				t.$stage = $('.gazeimg-stage');
				t.stageW = t.$stage.width();t.stageH = t.$stage.height();
				// 最终尺寸
				t.iW = img.width;t.iH = img.height;
				// 是否放大
				t.isZoom = 0;
				// 计算占比
				t.percW = img.width/t.stageW;t.percH = img.height/t.stageH;
				// 如果双方都溢出，则取大的按100%计算
				if(t.percW>1 || t.percH>1){
					if(t.percW>t.percH){
						t.iW = t.stageW;
						t.iH = t.iW / img.width * t.iH;
					} else {
						t.iH = t.stageH;
						t.iW = t.iH / img.height * t.iW;
					}
					t.isZoom = 1;
				}

				t.cls = t.isZoom ? 'zoom-in' : 'zoom-out';

				$('.gazeimg-content').data({
					iW:t.iW, iH:t.iH,
					inW:img.width, inH:img.height,
					isZoom: t.isZoom, zoom: 0
				}).html(`<img src='${src}'/>`).css({width:`${t.iW}px`, height:`${t.iH}px`}).addClass(t.cls);
				$('.gazeimg-content img').on('mousedown', function(e){e.preventDefault();});
			});
		},
		showBind: function(){
			$('.gazeimg-container').on('click', function(){
				__gi.s.close++;
				setTimeout(()=>{
					__gi.s.close == 1 && __gi.showClose();
				},50);
			});


			$('.gazeimg-content').on({
				click: function(){
					__gi.s.close--;
					let t = {$obj: $(this)};

					// 是否在缩放下查看
					if(__gi.s.move>0){return;}

					// 是否放大
					if(t.$obj.data('isZoom')!=1){__gi.showClose();return;}

					if(t.$obj.data('zoom')==1){
						// 放大状态下
						t.iW = t.$obj.data('iW');t.iH = t.$obj.data('iH');t.zoom=0;
					} else {
						t.iW = t.$obj.data('inW');t.iH = t.$obj.data('inH');t.zoom=1;
					}

					t.cls = t.zoom ? 'grab' : 'zoom-in';
					t.$obj.data('zoom', t.zoom).css({
						width:`${t.iW}px`, height:`${t.iH}px`,
						transform: 'translate(0px, 0px)'
					}).removeClass('zoom-in grab').addClass(t.cls);
				},
				mousedown: __gi.showMove,
				mouseup: __gi.showMoveEnd,
				touchstart: __gi.showMove,
				touchend: __gi.showMoveEnd
			});
		},
		showMove: function(e){
			let $obj = $(this), pos = {};

			pos.tran = $obj.css('transform').replace(/[^0-9\-,.]/g,'').split(',');
			pos.tran.length!=6 && (pos.tran = [0,0,0,0,0,0]);
			pos.tran = pos.tran.map(v=>parseInt(v));

			this.setCapture && this.setCapture();
			pos.evt = (e.type=='touchstart' ? 'touchmove.drag' : 'mousemove.drag');
			$obj.addClass('grabbing');
			$(document).on(pos.evt, function(de){
				__gi.s.move = 1;

				if(de.type=='touchmove'){
					pos.L = pos.tran[4] + de.targetTouches[0].pageX - e.targetTouches[0].pageX;
					pos.T = pos.tran[5] + de.targetTouches[0].pageY - e.targetTouches[0].pageY;
				} else {
					pos.L = pos.tran[4] + de.pageX - e.pageX;
					pos.T = pos.tran[5] + de.pageY - e.pageY;
				}

				if($obj.data('zoom')==1){
					$obj.css({transform: 'translate('+pos.L+'px,'+pos.T+'px)'});
				} else {
					// 在缩小状态下，下滑退出
					pos.opa = 1 - Math.abs(parseInt(pos.T))/300;
					pos.opa < 0 && (pos.opa = 0);
					$obj.css({transform: 'translate(0px,'+pos.T+'px)', opacity: pos.opa});
				}
				__gi.s.pos = pos;
			});
			__gi.s.pos = pos;
		},
		showMoveEnd: function(e){
			let pos = __gi.s.pos, $obj = $(this);
			$obj.removeClass('grabbing');
			setTimeout(()=>{__gi.s.move = 0;}, 50);

			this.releaseCapture && this.releaseCapture();
			$(document).off(pos.evt);

			// 在缩小状态下，下滑退出
			if($obj.data('zoom')==0){
				if(pos.opa<0.5){
					__gi.showClose();
				} else {
					$obj.css({transform: 'translate(0px, 0px)', opacity:1});
				}
			}
		},
		showClose: function(){
			$('.gazeimg-container .gazeimg-inner').addClass('gia-zoomOut');
			$('.gazeimg-content').off();
			setTimeout(()=>{
				$('.gazeimg-container').off().remove();
				$('body').removeClass('gi-nobar');
				__gi.s.close = 0;
			}, 400);
		}
	};

	$.fn.extend({
		gazeimg: function(opts){
			opts || typeof opts !== 'object' && (opts = {});
			Array.isArray(opts.bg) || (opts.bg = [
				"linear-gradient(to right, #C3E1CA, #E6E1BD)","linear-gradient(to right, #D4D3DD, #EFEFBB)",
				"linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)","linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)",
				"linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.15) 100%)",
				"linear-gradient(to top, #c1dfc4 0%, #deecdd 100%)","linear-gradient(to top, #d5d4d0 0%, #d5d4d0 1%, #eeeeec 31%, #efeeec 75%, #e9e9e7 100%);"
			]);

			this.each(function(idx){
				let si = {
					$i:$(this), w:this.offsetWidth, h:this.offsetHeight, cls:this.className
				};

				si.src = si.$i.attr('data-gisrc');
				si.$i.attr('data-gi-ready',1).removeAttr('data-gisrc');
				opts.class && (si.cls = opts.class);

				// 是否为图片蒙版
				si.isrc = si.$i.attr('src');
				if(si.isrc){
					si.$i.data('giSRC', si.src).attr('data-gi-prepare',1).removeAttr('data-gi-ready');
					return true;
				}

				si.ohtml = this.outerHTML;
				si.cls = si.cls ? ` class='${si.cls}'` : '';
				si.style = ` style='width:${si.w}px;height:${si.h}px;background:${opts.bg[Math.floor(Math.random()*opts.bg.length)]}'`;


				si.html = `<div id='giQL-${idx}' data-gi-prepare${si.cls}${si.style}><div class='loader'></div></div>`;
				this.outerHTML = si.html;
				$('#giQL-'+idx).data({giHTML:si.ohtml, giSRC:si.src}).removeAttr('id').addClass('gi-loading');
			});

			$(window).trigger('scroll');
		}
	});

	$(window).on('scroll.gazeimg', function(){
		let t = {deh: document.documentElement.clientHeight};

		$('img[data-gi-prepare], div[data-gi-prepare]').each(function(){
			t.ietop = this.getBoundingClientRect().top;
			if(t.ietop >= t.deh){return true;}

			let i = {$obj:$(this)};
			i.src = i.$obj.removeAttr('data-gi-prepare').data('giSRC');

			__gi.iloader(i.src).then(function(){
				if(i.$obj[0].tagName.toLowerCase()=='img'){
					i.$obj.attr('src', i.src);__gi.ishowBind();return;
				}

				let html = i.$obj.data('giHTML');
				i.$obj.ohtml(html);
				$('img[data-gi-ready]').attr('src', i.src).removeAttr('data-gi-ready').addClass('gia-fadeIn');
				__gi.ishowBind();
			}, function(){
				let cls = i.$obj.addClass('gi-loading gi-failed').attr('class');
				i.$obj.ohtml(`<div class='${cls}'><a href="${i.src}" target="_blank">图片 ${i.src} 加载失败；</a></div>`);
			});
		});
	}, {passive:true});

	// 初始化
	$('img[data-gisrc]').gazeimg();
})(gQuery, window, document);