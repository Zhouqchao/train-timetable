# train-timetable

### 实现功能：

**目前网页界面简洁，功能比较单一。实现了基本的查询功能，例如，站到站查询，车次查询。**

### 技能点：

使用了**jQuery**和**jQuery Mobile**，数据接口采用了[聚合数据平台](https://www.juhe.cn/docs/s/q/12306%E7%81%AB%E8%BD%A6%E7%A5%A8%E6%9F%A5%E8%AF%A2)的api(返回xml/json格式数据)，
使用了jQuery的`jsonp`方式获取数据(普通json获取方式在这里获取会报跨域错误)。

其中，**站到站查询采用了只发起一次请求，获取所有数据的方法，然后配合滚动条`scroll`事件，按需分批加载。**
请求到的结果以**ul列表形式**放在查询按钮的下面。
然后，点击列表中的每一项，都会发起第二次请求，即**车次查询**，车次查询的结果会以**responsive table layout形式**
展示在`#detail`页面，这里借鉴了**css-tricks**网站上的方法：[Responsive Data Table Roundup](https://css-tricks.com/responsive-data-table-roundup/)


### 简单记录敲键盘过程
首先，首页默认展示`#index`页面，页面提供站到站查询和车次查询。站到站查询的结果将会以ul列表的形式展示在查询按钮的下方。初次加载10条数据，然后
当拖动滚动条滚动到页面底部时，则加载下一个10条数据。

这个地方有一点不同于普通的滚动lazyload实现方式：
一般我们会在请求时向后端发送`page,length`等querystring附带在url中，待滚动事件出发时改变`page,length`值，
再次发起下一个请求。
但是，由于聚合数据平台api没有提供这种接口，甚至只能用jquery获取jsonp的方式才能得到json数据，所以我自己做了一个小变动。
即，先在对象实例上绑定一个trainData变量：`this.trainData = null;` 然后在第一次发起站到站请求成功后，便将服务端返回来的数据
保存在trainData中，后期再使用erHtml()函数配合数组的`.slice()`方法进行截取部分数据，每次截取10条，append到ul列表中。接着在`$(window).scroll()`事件中
再次更新page值，并调用renderHtml()函数进行处理。
**简单来说，一般lazyload会发起多次请求，每次加载一小段数据，
而我这里使用的是只发起一次请求，先获取所有数据，然后再逐步加载。**

然后，站到站搜索得到的ul列表中，每一个li都可以点击，点击后会**接着进行车次查询**，然后跳转到`#detail`页面，结果将以responsive table layout展示在
页面。
由于之前多次尝试使用jQuery Mobile内置的responsive table widget无效，后来**google+stackoverflow**，终于在[css-tricks](https://css-tricks.com/responsive-data-table-roundup/)上找到了我想要的，于是便
借来先用一下。

此外，查询功能和返回顶部功能**使用了IIFE，配合构造函数和原型对象进行了简单的封装**，由于目前app功能简单，文件体积较小，所以没有使用模块化和构建工具处理。
后期，如果功能增加，再逐步优化。

### 截图展示

<div style="text-align:center;width:50%;margin:0 auto;">
<img src="https://github.com/Zhouqchao/train-timetable/blob/master/images/search.jpg" width = "300" height = "auto" alt="search"  />
<p>搜索页</p>
<img src="https://github.com/Zhouqchao/train-timetable/blob/master/images/searchList.jpg" width = "300" height = "auto" alt="searchList"/>
<p>搜索结果</p>
<img src="https://github.com/Zhouqchao/train-timetable/blob/master/images/detail.jpg" width = "300" height = "auto" alt="detail" />
<p>车次详情</p>
</div>

### 关于选择jQuery Mobile：

本来以为jQuery Mobile配合jQuery一起使用会很方便高效，结果，在使用jQuery Mobile的过程中，因为遇到了几个小问题，反而花了不少时间。比如说，jQuery和
jQuery Mobile版本冲突的问题，jQuery Mobile的bug问题。下面简单列一下在使用jQuery Mobile过程中遇到的问题：

+ 动态添加DOM至ul列表，结果.listview('refresh')无效，.listview().listview('refresh')同样无效。
+ 动态添加table row(thead/tbody,tr,td)至table表格，结果.table('refresh')无效，.table().table('refresh')同样无效，$('table').trigger('create')同样无效。
+ 动态添加table row至table表格，导致第二次及以后从主页进入表格页面，table reflow效果错乱，即thead表头时有时无，体验很差。
+ 另外，个人感觉JQM做出来的网页界面比较简洁朴素，不如bootstrap设计出来的界面看着舒服。

总之，这是我第一次使用jQuery Mobile，体验不是太好，不过我还是希望jQuery Mobile也能像jQuery一样一直火下去。

### 打算：

后期打算使用bootstrap重做界面ui,然后逐步丰富功能。

最后附上项目链接：[火车时刻表查询App](http://zhouqichao.com/train-timetable/)
