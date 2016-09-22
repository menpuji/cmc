"use strict";
var io = require("socket.io");
var http = require('http');
var CMCServer = (function () {
    function CMCServer(options) {
        this.isOpened = false;
        this.clientList = [];
        this.port = 5050;
        if (options) {
            if (options.server) {
                this.httpSvr = options.server;
            }
            this.port = options.port;
        }
    }
    Object.defineProperty(CMCServer.prototype, "IsOpened", {
        get: function () { return this.isOpened; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CMCServer.prototype, "Port", {
        get: function () { return this.port; },
        enumerable: true,
        configurable: true
    });
    CMCServer.prototype.Open = function () {
        if (!this.httpSvr) {
            this.httpSvr = http.createServer();
        }
        this.server = io(this.httpSvr);
        this.isOpened = true;
        console.log("socket服务器启动成功！");
    };
    CMCServer.prototype.Close = function () {
        this.server.close();
    };
    CMCServer.prototype.Listen = function () {
        var _this = this;
        if (this.isOpened) {
            console.log("开启socket服务端监听，端口:" + this.port);
            this.server.on('connection', function (socket) {
                socket.on("client_join", function (client) {
                    console.log("[" + new Date().toString() + "]客户端：[" + socket.id + "] [" + client.ClientId + "]已连接!");
                    for (var i = 0; i < _this.clientList.length; i++) {
                        if (_this.clientList[i].ClientId == client.ClientId) {
                            _this.clientList[i].Socket.disconnect(true);
                            _this.clientList.splice(i, 1);
                        }
                    }
                    client.Socket = socket;
                    _this.clientList.push(client);
                    _this.onClientConnect && _this.onClientConnect(client);
                });
                socket.on("client_msg_event", function (msg) {
                    console.log("[" + new Date().toString() + "]client_msg_event=>", msg);
                    var sender;
                    for (var _i = 0, _a = _this.clientList; _i < _a.length; _i++) {
                        var item = _a[_i];
                        if (socket.id == item.Socket.id) {
                            sender = { ClientId: item.ClientId };
                            break;
                        }
                    }
                    _this.onReceived && _this.onReceived(msg, sender);
                });
                socket.on('disconnect', function () {
                    console.log("[" + new Date().toString() + "]客户端【" + socket.id + "】断开连接！");
                    for (var i = 0; i < _this.clientList.length; i++) {
                        if (_this.clientList[i].Socket.id == socket.id) {
                            _this.clientList.splice(i, 1);
                            break;
                        }
                    }
                });
                socket.on("error", function (err, client) {
                    console.log("错误消息：", err);
                    _this.onError && _this.onError(err, client);
                });
            });
            if (this.port) {
                this.httpSvr.listen(this.port);
            }
        }
    };
    CMCServer.prototype.Send = function (clientId, msg) {
        console.log("[" + new Date().toString() + "]send clientId", clientId);
        console.log("[" + new Date().toString() + "]send msg:", msg);
        var has = false;
        for (var _i = 0, _a = this.clientList; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item.ClientId == clientId) {
                item.Socket.compress(true).emit("server_msg_event", JSON.stringify(msg));
                has = true;
                break;
            }
        }
        if (!has)
            throw "发送失败，客户端[" + clientId + "]未连接！";
    };
    return CMCServer;
}());
exports.CMCServer = CMCServer;
