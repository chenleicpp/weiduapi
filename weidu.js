var superagent = require('superagent');
var charset = require('superagent-charset');
charset(superagent);
var cheerio = require('cheerio');
var express = require('express');
var app = express();
var url = require('url');

var BASE_URL = 'http://www.100weidu.com/';
var sucCode = 1,failCode = 0;

function isEmpty(obj){
    if (typeof(obj) == "undefined" || (!obj && typeof(obj)!="undefined" && obj!=0)) {
        return true;
    }
    for (var i in obj){
        return false;
    }
    return true;
}

function Trim(str){ 
    return str.replace(/(^\s*)|(\s*$)/g, ""); 
}

app.get('/',function(req,res){
	res.send('weidu api');
});

app.get('/tags',function(req,res){
	res.header('Content-Type','application/json;charset=utf-8');
	superagent.get(BASE_URL)
	.charset('utf-8')
	.end(function(error,result){
		if(error){
			console.log("ERR:" + error);
			return next(error);
		}
		var $ = cheerio.load(result.text);
		var items = [];
		var all = $('.container .nsb-aside .company-aside .cell tr td a');
		var output = all.slice(1,all.length-5);
		output.each(function(idx,element){
			var item = $(element);
			var hrefStr = item.attr('href');
			var param;
			if (hrefStr.indexOf('category') > 0) {
				param = hrefStr.split('/')[2];
			}else{
				param = hrefStr.split('/')[1];
			}
			items.push({
				detailurl:item.attr('href'),
				param:param,
				type:item.text()
			});
		});
		res.json({code: sucCode, msg: "成功", data:items});
	})
});
/*http://localhost:3000/category?detailurl=art&page=2*/
app.get('/category',function(req,res){
	var detailurl = req.query.detailurl;
	var page = req.query.page;
	var temp;
	page = !isEmpty(page) ? page : '1';
	detailurl = !isEmpty(detailurl) ? detailurl : '/greatest';
	/*除了第一个greatest不用加category，其他的都需要加*/
	if (detailurl == 'greatest') {
		temp = detailurl + '?page=' + page;
	}else{
		temp = '/category/' + detailurl + '?page=' + page;
	}
	var requestUrl = url.resolve(BASE_URL,temp);
	console.log(requestUrl);
	res.header('Content-Type',"application/json;charset=utf-8");
	superagent.get(requestUrl)
	.charset('utf-8')
	.end(function(error,result){
		var items = [];
		if (error) {
			console.log("ERR:" + error);
			return res.json({code: failCode, msg: "失败", data:items});
		}
		var $ = cheerio.load(result.text);
		//console.log($('.container .nsb-content-main #topics_index .cell tr').find('td').length);
		$('.container .nsb-content-main #topics_index .cell tr').each(function(idx,element){
			var item = $(element);
			var avatar = item.find('.avatar');
			var other = item.find('td').eq(1);
			//avatarurl:console.log(avatar.find('a').eq(1).find('img').attr('src'));
			//title:console.log(Trim(other.find('a').text()));
			//detailurl:console.log(url.resolve(BASE_URL,other.find('a').attr('href')));
			//author:console.log(other.find('strong .dark').text());
			//type:console.log(other.find('strong .node').text());
			items.push({
				avatarurl:avatar.find('a').eq(1).find('img').attr('src'),
				title:Trim(other.find('a').text()),
				detailurl:url.resolve(BASE_URL,other.find('a').attr('href')),
				author:other.find('strong .dark').text(),
				type:other.find('strong .node').text()
			});
		});
		res.json({code: sucCode, msg: "成功", data:items});
	});
});

app.get('/topics',function(req,res){
	var p = req.query.p;
	p = !isEmpty(p) ? p : '1';
	var realUrl = BASE_URL + '?page=' + p;
	res.header('Content-Type',"application/json;charset=utf-8");
	superagent.get(realUrl)
	.charset('utf-8')
	.end(function(error,result){
		if (error) {
			console.log("ERR:" + error);
			return next(error);
		}
		var $ = cheerio.load(result.text);
		var items = [];
		//console.log($('.container .nsb-content-main #topics_index .cell tr').find('td').length);
		$('.container .nsb-content-main #topics_index .cell tr').each(function(idx,element){
			var item = $(element);
			var avatar = item.find('.avatar');
			var other = item.find('td').eq(1);
			//avatarurl:console.log(avatar.find('a').eq(1).find('img').attr('src'));
			//title:console.log(Trim(other.find('a').text()));
			//detailurl:console.log(url.resolve(BASE_URL,other.find('a').attr('href')));
			//author:console.log(other.find('strong .dark').text());
			//type:console.log(other.find('strong .node').text());
			items.push({
				avatarurl:avatar.find('a').eq(1).find('img').attr('src'),
				title:Trim(other.find('a').text()),
				detailurl:url.resolve(BASE_URL,other.find('a').attr('href')),
				author:other.find('strong .dark').text(),
				type:other.find('strong .node').text()
			});
		});
		res.json({code: sucCode, msg: "成功", data:items});
	})
})

app.listen('3000',function(req,res){
	console.log('3000 port is listening...');
});