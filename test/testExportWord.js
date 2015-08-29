var officegen = require('officegen');
var fs = require('fs');
var path = require('path');
var docx = officegen('docx');
var async = require('async');

/**
 * 导出word
 */
exports.exportWord = function(req, res, nickName) {
	console.log('exportWord-------------:'+nickName);

	//每次导出前清空之前的内容
	docx.data = [];

	docx.on('finalize', function(written) {
		console.log('Finish to create Word file.\nTotal bytes created: ' + written + '\n');
	});


	docx.on('error', function(err) {
		console.log(err);
	});

	var pObj = docx.createP({
		align: 'center'
	}); // 创建行 设置居中
	pObj.addText('聊天记录', {
		bold: true,
		font_face: 'Arial',
		font_size: 18
	}); // 添加文字 设置字体样式 加粗 大小


	var pObj = docx.createP();
	pObj.addText('日期');
	pObj.addText(' 20150829', {
		color: '000088'
	}); // 设置字体颜色
	pObj.addText('讨论组');
	pObj.addText('讨论记录导出测试', {
		color: '00ffff',
		back: '000088'
	});
	pObj.addText('用户');
	pObj.addText('lesly', {
		color: '000088'
	});




	var pObj = docx.createP();
	pObj.addText('一、测试1');
	var pObj = docx.createP();
	pObj.addText('二、测试2');


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

}