export const TRACER = `
{
    simResult: null,
    lookupAccount: function(addr, db) {
        var acc = toHex(addr);
        if (this.simResult.stateDiff[acc] === undefined) {
            this.simResult.stateDiff[acc] = {
                balance: {
                    "*": {
                        from: "0x0",
                        to: "0x" + db.getBalance(addr).toString(16)
                    }
                },
                code: toHex(db.getCode(addr)),
                storage: {}
            };
        }
    },
    lookupStorage: function(addr, key, db) {
        var acc = toHex(addr);
        var idx = toHex(key);
        if (this.simResult.stateDiff[acc] === undefined) {
            this.lookupAccount(addr, db);
        }
        if (this.simResult.stateDiff[acc].storage[idx] === undefined) {
            this.simResult.stateDiff[acc].storage[idx] = {
                "*": {
                    from: toHex(db.getState(addr, key)),
                    to: "something"
                },
                _info: {
                    originalAddr: addr,
                    originalKey: key
                }
            };
        }
    },
    result: function(ctx, db) {
        if (this.simResult === null) {
            this.simResult = {
                trace: [{}],
                stateDiff: {}
            };
        }
        this.lookupAccount(ctx.to, db);
        this.lookupAccount(ctx.from, db);
        var fromBal = bigInt(this.simResult.stateDiff[toHex(ctx.from)].balance["*"].to.slice(2), 16);
        var toBal = bigInt(this.simResult.stateDiff[toHex(ctx.to)].balance["*"].to.slice(2), 16);
        this.simResult.stateDiff[toHex(ctx.to)].balance["*"].from = "0x" + toBal.subtract(ctx.value).toString(16);
        this.simResult.stateDiff[toHex(ctx.from)].balance["*"].from = "0x" + fromBal.add(ctx.value).add(ctx.gasUsed * ctx.gasPrice).toString(16);

        for (var acc in this.simResult.stateDiff) {
            for (var idx in this.simResult.stateDiff[acc].storage) {
                var originalAddr = this.simResult.stateDiff[acc].storage[idx]._info.originalAddr;
                var originalKey = this.simResult.stateDiff[acc].storage[idx]._info.originalKey;
                this.simResult.stateDiff[acc].storage[idx]["*"].to = toHex(db.getState(originalAddr, originalKey));
            }
        }
        if (ctx.type == "CREATE") {
            delete this.simResult.stateDiff[toHex(ctx.to)];
        }
        return this.simResult;
    },
    step: function(log, db) {
        if (this.simResult === null) {
            this.simResult = {
                trace: [{}],
                stateDiff: {}
            };
            this.lookupAccount(log.contract.getAddress(), db);
        }
        switch (log.op.toString()) {
            case "EXTCODECOPY":
            case "EXTCODESIZE":
            case "EXTCODEHASH":
            case "BALANCE":
                this.lookupAccount(toAddress(log.stack.peek(0).toString(16)), db);
                break;
            case "CREATE":
                var from = log.contract.getAddress();
                this.lookupAccount(toContract(from, db.getNonce(from)), db);
                break;
            case "CREATE2":
                var from = log.contract.getAddress();
                var offset = log.stack.peek(1).valueOf();
                var size = log.stack.peek(2).valueOf();
                var end = offset + size;
                this.lookupAccount(toContract2(from, log.stack.peek(3).toString(16), log.memory.slice(offset, end)), db);
                break;
            case "CALL":
            case "CALLCODE":
            case "DELEGATECALL":
            case "STATICCALL":
                this.lookupAccount(toAddress(log.stack.peek(1).toString(16)), db);
                break;
            case "SSTORE":
            case "SLOAD":
                this.lookupStorage(log.contract.getAddress(), toWord(log.stack.peek(0).toString(16)), db);
                break;
        }
    },
    fault: function(log, db) {}
}
`
