import { CMCServer } from './../cmcServer';
const svr = new CMCServer();
svr.Open();
svr.Listen();
try {
    // svr.Send("likecheng#1", "hello likecheng#1 this is cmc server!");
} catch (error) {
    console.log(error);
}

