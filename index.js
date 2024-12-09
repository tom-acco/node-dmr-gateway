require("dotenv").config();

const DMR = require("./classes/DMRGateway");

const config = new DMR.Configuration();
config.setId(process.env.RADIOID);
config.setCallsign(process.env.CALLSIGN);
config.setOptions(process.env.OPTIONS);

const dmr_server = (process.env.DMR_SERVER ? process.env.DMR_SERVER : "43.245.72.67");
const dmr_port = (process.env.DMR_PORT ? process.env.DMR_PORT : 55555);
const dmr_password = (process.env.DMR_PASSWORD ? process.env.DMR_PASSWORD : null);

const socket = new DMR.Socket(dmr_server, dmr_port, dmr_password, config);

if(process.env.DEBUG === "true"){
    socket.debug = true;
}

socket.on("close", () => {
    console.log("Socket closed");
});

socket.on("error", (error) => {
    console.error(error);
});

socket.on("warning", (warning) => {
    console.warn(warning);
});

socket.on("frame", (frame) => {
    console.log(`${frame.getSource()}->${frame.getDestination()}: ${frame.getSequence()}`);
});

socket.connect().then(() => {
    console.log("Connected to server");
}).catch((err) => {
    console.error(err);
});