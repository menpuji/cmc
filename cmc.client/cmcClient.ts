import io = require("socket.io-client");
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
        this.socket = io(this.hostName + ":" + this.port);
        this.socket.on('connect', () => {
            console.log("连接服务器成功！");
            this.isConnect = true;

            this.socket.compress(true).emit("client_join", { ClientId: this.clientId });
            this.onConnect && this.onConnect();
        });
        this.socket.on('connect_error', function (data) {
            console.log("连接失败", data);
        });
        this.socket.on('disconnect', function () {
            console.log("与服务器连接断开！");
            this.onDisconnect && this.onDisconnect();
        });

        this.socket.on("server_msg_event", msg => { 
            this.onReceive && this.onReceive(JSON.parse(msg));
        });
    }

    DisConnect() {
        this.isConnect = false;
        this.socket.close();
    }

    Send(msg) {
        if (this.isConnect) {
            this.socket.compress(false).emit("client_msg_event", msg);
        }
    }
    onReceive: (msg) => void;
    onConnect: () => void;
    onDisconnect: () => void;
}