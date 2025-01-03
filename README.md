# NodeJS DMR Gateway
A simple NodeJS implementation of the DMR gateway protocol for amateur radio.

## Getting Started
### Install
```shell
npm i git+https://github.com/tom-acco/node-dmr-gateway.git
```

### Usage
```js
// Import the module
const DMR = require("dmr-gateway");

// Create a config
const config = new DMR.Configuration();

// Set the parameters
config.setId("123456701");
config.setCallsign("N0CALL");
config.setOptions("TS2_1=505");

// Create the socket
const socket = new DMR.Socket("43.245.72.67", 55555, null, config);

// Bind the events
socket.on("connect", () => {
    console.log("Socket connected");
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

// Connect to the master server
socket.connect().catch((err) => {
    console.error(err);
});
```

## Configuration
```js
const config = new DMR.Configuration();
```

### Methods

#### setId(radioId)
Set the radio ID and ESSID
```js
config.setId("123456701");
```

#### setCallsign(callsign)
Set the callsign.
```js
config.setCallsign("N0CALL");
```

#### setOptions(options)
Set the DMR options.
```js
config.setOptions("TS2_1=505");
```

#### setFreq(receive, transmit)
Set the receive and transmit frequencies.
```js
config.setFreq("438800000", "438800000");
```

#### setPower(txPower)
Set the transmit power.
```js
config.setPower("0");
```

#### setColourCode(colourCode)
Set the colour code.
```js
config.setColourCode("1");
```

#### setLocation(town, latitude, longitude, height)
Set the location details.
```js
config.setLocation("LOCATION");
// or
config.setLocation("LOCATION", "+00.0000", "+000.0000", "0");
```

#### setDescription(description)
Set the description.
```js
config.setDescription("DESCRIPTION");
```

#### setUrl(url)
Set the URL.
```js
config.setUrl("www.qrz.com/db/N0CALL");
```

## Socket
```js
const config = new DMR.Configuration();
const socket = new DMR.Socket("43.245.72.67", 55555, "PASSWORD", config);
```

### Methods

#### connect()
Connect to the DMR master server.
```js
socket.connect().then(() => {
    console.log("Connected");
}).catch((err) => {
    console.error(err);
});
```

#### close()
Disconnect from the DMR master server and close the socket.
```js
socket.close().then(() => {
    console.log("Disconnected");
}).catch((err) => {
    console.error(err);
});
```

### Events

#### connect
Fires when the `socket.connect()` method resolves.
```js
socket.on("connect", (client) => {
    console.log("Socket connected");
});
```

#### close
Fires when the `socket.close()` method resolves.
```js
socket.on("close", () => {
    console.log("Socket closed");
});
```

#### error
Fires on error.
```js
socket.on("error", (err) => {
    console.error(err);
});
```

#### warning
Fires on warning
```js
socket.on("warning", (warning) => {
    console.warn(warning);
});
```

#### frame
Fires when the socket receives a DMR frame
```js
socket.on("frame", (frame) => {
    console.log(`${frame.getSource()}->${frame.getDestination()}: ${frame.getSequence()}`);
});
```


## Frame

### Methods

#### getSequence()
Returns the sequence of the frame
```js
frame.getSequence()
```

#### getSource()
Returns the radio ID of the source
```js
frame.getSource()
```

#### getDestination()
Returns the destination ID (talkgroup)
```js
frame.getDestination()
```

#### getTimeSlot()
Returns the timeslot
```js
frame.getTimeSlot()
```

#### getCallType()
Returns the call type (group/private)
```js
frame.getCallType()
```

#### getFrameType()
Returns the frame type (voice, voice sync, data sync)
```js
frame.getFrameType()
```

#### getStreamId()
Returns the stream ID. A unique identifier from PTT press to PTT release
```js
frame.getStreamId()
```

#### getData()
Returns the DMR frame data.
```js
frame.getData()
```