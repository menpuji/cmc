import io = require("socket.io");
import http = require('http');

export class CMCServer {
    private isOpened: boolean = false;
    private server: SocketIO.Server;
    private httpSvr: http.Server;
    private clientList: CMCClient[] = [];
    private port: number = 5050;
    constructor(options?: InitOptions) {
        if (options) {
            if (options.server) {
                this.httpSvr = options.server;
            }
            this.port = options.port;
        }
    }
    get IsOpened(): boolean { return this.isOpened; }
    get Port(): number { return this.port; }
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
                socket.on("client_join", (client: CMCClient, callback) => {
                    console.log("[" + new Date().toString() + "]客户端：[" + socket.id + "] [" + client.ClientId + "]已连接!");
                    //发送回执消息
                    callback && callback(true);
                    for (let i = 0; i < this.clientList.length; i++) {
                        let item = this.clientList[i];
                        if (item.ClientId == client.ClientId && item.Socket.id != socket.id) {
                            //true?  disconnect()会触发 disconnect event
                            // 有重复的客户端连接也不删除，给每个通道发信息。
                            //this.clientList[i].Socket.disconnect();
                        }
                    }

                    client.Socket = socket;
                    this.clientList.push(client);

                    //日志打印代码
                    this.printSocketList("socket.on(client_join");
                    //日志打印代码
                    this.printClient("socket.on(client_join");

                    this.onClientConnect && this.onClientConnect(client);
                });

                socket.on("client_msg_event", (msg, callback) => {
                    console.log("[" + new Date().toString() + "]client_msg_event=>", msg);
                    callback && callback();
                    let sender = this.clientList.find(x => x.Socket.id == socket.id);
                    this.onReceived && this.onReceived(msg, sender);
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
            });
            if (this.port) {
                this.httpSvr.listen(this.port, "0.0.0.0");
            }
        }
    }
    Send(clientId, msg) {
        console.log("[" + new Date().toString() + "] Send(clientId, msg) ==> msg/clientId:", msg, clientId);
        console.log("[" + new Date().toString() + "]当前客户端列表数目 ==>", this.clientList.length);

        return new Promise((resolve, reject) => {
            let clientItem = this.clientList.find(x => x.ClientId == clientId);
            if (clientItem)
                clientItem.Socket.compress(true).emit("server_msg_event", JSON.stringify(msg), (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            else reject("发送失败，客户端[" + clientId + "]未连接！");
        });
    }
    onReceived: (msg, sender) => void;
    onClientDisconnect: (sender: { ClientId: string }) => void;
    onClientConnect: (client: CMCClient) => void;
    onError: (err, client) => void;

    private printSocketList(str?: string) {
        let count = 0;
        for (let key in this.server.sockets.sockets) {
            console.log("[" + new Date().toString() + "] " + str + " 当前socketId列表：", key);
            count++;
        }
        console.log("[" + new Date().toString() + "] " + str + "当前socket 数目：", count);
    }
    private printClient(str?: string) {
        for (let item of this.clientList) {
            console.log("[" + new Date().toString() + "] " + str + " 当前ClientList列表：", item.ClientId, item.Socket.id);
        }
        console.log("[" + new Date().toString() + "] " + str + "当前客户端列表：", this.clientList.length);
    }
}

interface CMCClient {
    ClientId: any;
    Socket: SocketIO.Socket;
}

interface InitOptions {
    port?: number;
    server?: http.Server;
}