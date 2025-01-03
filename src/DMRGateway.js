const dgram = require("node:dgram");
const EventEmitter = require("node:events");

const crypto = require("crypto");

const utils = require("./utils");
const c = require("./colours");

exports.Configuration = class Configuration {
    constructor(){
        this.radioId = null;
        this.callsign = null;
        this.options = null;

        this.freqRx = "438800000";
        this.freqTx = "438800000";
        this.txPower = "0";
        this.colourCode = "1";
        this.latitude = "+00.0000";
        this.longitude = "+000.0000";
        this.height = "0";
        this.location = "";
        this.description = "";
        this.url = null;
    }

    setId(radioId){
        const buf = Buffer.alloc(4);
        buf.writeUInt32BE(radioId);

        this.radioId = buf.readUint32BE();
    }

    setCallsign(callsign){
        this.callsign = Buffer.from(callsign).subarray(0, 8).toString("ascii");
        
        if(this.url == null){
            this.url = `www.qrz.com/db/${this.callsign}`;
        }
    }

    setOptions(options){
        this.options = options;
    }

    setFreq(receive, transmit){
        this.freqRx = receive;
        this.freqTx = transmit;
    }

    setPower(txPower){
        this.txPower = txPower;
    }

    setColourCode(colourCode){
        this.colourCode = colourCode;
    }

    setLocation(town, latitude, longitude, height){
        this.location = town.substring(0, 20);

        if(latitude){
            this.latitude = latitude;
        }

        if(longitude){
            this.longitude = longitude;
        }

        if(height){
            this.height = height;
        }
    }

    setDescription(description){
        this.description = description.substring(0, 20);
    }

    setUrl(url){
        this.url = url.substring(0, 124);
    }
}

