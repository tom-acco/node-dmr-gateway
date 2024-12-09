exports.BufferReader = class BufferReader {
    constructor(buffer){
        this.cursor = 0;
        this.buffer = buffer;
        this.length = buffer.length;
    }

    tell(){
        return this.cursor;
    }

    seek(offset){
        this.cursor = offset;
        return this;
    }

    slice(length){
        let end;

        if(length === undefined){
            end = this.length;
        }else{
            end = this.cursor + length;
        }

        const b = this.buffer.subarray(this.cursor, end);
        this.seek(end);
        return b;
    }

    toString(encoding, length){
        let end;

        if(!encoding){
            encoding = "utf8";
        }

        if(length === undefined){
            end = this.length;
        }else{
            end = this.cursor + length;
        }

        const b = this.buffer.subarray(this.cursor, end).toString(encoding);
        this.seek(end);
        return b;
    }

    readUTF32LE = (length) => {
        let result = '';
    
        for (let i = 0; i < length; i += 4) {
            result += String.fromCodePoint(this.buffer.readInt32LE(this.cursor + i));
        }
    
        this.seek(this.cursor + length);

        return result;
    }

    readUInt8(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readUInt8(start);
        this.seek(start + 1);
        return b;
    }

    readInt8(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readInt8(start);
        this.seek(start + 1);
        return b;
    }

    readInt16BE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readInt16BE(start);
        this.seek(start + 2);
        return b;
    }

    readInt16LE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readInt16LE(start);
        this.seek(start + 2);
        return b;
    }

    readUInt16BE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readUInt16BE(start);
        this.seek(start + 2);
        return b;
    }

    readUInt16LE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readUInt16LE(start);
        this.seek(start + 2);
        return b;
    }

    readUInt32LE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readUInt32LE(start);
        this.seek(start + 4);
        return b;
    }

    readUInt32BE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readUInt32BE(start);
        this.seek(start + 4);
        return b;
    }

    readInt32LE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readInt32LE(start);
        this.seek(start + 4);
        return b;
    }

    readInt32BE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readInt32BE(start);
        this.seek(start + 4);
        return b;
    }

    readFloatBE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readFloatBE(start);
        this.seek(start + 4);
        return b;
    }

    readFloatLE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readFloatLE(start);
        this.seek(start + 4);
        return b;
    }

    readDoubleBE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readDoubleBE(start);
        this.seek(start + 8);
        return b;
    }

    readDoubleLE(offset){
        let start;

        if(offset === undefined){
            start = this.cursor;
        }else{
            start = offset;
        }

        const b = this.buffer.readDoubleLE(start);
        this.seek(start + 8);
        return b;
    }
}

exports.readBit = (bitIndex, buffer) => {
    const paddedBin = BigInt("0x" + buffer.toString("hex")).toString(2).padStart(buffer.length * 8, "0");
    return paddedBin.substring(bitIndex, bitIndex + 1);
}

exports.hexUInt32BE = (value) => {
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(value);
    return buf.toString("hex");
}

exports.sleep = (ms) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve(true)
        }, ms);
    })
}

exports.getEpoch = () => {
    return Math.floor(new Date().getTime() / 1000);
}