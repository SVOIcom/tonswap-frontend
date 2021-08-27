import { getUniqueId } from './utils.js';
/**
 * @category Stream
 */
export class Subscriber {
    constructor(ton) {
        this.ton = ton;
        this.subscriptions = {};
        this.scanners = {};
    }
    /**
     * Returns stream of new transactions
     */
    transactions(address) {
        return this._addSubscription('transactionsFound', address);
    }
    /**
     * Returns stream of old transactions
     */
    oldTransactions(address, filter) {
        const id = getUniqueId();
        return new StreamImpl(async (onData, onEnd) => {
            const scanner = new UnorderedTransactionsScanner(this.ton, Object.assign({ address,
                onData,
                onEnd }, filter));
            this.scanners[id] = scanner;
            await scanner.start();
        }, async () => {
            const scanner = this.scanners[id];
            delete this.scanners[id];
            if (scanner != null) {
                await scanner.stop();
            }
        }, identity);
    }
    states(address) {
        return this._addSubscription('contractStateChanged', address);
    }
    async unsubscribe() {
        const subscriptions = Object.assign({}, this.subscriptions);
        for (const address of Object.keys(this.subscriptions)) {
            delete this.subscriptions[address];
        }
        const scanners = Object.assign({}, this.scanners);
        for (const id of Object.keys(this.scanners)) {
            delete this.scanners[id];
        }
        await Promise.all(Object.values(subscriptions)
            .map(async (item) => {
            const events = Object.assign({}, item);
            for (const event of Object.keys(events)) {
                delete item[event];
            }
            await Promise.all(Object.values(events).map((eventData) => {
                if (eventData == null) {
                    return;
                }
                return eventData.subscription.then((item) => {
                    return item.unsubscribe();
                }).catch(() => {
                    // ignore
                });
            }));
        }).concat(Object.values(scanners).map((item) => item.stop())));
    }
    _addSubscription(event, address) {
        const id = getUniqueId();
        return new StreamImpl((onData, onEnd) => {
            let subscriptions = this.subscriptions[address.toString()];
            let eventData = subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions[event];
            if (eventData == null) {
                const handlers = {
                    [id]: { onData, onEnd, queue: new PromiseQueue() }
                };
                eventData = {
                    subscription: this.ton.subscribe(event, {
                        address
                    }).then((subscription) => {
                        subscription.on('data', (data) => {
                            Object.values(handlers).forEach(({ onData, queue }) => {
                                queue.enqueue(() => onData(data));
                            });
                        });
                        subscription.on('unsubscribed', () => {
                            Object.values(handlers).forEach(({ onEnd, queue }) => {
                                delete handlers[id];
                                queue.clear();
                                queue.enqueue(async () => onEnd());
                            });
                        });
                        return subscription;
                    }).catch((e) => {
                        console.error(e);
                        Object.values(handlers).forEach(({ onEnd, queue }) => {
                            delete handlers[id];
                            queue.clear();
                            queue.enqueue(() => onEnd());
                        });
                        throw e;
                    }),
                    handlers
                };
                if (subscriptions == null) {
                    subscriptions = {
                        [event]: eventData
                    };
                    this.subscriptions[address.toString()] = subscriptions;
                }
                else {
                    subscriptions[event] = eventData;
                }
            }
            else {
                eventData.handlers[id] = { onData, onEnd, queue: new PromiseQueue() };
            }
        }, () => {
            const subscriptions = this.subscriptions[address.toString()];
            if (subscriptions == null) {
                return;
            }
            const eventData = subscriptions[event];
            if (eventData != null) {
                delete eventData.handlers[id];
                if (Object.keys(eventData.handlers).length === 0) {
                    const subscription = eventData.subscription;
                    delete subscriptions[event];
                    subscription
                        .then((subscription) => subscription.unsubscribe())
                        .catch(console.debug);
                }
            }
            if (Object.keys(subscriptions).length === 0) {
                delete this.subscriptions[address.toString()];
            }
        }, identity);
    }
}
async function identity(event, handler) {
    await handler(event);
}
class StreamImpl {
    constructor(makeProducer, stopProducer, extractor) {
        this.makeProducer = makeProducer;
        this.stopProducer = stopProducer;
        this.extractor = extractor;
    }
    first() {
        return new Promise(async (resolve, reject) => {
            this.makeProducer(async (event) => {
                await this.extractor(event, (item) => {
                    this.stopProducer();
                    resolve(item);
                });
            }, () => reject(new Error('Subscription closed')));
        });
    }
    on(handler) {
        this.makeProducer(async (event) => {
            await this.extractor(event, handler);
        }, () => {
        });
    }
    merge(other) {
        return new StreamImpl(async (onEvent, onEnd) => {
            const state = {
                counter: 0
            };
            const checkEnd = () => {
                if (++state.counter == 2) {
                    onEnd();
                }
            };
            this.makeProducer(onEvent, checkEnd);
            other.makeProducer(onEvent, checkEnd);
        }, () => {
            this.stopProducer();
            other.stopProducer();
        }, this.extractor);
    }
    filter(f) {
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            if (await f(item)) {
                await handler(item);
            }
        }));
    }
    filterMap(f) {
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            const newItem = await f(item);
            if (newItem !== undefined) {
                await handler(newItem);
            }
        }));
    }
    map(f) {
        return this.filterMap(f);
    }
    flatMap(f) {
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            const items = await f(item);
            for (const newItem of items) {
                await handler(newItem);
            }
        }));
    }
    skip(n) {
        const state = {
            index: 0
        };
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            if (state.index >= n) {
                await handler(item);
            }
            else {
                ++state.index;
            }
        }));
    }
    skipWhile(f) {
        const state = {
            shouldSkip: true
        };
        return new StreamImpl(this.makeProducer, this.stopProducer, (event, handler) => this.extractor(event, async (item) => {
            if (!state.shouldSkip || !(await f(item))) {
                state.shouldSkip = false;
                await handler(item);
            }
        }));
    }
}
class UnorderedTransactionsScanner {
    constructor(ton, { address, onData, onEnd, fromLt, fromUtime }) {
        this.ton = ton;
        this.queue = new PromiseQueue();
        this.isRunning = false;
        this.address = address;
        this.onData = onData;
        this.onEnd = onEnd;
        this.fromLt = fromLt;
        this.fromUtime = fromUtime;
    }
    async start() {
        if (this.isRunning || this.promise != null) {
            return;
        }
        this.isRunning = true;
        this.promise = (async () => {
            while (this.isRunning) {
                try {
                    const { transactions, continuation } = await this.ton.getTransactions({
                        address: this.address,
                        continuation: this.continuation
                    });
                    if (!this.isRunning || transactions.length == null) {
                        break;
                    }
                    const filteredTransactions = transactions.filter((item) => ((this.fromLt == null || item.id.lt > this.fromLt) && ((this.fromUtime == null || item.createdAt > this.fromUtime))));
                    console.log('Got transactions', filteredTransactions);
                    if (filteredTransactions.length == 0) {
                        break;
                    }
                    const info = {
                        maxLt: filteredTransactions[0].id.lt,
                        minLt: filteredTransactions[filteredTransactions.length - 1].id.lt,
                        batchType: 'old'
                    };
                    this.queue.enqueue(() => this.onData({
                        address: this.address,
                        transactions: filteredTransactions,
                        info
                    }));
                    if (continuation != null) {
                        this.continuation = continuation;
                    }
                    else {
                        break;
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
            this.queue.enqueue(async () => this.onEnd());
            this.isRunning = false;
            this.continuation = undefined;
        })();
    }
    async stop() {
        this.isRunning = false;
        this.queue.clear();
        if (this.promise != null) {
            await this.promise;
        }
        else {
            this.onEnd();
        }
    }
}
class PromiseQueue {
    constructor() {
        this.queue = [];
        this.workingOnPromise = false;
    }
    enqueue(promise) {
        this.queue.push(promise);
        this._dequeue().catch(() => {
        });
    }
    clear() {
        this.queue.length = 0;
    }
    async _dequeue() {
        if (this.workingOnPromise) {
            return;
        }
        const item = this.queue.shift();
        if (!item) {
            return;
        }
        this.workingOnPromise = true;
        item()
            .then(() => {
            this.workingOnPromise = false;
            this._dequeue();
        })
            .catch(() => {
            this.workingOnPromise = false;
            this._dequeue();
        });
    }
}