exports.Socket = class Socket extends EventEmitter {
    constructor(ip, port, password, config){
        super();
        
        // Implements /docs/DMRplus_IPSC_Protocol_for_HB_repeater.pdf

        // Constructor params
        this.ip = ip;
        this.port = port;
        this.password = password;
        this.config = config;

        // Debug
        this.debug = false;

        // UDP Socket
        this.udpClient = new dgram.createSocket("udp4");
        this.udpClient.on("message", this.udpMessageHandler);

        // State
        this.packetAckd = false;
        this.lastPacket = null;
        this.pingCount = 0;
        this.lastPong = null;
        this.pingInterval = null;

        // Message handlers
        this.messageHandlers = {
            "RPTACK": (buffer) => {
                if(this.debug === true){
                    console.debug(c.FgGray, `${new Date().toISOString()} Received RPTACK`, c.Reset);
                }
        
                this.packetAckd = true;
                this.lastPacket = buffer;
            },
            "MSTPONG": (buffer) => {
                if(this.debug === true){
                    console.debug(c.FgGray, `${new Date().toISOString()} Received MSTPONG`, c.Reset);
                }

                this.lastPong = utils.getEpoch();
            },
            "DMRD": (buffer) => {
                if(this.debug === true){
                    console.debug(c.FgGray, `${new Date().toISOString()} Received DMRD`, c.Reset);
                }

                const frame = new DMRDataFrame(buffer);
                this.emit("frame", frame);
            }
        }
    }

    udpMessageHandler = (buffer, info) => {
        // Emit the raw buffer
        this.emit("data", buffer, info);

        for(const handler of Object.keys(this.messageHandlers)){
            const packetTypeIndex = buffer.indexOf(Buffer.from(handler));

            if(packetTypeIndex > -1){
                this.messageHandlers[handler](buffer);
                return;
            }
        }

        if(this.debug === true){
            console.debug(c.FgGray, `${new Date().toISOString()} UNHANDLED PACKET`, c.Reset);
            console.debug(buffer.toString("hex"));
        }
    }

    connect = () => {
        return new Promise(async (resolve, reject) => {
            if(!this.config.radioId){
                return reject("Missing radio ID!");
            }

            if(!this.config.callsign){
                return reject("Missing callsign!");
            }

            if(!this.udpClient){
                // UDP Socket
                this.udpClient = new dgram.createSocket("udp4");
                this.udpClient.on("message", this.udpMessageHandler);
            }

            await this.sendRPTL();

            if(this.password){
                await this.sendRPTK();
            }

            await this.sendRPTC();

            if(this.config.options){
                await this.sendRPTO();
            }else{
                this.emit("warning", "No options have been set. The server may not receive any data.");
            }

            this.pingInterval = setInterval(() => {
                if(this.lastPong && utils.getEpoch() - this.lastPong > 60){
                    this.emit("warning", "Socket has not received a reply for over 60 seconds. Closing the connection.");
                    this.close();
                }else if(!this.lastPong && this.pingCount >= 5){
                    this.emit("warning", "Sent 5 pings and did not receive a reply. Closing the connection.");
                    this.close();
                }else{
                    this.sendRPTPING();
                }
            }, 5000);

            this.emit("connect", this.udpClient);
            
            return resolve(true);
        });
    }

    close = () => {
        return new Promise((resolve, reject) => {
            const packetType = Buffer.from("RPTCL");
            
            const radioId = Buffer.alloc(4);
            radioId.writeUInt32BE(this.config.radioId);

            const buf = Buffer.concat([packetType, radioId]);

            if(this.debug === true){
                console.debug(c.FgGray, `${new Date().toISOString()} Sending RPTCL`, c.Reset);
            }

            if(this.pingInterval){
                clearInterval(this.pingInterval);
                this.lastPong = null;
            }

            this.udpClient.send(buf, this.port, this.ip, async (err) => {
                if(err){
                    return reject(err);
                }

                //Wait for packet ack
                let count = 0;
                while(this.packetAckd == false && count <= 10){
                    await utils.sleep(100);
                    count++;
                }

                this.packetAckd = false;

                // Close the dgram
                this.udpClient.close();

                // Remove the listener
                this.udpClient.removeListener("message", this.udpMessageHandler);

                // Clear the udpClient for next connect
                this.udpClient = null;

                this.emit("close");
    
                return resolve(true);
            });
        });
    }

    sendRPTL = () => {
        // Login
        return new Promise((resolve, reject) => {
            const packetType = Buffer.from("RPTL");

            const radioId = Buffer.alloc(4);
            radioId.writeUInt32BE(this.config.radioId);

            const buf = Buffer.concat([packetType, radioId]);
    
            if(this.debug === true){
                console.debug(c.FgGray, `${new Date().toISOString()} Sending RPTL`, c.Reset);
            }
            
            this.udpClient.send(buf, this.port, this.ip, async (err) => {
                if(err){
                    return reject(err);
                }

                //Wait for packet ack
                while(this.packetAckd == false){
                    await utils.sleep(100);
                }

                this.packetAckd = false;
    
                return resolve(true);
            });
        });
    }

    sendRPTK = () => {
        return new Promise((resolve, reject) => {
            const packetType = Buffer.from("RPTK");

            const radioId = Buffer.alloc(4);
            radioId.writeUInt32BE(this.config.radioId);

            const randomSecret = this.lastPacket.subarray(-4);
            const password = Buffer.concat([randomSecret, Buffer.from(this.password)]);
            const data = crypto.createHash("sha256").update(password).digest();

            const buf = Buffer.concat([packetType, radioId, data]);

            if(this.debug === true){
                console.debug(c.FgGray, `${new Date().toISOString()} Sending RPTK`, c.Reset);
            }

            this.udpClient.send(buf, this.port, this.ip, async (err) => {
                if(err){
                    return reject(err);
                }

                //Wait for packet ack
                while(this.packetAckd == false){
                    await utils.sleep(100);
                }

                this.packetAckd = false;
    
                return resolve(true);
            });
        });
    }

    sendRPTC = () => {
        return new Promise((resolve, reject) => {
            const packetType = Buffer.from("RPTC");

            const radioId = Buffer.alloc(4);
            radioId.writeUInt32BE(this.config.radioId);

            const callsign = Buffer.alloc(8);
            callsign.write(this.config.callsign);

            const freqRx = Buffer.from(this.config.freqRx.padEnd(9, "0"));
            const freqTx = Buffer.from(this.config.freqTx.padEnd(9, "0"));
            const txPower = Buffer.from(this.config.txPower.padStart(2, "0"));
            const colourCode = Buffer.from(this.config.colourCode.padStart(2, "0"));
            const latitude = Buffer.from(this.config.latitude.padEnd(8, "0"));
            const longitude = Buffer.from(this.config.longitude.padEnd(9, "0"));
            const height = Buffer.from(this.config.height.padEnd(3, "0"));
            const location = Buffer.from(this.config.location.padEnd(20, " "));
            const description = Buffer.from(this.config.description.padEnd(20, " "));
            const url = Buffer.from(this.config.url.padEnd(124, " "));
            
            const softwareId = Buffer.alloc(40);
            softwareId.write("node-dmr-gateway");

            const packageId = Buffer.alloc(40);
            packageId.write(require("../package.json").version);

            const buf = Buffer.concat([
                packetType,
                radioId,
                callsign,
                freqRx,
                freqTx,
                txPower,
                colourCode,
                latitude,
                longitude,
                height,
                location,
                description,
                url,
                softwareId,
                packageId
            ]);
    
            if(this.debug === true){
                console.debug(c.FgGray, `${new Date().toISOString()} Sending RPTC`, c.Reset);
            }

            this.udpClient.send(buf, this.port, this.ip, async (err) => {
                if(err){
                    return reject(err);
                }

                //Wait for packet ack
                while(this.packetAckd == false){
                    await utils.sleep(100);
                }

                this.packetAckd = false;
    
                return resolve(true);
            });
        });
    }

    sendRPTO = () => {
        return new Promise((resolve, reject) => {
            const packetType = Buffer.from("RPTO");

            const radioId = Buffer.alloc(4);
            radioId.writeUInt32BE(this.config.radioId);

            const data = Buffer.from(this.config.options);

            const buf = Buffer.concat([packetType, radioId, data]);

            if(this.debug === true){
                console.debug(c.FgGray, `${new Date().toISOString()} Sending RPTO`, c.Reset);
            }

            this.udpClient.send(buf, this.port, this.ip, async (err) => {
                if(err){
                    return reject(err);
                }

                //Wait for packet ack
                while(this.packetAckd == false){
                    await utils.sleep(100);
                }

                this.packetAckd = false;
    
                return resolve(true);
            });
        });
    }

    sendRPTPING = () => {
        return new Promise((resolve, reject) => {
            this.pingCount++;

            const packetType = Buffer.from("RPTPING");
            
            const radioId = Buffer.alloc(4);
            radioId.writeUInt32BE(this.config.radioId);

            const buf = Buffer.concat([packetType, radioId]);

            if(this.debug === true){
                console.debug(c.FgGray, `${new Date().toISOString()} Sending RPTPING`, c.Reset);
            }

            this.udpClient.send(buf, this.port, this.ip, async (err) => {
                if(err){
                    return reject(err);
                }
    
                return resolve(true);
            });
        });
    }
}

