import * as io from 'socket.io-client';
export class CMCClient {
    private socket: SocketIOClient.Socket;
    private isConnect: boolean = false;
    private hostName: string;
    private port: number;
    private clientId: string;

    get IsConnect(): boolean { return this.isConnect; }
    get ClientId(): string { return this.clientId; }

    constructor(hostName: string, port: number, clientId: string) {
        this.hostName = hostName;
        this.port = port;
        this.clientId = clientId;
    }

    Connect() {
        this.socket = io(this.hostName + ":" + this.port, { secure: true });
        this.socket.on('connect', () => {
            console.log("连接服务器成功！");
            this.isConnect = true;

            this.socket.compress(true).emit("client_join", { ClientId: this.clientId }, (err) => {
                console.log("接收到服务器的连接回执消息：", err);
            });
            this.onConnect && this.onConnect();
        });
        this.socket.on('connect_error', function (data) {
            this.isConnect = false;
            console.log("连接失败", data);
        });
        this.socket.on("connect_timeout", () => {
            this.isConnect = false;
            console.log("连接超时！");
        });
        this.socket.on("reconnect", (num) => {
            this.isConnect = true;
            console.log("重连，", num);
        });
        this.socket.on("reconnect_attempt", () => {
            console.log("reconnect_attempt");
        });
        this.socket.on("reconnecting", (num) => {
            console.log("reconnecting", num);
        });
        this.socket.on("reconnect_error", (err) => {
            this.isConnect = false;
            console.log("reconnect_error", err);
        });
        this.socket.on("reconnect_failed", () => {
            this.isConnect = false;
            console.log("reconnect_failed");
        });

        this.socket.on('disconnect', function () {
            console.log("与服务器连接断开！");
            this.isConnect = false;
            this.onDisconnect && this.onDisconnect();
        });

        this.socket.on("server_msg_event", (msg, callback) => {
            //发送回执消息
            callback && callback();
            if (msg instanceof Object) {
                this.onReceive && this.onReceive(msg);
            }
            else {
                this.onReceive && this.onReceive(JSON.parse(msg));
            }
        });

        this.socket.on("error", (err) => {
            console.log("错误消息：", err);
        });
    }

    DisConnect() {
        this.isConnect = false;
        this.socket.close();
    }

    Send(msg) {
        return new Promise((resovle, reject) => {
            if (this.isConnect) {
                this.socket.compress(false).emit("client_msg_event", msg, (err) => {
                    if (err) reject(err);
                    else resovle();
                });
            }
            else reject("服务器未连接");
        });
    }
    onReceive: (msg) => void;
    onConnect: () => void;
    onDisconnect: () => void;
}