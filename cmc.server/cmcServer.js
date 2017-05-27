"use strict";
var io = require("socket.io");
var http = require("http");
var https = require("https");
var fs = require("fs");
var path = require("path");
var CMCServer = (function () {
    function CMCServer(options) {
        this.isOpened = false;
        this.clientList = [];
        this.port = 8897;
        this.port_https = 8896;
        if (options) {
            this.port = options.port;
            this.port_https = options.portHttps;
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
        console.log("socket服务器启动成功！");
        var dir = "/extracted/fbs/certificate/";
        if (process.env.NODE_ENV == "development")
            dir = "/certificate/";
        //开启监听Https端口
        var options = {
            key: fs.readFileSync(path.normalize(process.cwd() + dir + 'ca.key')),
            cert: fs.readFileSync(path.normalize(process.cwd() + dir + 'ca.crt'))
        };
        this.httpsSvr = https.createServer(options, function (req, res) {
            res.writeHead(200);
            res.end('hello world https\n');
        });
        this.server_https = io(this.httpsSvr);
        console.log("socket https服务器启动成功！");
        this.isOpened = true;
    };
    CMCServer.prototype.Close = function () {
        this.server.close();
    };
    CMCServer.prototype.Listen = function () {
        if (this.isOpened) {
            console.log("开启socket服务端监听，端口:" + this.port);
            this.server.on('connection', this.socket_connection.bind(this));
            this.server_https.on('connection', this.socket_connection.bind(this));
            if (this.port) {
                this.httpSvr.listen(this.port, "0.0.0.0");
                this.httpsSvr.listen(this.port_https, "0.0.0.0");
            }
        }
    };
    CMCServer.prototype.Send = function (clientId, msg) {
        var _this = this;
        console.log("[" + new Date().toString() + "] Send(clientId, msg) ==> msg/clientId:", msg);
        console.log("[" + new Date().toString() + "]当前客户端列表数目 ==>", this.clientList.length);
        return new Promise(function (resolve, reject) {
            var clientItem = _this.clientList.find(function (x) { return x.ClientId == clientId; });
            if (clientItem)
                clientItem.Socket.compress(true).emit("server_msg_event", JSON.stringify(msg), function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            else
                reject("发送失败，客户端[" + clientId + "]未连接！");
        });
    };
    CMCServer.prototype.printSocketList = function (str) {
        var count = 0;
        for (var key in this.server.sockets.sockets) {
            console.log("[" + new Date().toString() + "] " + str + " 当前socketId列表：", key);
            count++;
        }
        console.log("[" + new Date().toString() + "] " + str + "当前socket 数目：", count);
    };
    CMCServer.prototype.printClient = function (str) {
        for (var _i = 0, _a = this.clientList; _i < _a.length; _i++) {
            var item = _a[_i];
            console.log("[" + new Date().toString() + "] " + str + " 当前ClientList列表：", item.ClientId, item.Socket.id);
        }
        console.log("[" + new Date().toString() + "] " + str + "当前客户端列表：", this.clientList.length);
    };
    CMCServer.prototype.socket_connection = function (socket) {
        var _this = this;
        socket.on("client_join", function (client, callback) {
            console.log("[" + new Date().toString() + "]客户端：[" + socket.id + "] [" + client.ClientId + "]已连接!");
            //发送回执消息
            callback && callback(true);
            // for (let i = 0; i < this.clientList.length; i++) {
            //     let item = this.clientList[i];
            //     if (item.ClientId == client.ClientId && item.Socket.id != socket.id) {
            //         //true?  disconnect()会触发 disconnect event
            //         // 有重复的客户端连接也不删除，给每个通道发信息。
            //         //this.clientList[i].Socket.disconnect();
            //     }
            // }
            client.Socket = socket;
            _this.clientList.push(client);
            //日志打印代码
            //this.printSocketList("socket.on(client_join");
            //日志打印代码
            //this.printClient("socket.on(client_join");
            _this.onClientConnect && _this.onClientConnect(client);
        });
        socket.on("client_msg_event", function (msg, callback) {
            //console.log("[" + new Date().toString() + "]client_msg_event=>", msg);
            callback && callback();
            var sender = _this.clientList.find(function (x) { return x.Socket.id == socket.id; });
            _this.onReceived && _this.onReceived(msg, sender);
        });
        socket.on('disconnect', function () {
            console.error("[" + new Date().toString() + "]客户端【" + socket.id + "】断开连接！");
            for (var i = 0; i < _this.clientList.length; i++) {
                if (_this.clientList[i].Socket.id == socket.id) {
                    console.log("[" + new Date().toString() + "]删除client：(client.ClientId client.Socket.id)", _this.clientList[i].ClientId, _this.clientList[i].Socket.id);
                    _this.onClientDisconnect && _this.onClientDisconnect(_this.clientList[i]);
                    _this.clientList.splice(i, 1);
                    //日志打印代码
                    _this.printSocketList("socket.on(disconnect)");
                    //日志打印代码
                    _this.printClient("socket.on(disconnect)");
                    break;
                }
            }
        });
        socket.on("error", function (err, client) {
            console.log("错误消息：", err);
            _this.onError && _this.onError(err, client);
        });
    };
    return CMCServer;
}());
exports.CMCServer = CMCServer;
