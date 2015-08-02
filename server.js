 var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    sessionIo = require('session.io'),
    users = [];
 
//Setup cookie and session handlers
//Note: for sessionStore you can use any sessionStore module that has the .load() function
//but I personally use the module 'sessionstore' to handle my sessionStores.
var cookieParser = express.cookieParser('vipchat_secret');
var sessionStore = require('sessionstore').createSessionStore();

/**
 * 私人聊天使用session
 */
var usersWS = [];

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  //...truncate...//
  app.use(cookieParser);
  //make sure to use the same secret as you specified in your cookieParser
  app.use(express.session({secret: 'vipchat_secret', store: sessionStore}));
  app.use(app.router);
});

//specify the html we will use
app.use('/',   express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000);//publish to heroku

//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//console.log('server started on port'+process.env.PORT || 3000);

server.listen(app.get('port'), function(){
  console.log('Listening on port ' + app.get('port'));
});

io.configure(function(){
  //use session.io to get our session data
  io.set('authorization', sessionIo(cookieParser, sessionStore));

});

//handle the socket
io.sockets.on('connection', function(socket) {
    var session = socket.handshake.session;
    if(session){
        console.log("sessionId : " + session.id);
    }else{
        console.log("session is null");
    }
    //根据socket id 获取用户信息
    var user = {};
    
    function setUser(){
        for(var i in usersWS){
            if(usersWS[i].sessionId == session.id){
                user = usersWS[i];
            }
        }
    }
    //new user login
    socket.on('login', function(nickname) {

            //检查sessionid是否存在数组
            var flag = false;
            var currentUser={};
            for(var os in usersWS){
                if(usersWS[os].sessionId == session.id){
                    flag = true;
                    currentUser = usersWS[os];
                }
            }

            if(!nickname){
                socket.emit('clientLogin',currentUser.nickname);
                if(flag){
                    currentUser.socketList.push(socket);
                    io.sockets.emit('system', currentUser.nickname, usersWS.length, 'login');
                }
                return ;
            }
            if(users.indexOf(nickname) > -1){ //登陆过的
                socket.emit('nickExisted');
                return ;
            }

            if(!flag){ //第一次登陆
                    //todo 找出该session的nickname传到前台
                    socket.userIndex = users.length;
                    users.push(nickname);

                    var obj = {};
                    obj.sessionId = session.id;
                    obj.nickname = nickname;
                    obj.socketList = [];
                    obj.socketList.push(socket);
                    usersWS.push(obj);
                    socket.emit('loginSuccess');
                    io.sockets.emit('system', nickname, usersWS.length, 'login');
            }
            
    });
    //user leaves
    socket.on('disconnect', function() {
        //users.splice(socket.userIndex, 1);
        setUser();
        var socketList = user.socketList;
        if(socketList){
            for(var i=0; i<socketList.length; i++){
                if(socketList[i].id == socket.id){
                    socketList.splice(i,1);
                }
            }
        }
        socket.broadcast.emit('system', user.nickname, usersWS.length, 'logout');
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        setUser();
        socket.broadcast.emit('newMsg', user.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        setUser();
        socket.broadcast.emit('newImg', user.nickname, imgData, color);
    });

    //私人@信息
    socket.on('private message',function(to, msg){
        var target;
        for(obj in usersWS){
            if(to == obj.nickname){
                target = obj.socket;
                break;
            }
        }
        if (target) {
            target.broadcast.emit('newImg', name+'[私信]', msg);
        }else {
            socket.broadcast.emit('message error', to, msg);
        }
    });

});