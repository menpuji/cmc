"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const cmcClient_1 = require('../cmcClient');
const client = new cmcClient_1.CMCClient("http://172.16.254.127", 5050, "likecheng#1");
client.Connect();
function main() {
    client.onConnect = () => __awaiter(this, void 0, void 0, function* () {
        yield client.Send("hello cmc server!");
        yield client.Send("this is second message!");
        client.onReceive = (msg) => {
            console.log("this is the message from cmc server:", msg);
        };
    });
}
main();
//# sourceMappingURL=app.js.map