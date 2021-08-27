import { serializeTokensObject, parseTransaction, parseTokensObject, serializeTransaction } from './models.js';
import provider from './index.js';
/**
 * @category Contract
 */
export class Contract {
    constructor(abi, address) {
        if (!Array.isArray(abi.functions)) {
            throw new Error('Invalid abi. Functions array required');
        }
        if (!Array.isArray(abi.events)) {
            throw new Error('Invalid abi. Events array required');
        }
        this._abi = JSON.stringify(abi);
        this._functions = abi.functions.reduce((functions, item) => {
            functions[item.name] = { inputs: item.inputs || [], outputs: item.outputs || [] };
            return functions;
        }, {});
        this._events = abi.events.reduce((events, item) => {
            events[item.name] = { inputs: item.inputs || [] };
            return events;
        }, {});
        this._address = address;
        class ContractMethodImpl {
            constructor(functionAbi, abi, address, method, params) {
                this.functionAbi = functionAbi;
                this.abi = abi;
                this.address = address;
                this.method = method;
                this.params = serializeTokensObject(params);
            }
            async send(args) {
                const { transaction } = await provider.rawApi.sendMessage({
                    sender: args.from.toString(),
                    recipient: this.address.toString(),
                    amount: args.amount,
                    bounce: args.bounce == null ? true : args.bounce,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params
                    }
                });
                return parseTransaction(transaction);
            }
            async estimateFees(args) {
                const { fees } = await provider.rawApi.estimateFees({
                    sender: args.from.toString(),
                    recipient: this.address.toString(),
                    amount: args.amount,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params
                    }
                });
                return fees;
            }
            async sendExternal(args) {
                let { transaction, output } = await provider.rawApi.sendExternalMessage({
                    publicKey: args.publicKey,
                    recipient: this.address.toString(),
                    stateInit: args.stateInit,
                    payload: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params
                    }
                });
                return {
                    transaction: parseTransaction(transaction),
                    output: output != null ? parseTokensObject(this.functionAbi.outputs, output) : undefined
                };
            }
            async call(args = {}) {
                let { output, code } = await provider.rawApi.runLocal({
                    address: this.address.toString(),
                    cachedState: args.cachedState,
                    functionCall: {
                        abi: this.abi,
                        method: this.method,
                        params: this.params
                    }
                });
                if (output == null || code != 0) {
                    throw new TvmException(code);
                }
                else {
                    return parseTokensObject(this.functionAbi.outputs, output);
                }
            }
        }
        this._methods = new Proxy({}, {
            get: (_object, method) => {
                const rawAbi = this._functions[method];
                return (params) => new ContractMethodImpl(rawAbi, this._abi, this._address, method, params);
            }
        });
    }
    get methods() {
        return this._methods;
    }
    get address() {
        return this._address;
    }
    get abi() {
        return this._abi;
    }
    async decodeTransaction(args) {
        try {
            const result = await provider.rawApi.decodeTransaction({
                transaction: serializeTransaction(args.transaction),
                abi: this._abi,
                method: args.methods
            });
            if (result == null) {
                return undefined;
            }
            let { method, input, output } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                input: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, input) : {},
                output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {}
            };
        }
        catch (_) {
            return undefined;
        }
    }
    async decodeTransactionEvents(args) {
        try {
            const { events } = await provider.rawApi.decodeTransactionEvents({
                transaction: serializeTransaction(args.transaction),
                abi: this._abi
            });
            const result = [];
            for (const { event, data } of events) {
                const rawAbi = this._events[event];
                result.push({
                    event,
                    data: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, data) : {}
                });
            }
            return result;
        }
        catch (_) {
            return [];
        }
    }
    async decodeInputMessage(args) {
        try {
            const result = await provider.rawApi.decodeInput({
                abi: this._abi,
                body: args.body,
                internal: args.internal,
                method: args.methods
            });
            if (result == null) {
                return undefined;
            }
            let { method, input } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                input: rawAbi.inputs != null ? parseTokensObject(rawAbi.inputs, input) : {}
            };
        }
        catch (_) {
            return undefined;
        }
    }
    async decodeOutputMessage(args) {
        try {
            const result = await provider.rawApi.decodeOutput({
                abi: this._abi,
                body: args.body,
                method: args.methods
            });
            if (result == null) {
                return undefined;
            }
            let { method, output } = result;
            const rawAbi = this._functions[method];
            return {
                method,
                output: rawAbi.outputs != null ? parseTokensObject(rawAbi.outputs, output) : {}
            };
        }
        catch (_) {
            return undefined;
        }
    }
}
/**
 * @category Contract
 */
export class TvmException extends Error {
    constructor(code) {
        super(`TvmException: ${code}`);
        this.code = code;
    }
}
