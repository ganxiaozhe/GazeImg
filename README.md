# GazeImg

#### 介绍

该插件由 Ganxiaozhe 开发，除图片锚点外，另支持 H5 蒙版锚点；支持 Ajax/Fetch 等动态加载；支持图片灯箱。GazeImg 自 1.2.0 起使用 `IntersectionObserver` 而非 `onScroll`。

Website: [https://www.gquery.cn/plugins/gazeimg/](https://www.gquery.cn/plugins/gazeimg/)


#### 安装教程

GazeImg.js 依赖 gQuery v1.4.7 及以上版本。
需引入以下文件：（请勿在开发环境下使用压缩版本，否则将失去错误相关警告!）
```html
<link type="text/css" rel="stylesheet" href="gazeimg.gquery.css">

<script type="text/javascript" src="gquery.min.js"></script>
<script type="text/javascript" src="gazeimg.gquery.min.js"></script>
```

#### 使用说明

GazeImg.js 通过 $.fn.extend 将其方法拓展进 gQuery 原型链，你可以直接通过 gQuery 选择器对单个或多个图片元素进行绑定。对于静态页面，只需引入相关文件即可，在初始化时 GazeImg 会自动检测整个页面中的相关元素。

静态使用只需要为图片加上 data-gisrc 属性，在页面引入文件后将自动解析：
```html
<img data-gisrc='/lib/img/icon.png' />
```


对于没有 src 属性的元素，GazeImg 将默认使用 H5 蒙版。所以，若要自定义锚点图片，只需将图片地址填入 src 属性即可：
```html
<img data-gisrc='/lib/img/icon.png' src='mask.png' />
```

同时，若要为放大查看的图片绑定 GazeImg 灯箱，添加属性 data-gishow 即可：
```html
<img data-gisrc='/lib/img/icon.png' data-gishow />
```


若要单独使用 GazeImg 灯箱，调用 `$.gazeimg.show(images:Array [, index:Number])`：
```javascript
var imgs = ['/lib/img/pay/alipay.jpg', '/lib/img/pay/wechat.jpg', '404.png'];
$.gazeimg.show(imgs, 1);
```


对于动态添加的图片，在输出至 DOM 流后执行以下语句即可：
```javascript
$('img[data-gisrc]').gazeimg();
```


此外，gazeimg 方法支持以下参数：
```html
{
    // 字符串；H5 蒙版的 class，若无将继承 img 元素
    class: 'gl-img',

    // 数组；H5 蒙版的背景色
    bg: ['#000', '#333', '#666', '#999'],
}
```


#### License

[GPLv3](https://www.gnu.org/licenses/gpl-3.0.txt)

Licensed GPLv3 for open source use 
or GazeImg Commercial License for commercial use

Copyright (c) 2020-present, JU Chengren (Ganxiaozhe)
