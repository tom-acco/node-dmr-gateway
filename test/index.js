const DMR = require("../src/DMRGateway");

const config = new DMR.Configuration();

if(!process.argv[2] || !process.argv[3]){
    return console.error("Incorrect command line args. Usage: node test <radioid+essid> <callsign>");
}

process.on("SIGINT", m => {
    handleStop();
});

process.on("SIGTERM", m => {
    handleStop();
});

const handleStop = async () => {
    if(socket){
        await socket.close();
    }

    setTimeout(function(){
        process.exit();
    }, 100);
}

const radioId = process.argv[2];
const callsign = process.argv[3];

config.setId(radioId);
config.setCallsign(callsign);
config.setOptions("TS2_1=505");

const socket = new DMR.Socket("127.0.0.1", 62031, "passw0rd", config);

socket.debug = true;

socket.on("connect", (client) => {
    console.log(`Socket connected`);
});

socket.on("close", () => {
    console.log("Socket closed");

    setTimeout(() => {
        console.log("Reconnecting...");

        socket.connect();
    }, 2000);
});

socket.on("error", (error) => {
    console.error(error);
});

socket.on("warning", (warning) => {
    console.warn(warning);
});

socket.on("frame", (frame) => {
    console.log(`${frame.getStreamId()}//${frame.getSource()}->${frame.getDestination()}: ${frame.getSequence()} [${frame.getFrameType()}]`);
    console.log(`${frame.getData().toString("hex")}`);
});

socket.connect().then(() => {

}).catch((err) => {
    console.error(err);
});