class DMRDataFrame {
    constructor(buffer){
        const buf = new utils.BufferReader(buffer);

        this.data = {
            signature: buf.toString("utf8", 4),
            sequence: buf.readUInt8(),
            sourceId: parseInt("0x" + buf.slice(3).toString("hex")),
            destId: parseInt("0x" + buf.slice(3).toString("hex")),
            radioId: buf.readUInt32BE(),
            details: this._readDMRDDetails(buf.slice(1)),
            streamId: buf.slice(4),
            data: this._readDMRDData(buf.slice(33))
        }
    }

    _readDMRDDetails = (buffer) => {
        const data = {
            ts: utils.readBit(7, buffer),
            ctype: utils.readBit(6, buffer),
            ftype: `${utils.readBit(4, buffer)}${utils.readBit(5, buffer)}`
        }
    
        // 0 for slot 1, 1 for slot 2.
        if(data.ts == 1){
            data.ts = 2;
        }else{
            data.ts = 1;
        }
    
        // 0 for group call, 1 for unit to unit.
        if(data.ctype == 0){
            data.ctype = "group"
        }else{
            data.ctype = "private"
        }
    
        if(data.ftype == "00"){
            data.ftype = "voice";
        }else if(data.ftype == "01"){
            data.ftype = "voice sync";
        }else if(data.ftype == "10"){
            data.ftype = "data sync";
        }else{
            data.ftype = null;
        }
    
        return data;
    }

    _readDMRDData = (buffer) => {
        // TODO: Extract audio from this?
        return buffer;
    }

    getSequence(){
        return this.data.sequence;
    }

    getSource(){
        return this.data.sourceId;
    }

    getDestination(){
        return this.data.destId;
    }

    getTimeSlot(){
        return this.data.details.ts;
    }

    getCallType(){
        return this.data.details.ctype;
    }

    getFrameType(){
        return this.data.details.ftype;
    }

    getStreamId(){
        return this.data.streamId.toString("hex");
    }

    getData(){
        return this.data.data;
    }
}