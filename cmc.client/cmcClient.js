"use strict";
var io = require("socket.io-client");
var CMCClient = (function () {
    function CMCClient(hostName, port, clientId) {
        this.isConnect = false;
        this.hostName = hostName;
        this.port = port;
        this.clientId = clientId;
    }
    Object.defineProperty(CMCClient.prototype, "IsConnect", {
        get: function () { return this.isConnect; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CMCClient.prototype, "ClientId", {
        get: function () { return this.clientId; },
        enumerable: true,
        configurable: true
    });
    CMCClient.prototype.Connect = function () {
        var _this = this;
        this.socket = io(this.hostName + ":" + this.port);
        this.socket.on('connect', function () {
            console.log("连接服务器成功！");
            _this.isConnect = true;
            _this.socket.compress(true).emit("client_join", { ClientId: _this.clientId });
            _this.onConnect && _this.onConnect();
        });
        this.socket.on('connect_error', function (data) {
            console.log("连接失败", data);
        });
<<<<<<< HEAD
        this.socket.on("connect_timeout", function () {
            console.log("连接超时！");
        });
        this.socket.on("reconnect", function (num) {
            console.log("重连，", num);
        });
        this.socket.on("reconnect_attempt", function () {
            console.log("reconnect_attempt");
        });
        this.socket.on("reconnecting", function (num) {
            console.log("reconnecting", num);
        });
        this.socket.on("reconnect_error", function (err) {
            console.log("reconnect_error", err);
        });
        this.socket.on("reconnect_failed", function () {
            console.log("reconnect_failed");
        });
=======
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
        this.socket.on('disconnect', function () {
            console.log("与服务器连接断开！");
            this.onDisconnect && this.onDisconnect();
        });
        this.socket.on("server_msg_event", function (msg) {
            _this.onReceive && _this.onReceive(JSON.parse(msg));
        });
<<<<<<< HEAD
        this.socket.on("error", function (err) {
            console.log("错误消息：", err);
        });
=======
>>>>>>> 5331c3c7abf891f320e7fa7ee781c243758d615a
    };
    CMCClient.prototype.DisConnect = function () {
        this.isConnect = false;
        this.socket.close();
    };
    CMCClient.prototype.Send = function (msg) {
        if (this.isConnect) {
            this.socket.compress(false).emit("client_msg_event", msg);
        }
    };
    return CMCClient;
}());
exports.CMCClient = CMCClient;
