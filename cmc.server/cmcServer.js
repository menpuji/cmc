"use strict";
const io = require("socket.io");
const http = require("http");
class CMCServer {
    constructor(options) {
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
    get IsOpened() { return this.isOpened; }
    get Port() { return this.port; }
    Open() {
        if (!this.httpSvr) {
            this.httpSvr = http.createServer();
        }
        this.server = io(this.httpSvr);
        this.isOpened = true;
        console.log("socket服务器启动成功！");
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
                        if (socket.id == item.Socket.id) {
                            sender = { ClientId: item.ClientId };
                            break;
                        }
                    }
                    this.onReceived && this.onReceived(msg, sender);
                });
                socket.on('disconnect', () => {
                    console.log("[" + new Date().toString() + "]客户端【" + socket.id + "】断开连接！");
                    for (let i = 0; i < this.clientList.length; i++) {
                        if (this.clientList[i].Socket.id == socket.id) {
                            this.clientList.splice(i, 1);
                            break;
                        }
                    }
                });
                socket.on("error", (err, client) => {
                    console.log("错误消息：", err);
                    this.onError && this.onError(err, client);
                });
            });
            if (this.port) {
                this.httpSvr.listen(this.port);
            }
        }
    }
    Send(clientId, msg) {
        console.log("[" + new Date().toString() + "]目的 clientId", clientId);
        console.log("[" + new Date().toString() + "]send msg:", msg);
        let has = false;
        for (let item of this.clientList) {
            console.log("[" + new Date().toString() + "]当前客户端列表：", item.ClientId);
            if (item.ClientId == clientId) {
                item.Socket.compress(true).emit("server_msg_event", JSON.stringify(msg));
                has = true;
                break;
            }
        }
        if (!has) {
            console.log("发送失败，客户端[" + clientId + "]未连接！");
        }
    }
}
exports.CMCServer = CMCServer;
