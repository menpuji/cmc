"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cmcServer_1 = require("./../cmcServer");
const svr = new cmcServer_1.CMCServer();
svr.Open();
svr.Listen();
try {
    // svr.Send("likecheng#1", "hello likecheng#1 this is cmc server!");
}
catch (error) {
    console.log(error);
}
//# sourceMappingURL=app.js.map