// ==================================================
// 
// GazeImg.gQuery.js v1.1.0
// (c) 2020-present, JU Chengren (Ganxiaozhe)
//
// Licensed GPLv3 for open source use
// or GazeImg Commercial License for commercial use
//
// gquery.net/plugins/gazeimg
//
// ==================================================
;(function($, window, document){
	'use strict';
	if(!$){throw new Error('GazeImg.js need gQuery: https://gquery.net/');}
	console.log('%c GazeImg v1.1.0 %c www.gquery.net/plugins/gazeimg \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');

	let __gi = {
		s: {close:0, move:0, queue:[], index:0},
		fn: {
			getTran: function($obj){
				let tran = $obj.css('transform').replace(/[^0-9\-,.]/g,'').split(',');
				tran.length!=6 && (tran = [0,0,0,0,0,0]);
				return tran.map(v=>parseInt(v));
			}
		},
		iloader: function(src){
			return new Promise(function(resolve, reject){
				const image = new Image();

				image.onload = function(){resolve(image);};
				image.onerror = function(){reject(image);};

				image.src = src;
				if(image.complete){resolve(image);}
			});
		},
		// 传入容器及图片原始长宽，返回在容器内的图片长宽等信息
		// ww, wh, ow, oh | w, h, iz
		isizeCalc: function(opts){
			for(let k in opts){
				isNaN(opts[k]) && ( opts[k] = parseInt(opts[k].replace('px','')) );
			}
			opts.w = opts.ow, opts.h = opts.oh;
			// 是否放大
			opts.iz = 0;
			// 计算占比
			opts.percW = opts.ow/opts.ww;
			opts.percH = opts.oh/opts.wh;
			// 如果双方都溢出，则取大的按100%计算
			if(opts.percW>1 || opts.percH>1){
				if(opts.percW > opts.percH){
					opts.w = opts.ww;
					opts.h = opts.w / opts.ow * opts.oh;
				} else {
					opts.h = opts.wh;
					opts.w = opts.h / opts.oh * opts.ow;
				}
				opts.iz = 1;
			}
			return opts;
		},
		ishowBind: function(){
			$('img[data-gishow]').each(function(idx){
				let im = {$i:$(this)};
				// 组别处理
				im.group = im.$i.attr('data-gishow');
				im.group && (im.$i.attr('data-gigp', im.group));

				this.removeAttribute('data-gishow');
				this.classList.add('gi-click');
			}).on('click', function(){
				let im = {i:this, $i:$(this), arr:[], idx:0};
				im.arr.push( im.$i.attr('src') );

				// 组别处理
				im.group = im.$i.attr('data-gigp');
				$(`img[data-gigp="${im.group}"`).each(function(idx){
					// 清空数组
					idx==0 && (im.arr.length=0);

					im.arr.push( this.getAttribute('src') )
					im.i == this && (im.idx = idx);
				});

				__gi.show(im.arr, im.idx);
			});
		},
		show: function(arr, idx){
			let t = {};
			idx || (idx=0);
			__gi.s.queue = arr;
			__gi.s.index = idx;

			t.stage = "<div class='gazeimg-container'>"+
				"<div class='gazeimg-bg'></div>"+
				"<div class='gazeimg-inner'>"+
					"<div class='gazeimg-nav'><div class='gazeimg-pages'>1 / 1</div></div>"+
					"<div class='gazeimg-stage'>"+
						"<div class='gazeimg-slide current'><div class='gazeimg-content'><div class='loader'></div></div></div>"+
					"</div>"+
				"</div>"+
			"</div>";
			$('body').append(t.stage).addClass('gi-nobar');

			__gi.sprepare();
			__gi.sbind();
			__gi.sloader($('.gazeimg-slide.current > .gazeimg-content'), arr[idx]);
		},
		sprepare: function(){
			if(__gi.s.queue.length<2){return;}
			let t = {$stage:$('.gazeimg-stage')}, queue = __gi.s.queue, index = __gi.s.index;

			$('.gazeimg-pages').text(`${index+1} / ${queue.length}`);

			$('.gazeimg-container').addClass('grabbing');
			$('.gazeimg-slide:not(.current)').remove();
			$('.gazeimg-slide.current').css({transform: 'translate(0px, 0px)'});

			if(index > 0){
				t.$stage.append("<div class='gazeimg-slide prev'><div class='gazeimg-content'><div class='loader'></div></div></div>");
				__gi.sloader($('.gazeimg-slide.prev > .gazeimg-content'), queue[index-1]);
			}
			if(index < queue.length-1){
				t.$stage.append("<div class='gazeimg-slide next'><div class='gazeimg-content'><div class='loader'></div></div></div>");
				__gi.sloader($('.gazeimg-slide.next > .gazeimg-content'), queue[index+1]);
			}

			$('.gazeimg-container').removeClass('grabbing x-grabbing');
		},
		sloader: function($obj, src){
			let t = {};
			$obj.html("<div class='loader'></div>");

			// 容器尺寸
			t.$stage = $('.gazeimg-stage');
			t.stageW = t.$stage.width();t.stageH = t.$stage.height();

			__gi.iloader(src).then(function(img){
				// 计算处理
				let icalc = __gi.isizeCalc({
					ww: t.stageW, wh: t.stageH,
					ow: img.width, oh: img.height
				});

				t.cls = icalc.iz ? 'zoom-in' : 'zoom-out';

				$obj.data({
					iW:icalc.w, iH:icalc.h,
					inW:icalc.ow, inH:icalc.oh,
					isZoom: icalc.iz, zoom: 0
				}).html(`<img src='${src}'/>`).css({
					width:`${icalc.w}px`, height:`${icalc.h}px`
				}).addClass(t.cls);
				$obj.find('img').on('mousedown', function(e){e.preventDefault();});
			}).catch(function(err){
				$obj.data({
					isZoom:0, zoom:0
				}).css({width:'auto'}).html(`<div class='dialog'>图片加载失败！</div>`);
			});
		},
		sbind: function(){
			// 仅需单次绑定的事件
			$('.gazeimg-container').on('click', function(){
				// 在移动时无效，防止和 mouse down\up 冲突
				if(__gi.s.move>0){return;}

				__gi.s.close++;
				setTimeout(()=>{
					__gi.s.close == 1 && __gi.showClose();
				},50);
			});

			$('.gazeimg-container').on({
				mousedown: __gi.slideMove,
				mouseup: __gi.slideMoveEnd,
				touchstart: __gi.slideMove,
				touchend: __gi.slideMoveEnd
			}, '.gazeimg-slide');

			$('.gazeimg-container').on({
				click: function(){
					// 在移动时无效，防止和 mouse down\up 冲突
					if(__gi.s.move>0){return;}

					__gi.s.close--;
					let t = {$obj: $(this)};

					// 是否支持放大，否则关闭
					if(t.$obj.data('isZoom')!=1){
						__gi.showClose();
						return;
					}

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
			}, '.gazeimg-content');
		},
		slideMove: function(e){
			let $obj = $(this), pos = {};
			if( (e.type=='mousedown' && e.which!=1) || $obj.find('.gazeimg-content').data('zoom')==1 ){
				return;
			}

			pos.tran = __gi.fn.getTran($obj);
			$('.gazeimg-container').addClass('grabbing');

			pos.evt = (e.type=='touchstart' ? 'touchmove.drag' : 'mousemove.drag');
			this.setCapture && this.setCapture();
			$(document).on(pos.evt, function(de){
				if(de.type=='touchmove'){
					pos.L = pos.tran[4] + de.targetTouches[0].pageX - e.targetTouches[0].pageX;
					pos.T = pos.tran[5] + de.targetTouches[0].pageY - e.targetTouches[0].pageY;
				} else {
					pos.L = pos.tran[4] + de.pageX - e.pageX;
					pos.T = pos.tran[5] + de.pageY - e.pageY;
				}

				if(!pos.type){
					__gi.s.move = 1;
					pos.type = Math.abs(pos.T)>Math.abs(pos.L) ? 'y' : 'x';

					// 当图片少于2张时，只能上下滑动
					__gi.s.queue.length<2 && (pos.type = 'y');

					pos.type=='x' && $('.gazeimg-container').addClass('x-grabbing');
				}

				if(pos.type=='y'){
					// 上下滑退出
					pos.opa = 1 - Math.abs(parseInt(pos.T))/300;
					pos.opa < 0 && (pos.opa = 0);
					$obj.css({transform: 'translate(0px,'+pos.T+'px)', opacity: pos.opa});
				} else {
					// 左右滑切换
					let $prev = $('.gazeimg-slide.prev'), $next = $('.gazeimg-slide.next');
					pos.ww = window.innerWidth;
					pos.xperc = pos.L/pos.ww;

					// 没有图片时
					if(pos.xperc<0){
						// next
						if(__gi.s.index>=__gi.s.queue.length-1){pos.L/=4;pos.xperc=0;}
					} else {
						// prev
						if(__gi.s.index<1){pos.L/=4;pos.xperc=0;}
					}

					$obj.css({transform: 'translate('+pos.L+'px,0px)'});

					$prev.css({transform: 'translate('+(pos.L-pos.ww)+'px,0px)'});
					$next.css({transform: 'translate('+(pos.L+pos.ww)+'px,0px)'});
				}

				__gi.s.slidePos = pos;
			});
			__gi.s.slidePos = pos;
		},
		slideMoveEnd: function(e){
			let pos = __gi.s.slidePos, $obj = $(this);
			if($obj.find('.gazeimg-content').data('zoom')==1){return;}

			$('.gazeimg-container').removeClass('grabbing');
			setTimeout(()=>{__gi.s.move = 0;}, 50);

			this.releaseCapture && this.releaseCapture();
			$(document).off(pos.evt);

			// 上下滑退出
			if(pos.type=='y'){
				if(pos.opa<0.5){
					__gi.showClose();
				} else {
					$obj.css({transform: 'translate(0px, 0px)', opacity:1});
				}
			}
			if(pos.type!='x'){return;}


			// 左右滑切换
			let $prev = $('.gazeimg-slide.prev'), $next = $('.gazeimg-slide.next');

			// 切换失败
			if( Math.abs(pos.xperc)<0.2 ){
				$prev.css({transform: `translate(${-pos.ww}px, 0px)`});
				$obj.css({transform: 'translate(0px, 0px)'});
				$next.css({transform: `translate(${pos.ww}px, 0px)`});

				setTimeout(()=>{$('.gazeimg-container').removeClass('x-grabbing');}, 300);
				return;
			}

			// 向右切换 next
			if(pos.xperc<0){
				__gi.s.index++;
				$obj.css({transform: `translate(${-pos.ww}px, 0px)`});
				$next.css({transform: `translate(0px, 0px)`});

				setTimeout(()=>{
					$obj.removeClass('current').addClass('prev');
					$next.removeClass('next').addClass('current');
					__gi.sprepare();
				}, 300);
				return;
			}

			// 向左切换 prev
			__gi.s.index--;
			$obj.css({transform: `translate(${pos.ww}px, 0px)`});
			$prev.css({transform: `translate(0px, 0px)`});

			setTimeout(()=>{
				$obj.removeClass('current').addClass('next');
				$prev.removeClass('prev').addClass('current');
				__gi.sprepare();
			}, 300);
		},
		showMove: function(e){
			let $obj = $(this), pos = {};
			if( (e.type=='mousedown' && e.which!=1) || $obj.data('zoom')==0 ){
				return;
			}

			pos.tran = __gi.fn.getTran($obj);
			$obj.addClass('grabbing');

			pos.evt = (e.type=='touchstart' ? 'touchmove.drag' : 'mousemove.drag');
			this.setCapture && this.setCapture();
			$(document).on(pos.evt, function(de){
				__gi.s.move = 1;

				if(de.type=='touchmove'){
					pos.L = pos.tran[4] + de.targetTouches[0].pageX - e.targetTouches[0].pageX;
					pos.T = pos.tran[5] + de.targetTouches[0].pageY - e.targetTouches[0].pageY;
				} else {
					pos.L = pos.tran[4] + de.pageX - e.pageX;
					pos.T = pos.tran[5] + de.pageY - e.pageY;
				}

				$obj.css({transform: 'translate('+pos.L+'px,'+pos.T+'px)'});
			});
			__gi.s.pos = pos;
		},
		showMoveEnd: function(e){
			let pos = __gi.s.pos, $obj = $(this);
			if($obj.data('zoom')==0){return;}

			$obj.removeClass('grabbing');
			setTimeout(()=>{__gi.s.move = 0;}, 50);

			this.releaseCapture && this.releaseCapture();
			$(document).off(pos.evt);
		},
		showClose: function(){
			$('.gazeimg-container').fadeOut(400);
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
					$i:$(this), w:this.offsetWidth+'px', h:this.offsetHeight+'px', cls:this.className
				};
				si.$p = si.$i.parent();

				si.src = si.$i.attr('data-gisrc');
				si.$i.attr('data-gi-ready',1).removeAttr('data-gisrc');
				opts.class && (si.cls = opts.class);

				// 内置尺寸
				si.de = si.src.split(' ');
				if(si.de.length>1){
					si.src = si.de[0];

					si._de = si.de[1].split('=');
					if(si._de[0]=='size'){
						si._di = si._de[1].replace(/['"]/g,'').split(',');

						si.calc = __gi.isizeCalc({
							ww: si.$p.width(), wh: si.$p.height(),
							ow: si._di[0], oh: si._di[1]
						});
						si.w = si.calc.w+'px', si.h = si.calc.h+'px';
					}
				}

				// 是否为图片蒙版
				si.isrc = si.$i.attr('src');
				if(si.isrc){
					si.$i.data('giSRC', si.src).attr('data-gi-prepare',1).removeAttr('data-gi-ready');
					return true;
				}

				si.ohtml = this.outerHTML;
				si.cls = si.cls ? ` class='${si.cls}'` : '';
				si.style = ` style='width:${si.w};height:${si.h};background:${opts.bg[Math.floor(Math.random()*opts.bg.length)]}'`;


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

			let i = {$obj: $(this)};
			i.src = i.$obj.removeAttr('data-gi-prepare').data('giSRC');
			i.w = i.$obj.css('width'), i.h = i.$obj.css('height');

			__gi.iloader(i.src).then(function(){
				// 图片蒙版
				if(i.$obj[0].tagName.toLowerCase()=='img'){
					i.$obj.attr('src', i.src);__gi.ishowBind();return;
				}

				// HTML 蒙版
				let html = i.$obj.data('giHTML');
				i.$obj.ohtml(html);
				$('img[data-gi-ready]').css({
					width:i.w, height:i.h
				}).attr('src', i.src).removeAttr('data-gi-ready').addClass('gia-fadeIn');
				__gi.ishowBind();
			}, function(){
				let cls = i.$obj.addClass('gi-loading gi-failed').attr('class');
				i.$obj.ohtml(`<div class='${cls}'><a href="${i.src}" target="_blank">图片 ${i.src} 加载失败；</a></div>`);
			});
		});
	}, {passive:true});

	// 初始化
	$('img[data-gisrc]').gazeimg();



	// 暴露接口
	$.extend({
		gazeimg: {
			show: __gi.show
		}
	});
})(gQuery, window, document);