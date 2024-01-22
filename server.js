import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';
import { WebSocketServer } from 'ws';
import { Server } from 'node-osc';
import path from 'path';
import fs from 'fs';

const obs = new OBSWebSocket();
const wss = new WebSocketServer({ port: 7969 });
let recording = false;

var oscServer = new Server(7000, '0.0.0.0', () => {
  console.log('OSC Server is listening');
});

let addrArr = [];
let skelObj = {};

oscServer.on('message', function (msg) {
    let msgAddr = msg[0];
    msg.shift(1);

    if(addrArr.indexOf(msgAddr) < 0){
        addrArr.push(msgAddr);
        skelObj[msgAddr] = {pos: [msg]};
    } else{
        if(recording){
            skelObj[msgAddr].pos.push(msg);
        }
    }
});


wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    record(recording);
    recording = !recording;
  });

});


// connect to obs-websocket running on localhost with same port
try{

    await obs.connect();
    console.log('connected.');
} catch(err){
    console.log(err);
}

function writeFile(){
    // https://stackoverflow.com/questions/4929258/javascript-get-date-in-format
    const today = new Date();

    let base = path.resolve(path.dirname(''));
    console.log(base);

    const strDate = 'Y_m_d_t'
  .replace('Y', today.getFullYear())
  .replace('m', today.getMonth()+1)
  .replace('d', today.getDate())
  .replace('d', today.getDate())
  .replace('t', `${today.getHours()}${today.getMinutes()}${today.getSeconds()}`);

    let dir = `${base}/recordings/GS_${strDate}`;
    // write the directory.
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    // Write the file.
    let writeFile = path.resolve(`${dir}/skeleton.json`);
    fs.writeFileSync(writeFile, JSON.stringify(skelObj));

    //move videos into directory.
    let vidDir = path.resolve('C:\\Users\\gperc\\Videos\\');
    setTimeout(() =>{
        fs.readdir(vidDir, (err, files) => {
            if(!err);
            for(let i = 0; i <= 1; i++){
                let file = `${vidDir}/${files[i]}`;
                if(!file.endsWith('mp4')) return;
                fs.rename(path.resolve(file), path.resolve(`${dir}/${files[i]}`), (err) => {
                    if(err) throw err;
                    console.log('moved!');
                });
            }
        });
    }, 1000);
}

async function record(_record){
    if(!_record){
        console.log('start record');
        await obs.call('StartRecord');
    }else{

        if(addrArr.length){
            writeFile();
            skelObj = {};
            addrArr = [];
        }

        console.log('stop record');
        await obs.call('StopRecord');
    }
}
