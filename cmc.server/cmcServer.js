"use strict";
<<<<<<< HEAD
const io = require("socket.io");
const http = require("http");
class CMCServer {
    constructor(options) {
=======
var io = require("socket.io");
var http = require('http');
var CMCServer = (function () {
    function CMCServer(options) {
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
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
<<<<<<< HEAD
    get IsOpened() { return this.isOpened; }
    get Port() { return this.port; }
    Open() {
=======
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
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
        if (!this.httpSvr) {
            this.httpSvr = http.createServer();
        }
        this.server = io(this.httpSvr);
        this.isOpened = true;
        console.log("socket服务器启动成功！");
<<<<<<< HEAD
    }
    Close() {
        this.server.close();
    }
    Listen() {
        if (this.isOpened) {
            console.log("开启socket服务端监听，端口:" + this.port);
            this.server.on('connection', socket => {
                socket.on("client_join", (client) => {
                    console.log("[" + new Date().toString() + "]客户端：[" + socket.id + "] [" + client.ClientId + "]已连接!");
                    for (let i = 0; i < this.clientList.length; i++) {
                        if (this.clientList[i].ClientId == client.ClientId) {
                            this.clientList[i].Socket.disconnect(true);
                            this.clientList.splice(i, 1);
                        }
                    }
                    client.Socket = socket;
                    this.clientList.push(client);
                    console.log("当前客户端列表：", this.clientList.length);
                    this.onClientConnect && this.onClientConnect(client);
                });
                socket.on("client_msg_event", msg => {
                    console.log("[" + new Date().toString() + "]client_msg_event=>", msg);
                    let sender;
                    for (let item of this.clientList) {
=======
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
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
                        if (socket.id == item.Socket.id) {
                            sender = { ClientId: item.ClientId };
                            break;
                        }
                    }
<<<<<<< HEAD
                    this.onReceived && this.onReceived(msg, sender);
                });
                socket.on('disconnect', () => {
                    console.log("[" + new Date().toString() + "]客户端【" + socket.id + "】断开连接！");
                    for (let i = 0; i < this.clientList.length; i++) {
                        if (this.clientList[i].Socket.id == socket.id) {
                            this.clientList.splice(i, 1);
=======
                    _this.onReceived && _this.onReceived(msg, sender);
                });
                socket.on('disconnect', function () {
                    console.log("[" + new Date().toString() + "]客户端【" + socket.id + "】断开连接！");
                    for (var i = 0; i < _this.clientList.length; i++) {
                        if (_this.clientList[i].Socket.id == socket.id) {
                            _this.clientList.splice(i, 1);
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
                            break;
                        }
                    }
                });
<<<<<<< HEAD
                socket.on("error", (err, client) => {
                    console.log("错误消息：", err);
                    this.onError && this.onError(err, client);
=======
                socket.on("error", function (err, client) {
                    console.log("错误消息：", err);
                    _this.onError && _this.onError(err, client);
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
                });
            });
            if (this.port) {
                this.httpSvr.listen(this.port);
            }
        }
<<<<<<< HEAD
    }
    Send(clientId, msg) {
        console.log("[" + new Date().toString() + "]目的 clientId", clientId);
        console.log("[" + new Date().toString() + "]send msg:", msg);
        let has = false;
        for (let item of this.clientList) {
            console.log("[" + new Date().toString() + "]当前客户端列表：", item.ClientId);
=======
    };
    CMCServer.prototype.Send = function (clientId, msg) {
        console.log("[" + new Date().toString() + "]send clientId", clientId);
        console.log("[" + new Date().toString() + "]send msg:", msg);
        var has = false;
        for (var _i = 0, _a = this.clientList; _i < _a.length; _i++) {
            var item = _a[_i];
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
            if (item.ClientId == clientId) {
                item.Socket.compress(true).emit("server_msg_event", JSON.stringify(msg));
                has = true;
                break;
            }
        }
<<<<<<< HEAD
        if (!has) {
            console.log("发送失败，客户端[" + clientId + "]未连接！");
        }
    }
}
=======
        if (!has)
            throw "发送失败，客户端[" + clientId + "]未连接！";
    };
    return CMCServer;
}());
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
exports.CMCServer = CMCServer;
