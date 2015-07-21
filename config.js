

"use strict";

exports.debug = true;
exports.port = 3000;
exports.email = 'leslytt@126.com';
exports.site_name = 'Node vipchat';
exports.site_desc = 'Very simple chat, demo for connect Node web dev.';
exports.session_secret = 'vipchat session secret';

var db_config = {  
        host: 'localhost',  
        user: 'root',  
        password: 'root',  
        database: 'm_user'  
};  
exports.db = 'mongodb://127.0.0.1:27017/nodetest';