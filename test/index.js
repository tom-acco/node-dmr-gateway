const DMR = require("../src/DMRGateway");

const config = new DMR.Configuration();

if(!process.argv[2] || !process.argv[3]){
    return console.error("Incorrect command line args. Usage: node test <radioid+essid> <callsign>");
}

const radioId = process.argv[2];
const callsign = process.argv[3];

config.setId(radioId);
config.setCallsign(callsign);
config.setOptions("TS2_1=505");

const socket = new DMR.Socket("43.245.72.67", 55555, null, config);

socket.debug = true;

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
    console.log(`${frame.getStreamId()}//${frame.getSource()}->${frame.getDestination()}: ${frame.getSequence()}`);
});

socket.connect().then(() => {
    console.log("Connected to server");
}).catch((err) => {
    console.error(err);
});