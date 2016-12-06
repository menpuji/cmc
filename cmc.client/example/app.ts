import { CMCClient } from '../cmcClient';
const client = new CMCClient("http://172.16.254.127", 5050, "likecheng#1");
client.Connect();


function main() {
    client.onConnect = async () => {
        await client.Send("hello cmc server!");
        await client.Send("this is second message!");
        client.onReceive = (msg) => {
            console.log("this is the message from cmc server:", msg);
        }
    }
}

main();