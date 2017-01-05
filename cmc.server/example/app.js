"use strict";
var cmcServer_1 = require("./../cmcServer");
var svr = new cmcServer_1.CMCServer();
svr.Open();
svr.Listen();
try {
    svr.Send("likecheng#1", "hello likecheng#1 this is cmc server!");
}
catch (error) {
    console.log(error);
}
