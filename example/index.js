const DMR = require("dmr-gateway");

const config = new DMR.Configuration();
config.setId("123456701");
config.setCallsign("N0CALL");
config.setOptions("TS2_1=505");

const socket = new DMR.Socket("43.245.72.67", 55555, null, config);

socket.on("connect", (client) => {
    console.log(`Socket connected`);
});

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

socket.connect().catch((err) => {
    console.error(err);
});