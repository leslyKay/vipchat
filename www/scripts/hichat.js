/*
 *vipchat v0.1.1
 *lesly Jul 28,2015
 *MIT license
 *view on GitHub: https://github.com/leslyKay/vipchat
 */
window.onload = function() {
    var vipchat = new VipChat();
    vipchat.init();
};
var VipChat = function() {
    this.socket = null;
};
VipChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
            /*var currentUserName = that.socket.nickname;
            //获取当前的session，用this
            if(!currentUserName){
                document.getElementById('info').textContent = '给自己一个身份：';
                document.getElementById('nickWrapper').style.display = 'block';
                document.getElementById('nicknameInput').focus();
            }else{
                //用之前已登录的socket，用that，与下方登陆的socket一致
                that.socket.emit('login', currentUserName);
            }*/
            that.socket.emit('login', '');
        });
        this.socket.on('clientLogin',function(nickname){
            if(nickname){
                document.title = 'vipchat | ' + nickname;
                document.getElementById('nicknameInput').value = nickname;
                document.getElementById('loginWrapper').style.display = 'none';
                document.getElementById('messageInput').focus();
            }else{
                document.getElementById('info').textContent = '给自己一个身份：';
                document.getElementById('nickWrapper').style.display = 'block';
                document.getElementById('nicknameInput').focus();
            }
        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '昵称已经被抢占了，换一个试试..';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });
        this.socket.on('loginSuccess', function() {
            document.title = 'vipchat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            document.getElementById('messageInput').focus();
        });
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '!连接失败 :(';
            } else {
                document.getElementById('info').textContent = '!连接失败 :(';
            }
        });
        this.socket.on('system', function(nickName, userCount, type) {
            var msg = nickName + (type == 'login' ? ' 加入聊天' : ' 离开聊天');
            var localUserName =  document.getElementById('nicknameInput').value;
            if(nickName != localUserName){
                that._displayNewMsg('系统消息', msg, 'red', true);
            }
            if(!localUserName){
                localUserName = nickName;
            }
            var str = '有 ' + userCount + (userCount > 1 ? ' 个用户同时' : ' 个用户') + '在线，欢迎回来聊天：'+localUserName;
            document.getElementById('status').textContent = str;
        });
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        }); 
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });
        //private message
        this.socket.on('private message',function(nickname, msg){
            that._displayNewMsg(nickname, msg);
        });

        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            messageInput.focus();
            if (msg.trim().length != 0) {
                that.socket.emit('postMsg', msg, color);
                //that.socket.emit('postMsg', 'lesly', msg);
                that._displayNewMsg('me', msg, color);
                return;
            };
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value,
                color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            };
        }, false);
        document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader(),
                    color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result, color);
                    that._displayImage('me', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                var emojiImg = that._showEmoji('[emoji:' + target.title + ']');
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
        //导出
        document.getElementById('exportChat').addEventListener('click',function(e){
            window.open('/exportWord');
        });
    },
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _displayNewMsg: function(user, msg, color, brFlag) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
        msgToDisplay.style.color = color || '#000';
        if (!brFlag) {
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span><br> <div class="messageBody">' + msg + '</div>';
        } else {
            msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): ' + msg + '</span>';
        }

        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan">(' + date + '): </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />'); //todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    }
};
