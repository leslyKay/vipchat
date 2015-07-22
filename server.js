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
var usersWS = {};

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  //...truncate...//
  app.use(cookieParser);
  //make sure to use the same secret as you specified in your cookieParser
  app.use(express.session({secret: 'vipchat_secret', store: sessionStore}));
  app.use(app.router);
});

//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
//server.listen(3000);//for local test
//server.listen(process.env.PORT || 3000);//publish to heroku
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
    var sessionId = session.id;
    usersWS[sessionId] = socket;
    if(session){
        console.log("sessionId : " + sessionId);
    }else{
        console.log("session is null");
    }
   
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //user leaves
    socket.on('disconnect', function() {
        users.splice(socket.userIndex, 1);
        socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });

    //私人@信息
    socket.on('private message',function(to, msg, fn){
        var target = usersWS[to];
        if (target) {
            target.broadcast.emit('private message', name+'[私信]', msg);
        }
        else {
            socket.broadcast.emit('message error', to, msg);
        }
    });

});