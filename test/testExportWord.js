var officegen = require('officegen');
var fs = require('fs');
var path = require('path');
var docx = officegen('docx');
var async = require('async');
var db = require('../db');

/**
 * 导出word
 */
exports.exportWord = function(req, res, nickName) {
	console.log('exportWord-------------:' + nickName);

	//每次导出前清空之前的内容
	docx.data = [];

	docx.on('finalize', function(written) {
		console.log('Finish to create Word file.\nTotal bytes created: ' + written + '\n');
	});

	docx.on('error', function(err) {
			console.log(err);
	});

	function getDateTimeFormate(date){
		return date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1)) + "-" + 
		(date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() ;
	}

	db.executeSql(' select user_name as userName, message_time as messageTime, message as message, message_type as messageType from chat_record where message_type != 3', [], function(err, results) {

		console.info(results);

		var date = new Date();
		var time = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + 
			(date.getMonth()+1) : (date.getMonth()+1)) + "-" + (date.getDate() < 10 ? '0' 
			+ date.getDate() : date.getDate()) ;

		var pObj = docx.createP({
			align: 'center'
		}); // 创建行 设置居中
		pObj.addText(nickName + ' 聊天记录', {
			bold: true,
			font_face: 'Arial',
			font_size: 18
		}); // 添加文字 设置字体样式 加粗 大小


		var pObj = docx.createP();
		pObj.addText('日期');
		pObj.addText(time, {
			color: '000088'
		}); // 设置字体颜色
		pObj.addText('讨论组 ');
		pObj.addText(' 讨论记录导出测试 ', {
			color: '00ffff',
			back: '000088'
		});
		pObj.addText('用户 ');
		pObj.addText(nickName, {
			color: '000088'
		});


		if(results){
			for(var i=0; i<results.length; i++){
				var r = results[i];
				var pObj = docx.createP();
				var user = r.userName;
				if(nickName == r.userName){
					user = '我';
				}
				pObj.addText(user);
				pObj.addText("("+getDateTimeFormate(r.messageTime)+")：",{
					color: '000088'
				});
				var pObj = docx.createP();
				pObj.addText(r.message);
				if(i == results.length - 1){
					pObj.addImage ( path.resolve('../vipchat/www/content/logo.png') );
				}
			}
		}

		/*var pObj = docx.createP();
		pObj.addText('测试1');
		var pObj = docx.createP();
		pObj.addText('二、测试2');*/


		var out = fs.createWriteStream('out.docx'); // 文件写入
		out.on('error', function(err) {
			console.log(err);
		});


		var result = docx.generate(out); // 服务端生成word


		res.writeHead(200, {

			// 注意这里的type设置，导出不同文件type值不同application/vnd.openxmlformats-officedocument.presentationml.presentation
			"Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

			'Content-disposition': 'attachment; filename=out.docx'

		});
		docx.generate(res); // 客户端导出word

	});

}