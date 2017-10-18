

var TimeTable = (function(){
	var TimeTable = function($ct){
		this.$ct = $ct;
		this.init();
		this.bindEvent();
	}
	//初始化变量
	TimeTable.prototype.init = function(){
		this.searchBtn = this.$ct.find('#searchBtn');
		this.startStation = this.$ct.find('#searchStart');
		this.endStation = this.$ct.find('#searchEnd');
		this.searchNum = this.$ct.find('#searchNum');
		this.getDetail = this.$ct.find('.getDetail');
		this.stationList = this.$ct.find('#station-list');
		this.trainInfo = this.$ct.find('#train-info');
		this.trainInfoTitle = this.$ct.find('.train-info-title');
		this.trainDetail = this.$ct.find('.train-detail');
		this.trainList = this.$ct.find('#train-list');
		this.isLoading = false; //设置状态锁，用于判断是否加载，防止多次点击加载按钮产生重复发起请求等问题
		this.page = 1;
		this.trainData = null;
		this.timer = null;
		this.partList = [];
	}

	// 车次查询
	TimeTable.prototype.getInfoByTrainNumber = function(){
		var _this = this;

		if(this.isLoading){
			return;
		}
		var _url = 'http://apis.juhe.cn/train/s';
		var _data = {
			name: arguments[0] || $('.container .getDetail').attr('data-number'),
			// name: arguments[0] || _this.getDetail.attr('data-number'),
			// name: arguments[0] || _this.getDetail.data('number'), 这两种写法都获取不到，暂时想不出原因！
			key:'d0c508ccf5150b0d031ea868b21b5509', //聚合API，your key
			jsonp:'jsoncallback'
		}
		this.isLoading = true;
		$.mobile.loading('show');

		$.ajax({
			url:_url,
			data:_data,
			dataType:'jsonp'
		}).success(function(res){
			var result = res.result;
			if(!result){
				alert('查不到此车次，请重新查找！');
				_this.isLoading = false;
				$.mobile.loading('hide');
				return;
			}
			var trainInfo = result.train_info;
			var stationList = result.station_list;
			_this.trainInfoTitle.text(trainInfo.name);

			$('tbody').html('');

			var html='';
			html+='<tr>'
				+'<td>'+trainInfo.name+'</td>'
				+'<td>'+trainInfo.start+'</td>'
				+'<td>'+trainInfo.end+'</td>'
				+'<td>'+trainInfo.starttime+'</td>'
				+'<td>'+trainInfo.endtime+'</td>'
				+'<td><a href="#" id="order">预订</a></td>'
				+'</tr>';
			_this.trainInfo.find('tbody').html(html);

			var arr = [];
			stationList.forEach(function(station,index){
				var html = '';
				html+='<tr><td>'+station.train_id+'</td>'
					+'<td>'+station.station_name+'</td>'
					+'<td>'+station.arrived_time+'</td>'
					+'<td>'+station.leave_time+'</td>'
					+'<td>'+station.stay+'</td>'
					+'<td><a href="#" id="order">预订</a></td></tr>';
				arr.push(html);
			})
			if(_this.trainDetail){
				_this.trainDetail.remove();
			}

			$('<h2 class="train-detail">车次详情</h2>').insertBefore(_this.stationList);

			_this.stationList.find('tbody').html(arr.join(''));

			_this.isLoading = false;
			$.mobile.loading('hide');
			$.mobile.changePage('#detail');
		})
	}

	// 站到站查询
	TimeTable.prototype.getTrainList = function(){
		var _this = this;

		if(_this.searchNum.val() || _this.startStation.val() && _this.endStation.val()){

			_this.searchBtn.buttonMarkup('disable');					
			$.mobile.loading('show');

			var url;
			var _data;
			var myKey = 'd0c508ccf5150b0d031ea868b21b5509';

			//站到站查询
			if(!_this.searchNum.val()){
				url='http://apis.juhe.cn/train/s2swithprice';

				_data = {
					start:_this.startStation.val(),
					end:_this.endStation.val(),
					key:myKey, //聚合api, your key
					jsonp:'jsoncallback'
				}

			}else{
				_this.getInfoByTrainNumber(_this.searchNum.val()); // 车次查询

			}

			_this.trainList.html('');

			$.ajax({
				url:url,
				data:_data,
				dataType:'jsonp'
			}).success(function(res){
				_this.trainData = res.result.list;
				_this.renderHtml(_this.trainData);
				$(window).scroll(function(){
					if(_this.timer){
						clearTimeout(_this.timer);
					}
					_this.timer = setTimeout(function(){
						if($(window).height() + $(window).scrollTop() === $(document).height()){
							_this.page +=1;
							if(_this.partList.length === 0){
								return;
							}
							_this.renderHtml(_this.trainData);
						}							
					},300)
				})
			})
		}
	}
	TimeTable.prototype.renderHtml = function(trainData){
				var _this = this;
				var arr = [];

				if(!trainData){
					alert('找不到，请重新输入！');
					return;
				}

				_this.partList = trainData.slice(0+(_this.page-1)*10,_this.page*10);
				if(_this.partList.length === 0){
					return;
				}
				_this.partList.forEach(function(train,index){
					var html = '';
					html+='<li><a href="#" class="getDetail" data-number="'+train.train_no+'"><h2>'+train.train_no+'</h2>'+
						'<p>'+train.start_station+'-'+train.end_station+'</p>'+
					    '<p>用时：'+train.run_time+'</p>'+
					    '<p class="ui-li-aside"><strong>'+train.start_time+' 开</strong></p></a></li>';
					arr.push(html);						
				})
		

				_this.trainList.append(arr.join(''));	

				_this.trainList.listview('refresh');
				$.mobile.loading('hide');
				_this.searchBtn.buttonMarkup('enable');
	}
	//绑定事件
	TimeTable.prototype.bindEvent = function(){
		var _this = this;

		this.searchBtn.on('click',function(){
			_this.getTrainList();
		});
		this.trainList.on('click','a',function(){
			_this.getInfoByTrainNumber();
		});


	}

	return TimeTable;
})();

// back to top component
var GoTop = (function(){

	var GoTop = function(ct,target){
	  this.ct = ct;
	  this.target = target;
	  
	  this.bindEvent();
	};

	GoTop.prototype.bindEvent = function(){
	    //滚动超过第一屏，显示“回到顶部”
	    var self = this;
	    $(window).on('scroll',function(){
	    	console.log('window');
	    	var needShow = $(window).scrollTop() > $(window).height();
	      if(needShow){
	        self.target.addClass('show');
	      }else{
	        self.target.removeClass('show');
	      }
	    });
	    //点击“回到顶部”，滚到顶部
	    this.target.on('click',function(){
	      $(window).scrollTop(0);
	    })	
	};

	return GoTop;	
})();

// $(document).on('pageinit','#index',function(){
// 	new TimeTable($('.container'));
// })	
$(document).ready(function(){
	new TimeTable($('.container'));
	new GoTop($('#page'),$('.go-top'));
	new GoTop($('#detail'),$('.go-top'));

})





