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
                socket.on("client_join", (client: CMCClient) => {
                    console.log("客户端：[" + socket.id + "] [" + client.ClientId + "]已连接!");
                    let hasClient = false;
                    for (let item of this.clientList) {
                        if (item.ClientId == client.ClientId)
                            hasClient = true;
                        break
                    }
                    if (!hasClient) {
                        client.Socket = socket;
                        this.clientList.push(client);
                        this.onClientConnect && this.onClientConnect(client);
                    }
                    else {
                        //如果已经存在客户端连接强制关闭新的连接
                        socket.disconnect(true);
                    }
                });

                socket.on("client_msg_event", msg => {
                    console.log("client_msg_event=>" , msg);
                    let sender;
                    for (let item of this.clientList) {
                        if (socket.id == item.Socket.id)
                            sender = { ClientId: item.ClientId };
                        break;
                    }
                    this.onReceived && this.onReceived(msg, sender);
                });

                socket.on('disconnect', () => {
                    console.log("客户端【" + socket.id + "】断开连接！");
                    for (let i = 0; i < this.clientList.length; i++) {
                        if (this.clientList[i].Socket.id == socket.id)
                            this.clientList.splice(i, 1);
                        break
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
        for (let item of this.clientList) {
            if (item.ClientId == clientId) {
                item.Socket.compress(true).emit("server_msg_event", JSON.stringify(msg));
            }
        }
    }
    onReceived: (msg, sender) => void;
    onClientDisconnect: (sender: { ClientId: string }) => void;
    onClientConnect: (client: CMCClient) => void;
    onError: (err, client) => void;
}

interface CMCClient {
    ClientId: any;
    Socket: SocketIO.Socket;
}

interface InitOptions {
    port?: number;
    server?: http.Server;
}