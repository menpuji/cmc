"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
class CMCServer {
    constructor(options) {
        this.isOpened = false;
        this.clientList = [];
        this.port = 8897;
        this.port_https = 8896;
        if (options) {
            this.port = options.port;
            this.port_https = options.portHttps;
        }
    }
    get IsOpened() { return this.isOpened; }
    get Port() { return this.port; }
    Open() {
        if (!this.httpSvr) {
            this.httpSvr = http.createServer();
        }
        let opt = {
            path: '/',
            serveClient: true,
            // below are engine.IO options
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false
        };
        this.server = io(this.httpSvr, opt);
        console.log("socket服务器启动成功！");
        let dir = "/extracted/fbs/certificate/";
        if (process.env.NODE_ENV == "development")
            dir = "/certificate/";
        //开启监听Https端口
        let options = {
            key: fs.readFileSync(path.normalize(process.cwd() + dir + 'ca.key')),
            cert: fs.readFileSync(path.normalize(process.cwd() + dir + 'ca.crt'))
        };
        this.httpsSvr = https.createServer(options, function (req, res) {
            res.writeHead(200);
            res.end('hello world https\n');
        });
        this.server_https = io(this.httpsSvr, opt);
        console.log("socket https服务器启动成功！");
        this.isOpened = true;
    }
    Close() {
        this.server.close();
    }
    Listen() {
        if (this.isOpened) {
            console.log("开启socket服务端监听，端口:" + this.port);
            this.server.on('connection', this.socket_connection.bind(this));
            this.server_https.on('connection', this.socket_connection.bind(this));
            if (this.port) {
                this.httpSvr.listen(this.port, "0.0.0.0");
                this.httpsSvr.listen(this.port_https, "0.0.0.0");
            }
        }
    }
    Send(msg, socket) {
        return __awaiter(this, void 0, void 0, function* () {
            // let clientList = await this.getHttpsClientList();
            // console.log(clientList);
            console.log("[" + new Date().toString() + "]当前客户端列表数目 ==>", this.clientList.length);
            socket.broadcast.compress(true).emit("server_msg_event", JSON.stringify(msg));
            //https 的消息单独通知
            for (let sck in this.server_https.sockets.sockets) {
                this.server_https.sockets.sockets[sck].emit("server_msg_event", JSON.stringify(msg));
            }
        });
    }
    SendTo(msg, socket, desSocketId, callback) {
        try {
            let sct = this.clientList.find(x => x.Socket.id === desSocketId).Socket;
            let isTimeout = false;
            let s = setTimeout(() => {
                isTimeout = true;
                callback("打印超时！请重试！");
            }, 5000);
            sct.emit("server_msg_event", JSON.stringify(msg), (err, data) => {
                if (isTimeout)
                    return;
                clearTimeout(s);
                console.log("客户端确认消息回掉函数！");
                callback(err, data);
            });
        }
        catch (error) {
            callback(error);
        }
    }
    getClientList() {
        return new Promise((resolve, reject) => {
            if (!this.server)
                reject("当前服务器没有初始化！");
            this.server.clients((error, clients) => {
                if (error)
                    reject(error);
                else {
                    resolve(clients);
                }
            });
        });
    }
    getHttpsClientList() {
        return new Promise((resolve, reject) => {
            if (!this.server_https)
                reject("当前服务器没有初始化！");
            this.server_https.clients((error, clients) => {
                if (error)
                    reject(error);
                else {
                    resolve(clients);
                }
            });
        });
    }
    printSocketList(str) {
        let count = 0;
        for (let key in this.server.sockets.sockets) {
            console.log("[" + new Date().toString() + "] " + str + " 当前socketId列表：", key);
            count++;
        }
        console.log("[" + new Date().toString() + "] " + str + "当前socket 数目：", count);
    }
    printClient(str) {
        for (let item of this.clientList) {
            console.log("[" + new Date().toString() + "] " + str + " 当前ClientList列表：", item.ClientId, item.Socket.id);
        }
        console.log("[" + new Date().toString() + "] " + str + "当前客户端列表：", this.clientList.length);
    }
    socket_connection(socket) {
        socket.on("client_join", (client, callback) => __awaiter(this, void 0, void 0, function* () {
            console.log("[" + new Date().toString() + "]客户端：[" + socket.id + "] [" + client.ClientId + "]已连接!");
            //发送回执消息
            callback && callback(true);
            client.Socket = socket;
            this.clientList.push(client);
            this.onClientConnect && this.onClientConnect(client);
        }));
        socket.on("client_msg_event", (msg, callback) => {
            this.onReceived && this.onReceived(msg, socket, callback);
        });
        socket.on('disconnect', () => {
            console.error("[" + new Date().toString() + "]客户端【" + socket.id + "】断开连接！");
            for (let i = 0; i < this.clientList.length; i++) {
                if (this.clientList[i].Socket.id == socket.id) {
                    console.log("[" + new Date().toString() + "]删除client：(client.ClientId client.Socket.id)", this.clientList[i].ClientId, this.clientList[i].Socket.id);
                    this.onClientDisconnect && this.onClientDisconnect(this.clientList[i]);
                    this.clientList.splice(i, 1);
                    //日志打印代码
                    this.printSocketList("socket.on(disconnect)");
                    //日志打印代码
                    this.printClient("socket.on(disconnect)");
                    break;
                }
            }
        });
        socket.on("error", (err, client) => {
            console.log("错误消息：", err);
            this.onError && this.onError(err, client);
        });
    }
}
exports.CMCServer = CMCServer;
//# sourceMappingURL=cmcServer.js.map