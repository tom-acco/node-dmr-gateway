# NodeJS DMR Gateway
A simple NodeJS implementation of the DMR gateway protocol for amateur radio.

## Getting Started
1. Install dependencies
```
npm i
```

2. Setup `.env` file.
```
## DMR Configuration
RADIOID="1234567"
CALLSIGN="N0CALL"
OPTIONS="TS2_1=505"

## DMR Server Details
DMR_SERVER="43.245.72.67"
DMR_PORT=55555
DMR_PASSWORD="PASSWORD"
```

3. Run
```
node .
```

### Environment Variables

#### RADIOID
DMR Radio ID obtained from [radiodid.net](https://radioid.net/) with ESSID.

#### CALLSIGN
Amateur radio callsign.

#### OPTIONS
DMR options (such as talk groups).

#### DMR_SERVER
The DMR master server IP address.

#### DMR_PORT
The DMR master server port.

#### DMR_PASSWORD
The DMR master server password. Leave blank for no password.

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

#### setLocation(latitude, longitude, height, town)
Set the location details.
```js
config.setLocation("+00.0000", "+000.0000", "0", "LOCATION");
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

#### getSequence()
Returns the sequence of the frame
```js
frame.getSequence()
```