const nats = require('nats');
const errorsFactory = require('./errors');
let errors;
module.exports = (params = {}) => {
    const Port = params.parent;
    class Nats extends Port {
        constructor(params = {}) {
            super(params);
            this.config = this.merge(
                // default
                {
                    id: 'nats',
                    logLevel: 'debug',
                    requestOptions: {
                        timeout: 60000
                    }
                },
                // custom
                params.config,
                // immutable
                {
                    type: 'nats',
                    requestOptions: {
                        max: 1
                    },
                    options: {
                        json: true
                    }
                }
            );
            this.api = {};
            if (!errors) {
                errors = errorsFactory(this.defineError);
            }
        }
        start() {
            this.bus.importMethods(this.config, this.config.imports, {request: true, response: true}, this);
            return super.start()
                .then(result => {
                    return this.connect()
                        .then(() => this.registerMethods())
                        .then(() => {
                            this.pull(this.exec);
                            return result;
                        });
                });
        }
        connect() {
            return new Promise((resolve, reject) => {
                let connection = nats.connect(this.config.options);
                let callback = (err) => {
                    if (!this.connection) {
                        this.connection = connection;
                        return err ? reject(err) : resolve();
                    }
                };
                let listen = (event, cb) => connection.on(event, ctx => {
                    this.log.info && this.log.info({$meta: {mtid: 'event', opcode: event}});
                    cb && cb(ctx);
                });
                listen('disconnect');
                listen('reconnecting');
                listen('reconnect');
                listen('close');
                listen('connect', () => connection.flush(callback));
                listen('error', callback);
            });
        }
        registerMethods() {
            let methods = {};
            this.bus.importMethods(methods, this.config.api);
            Object.keys(methods).forEach(method => {
                if (method.endsWith('.routeConfig') && Array.isArray(methods[method])) {
                    methods[method].forEach((spec) => {
                        if (!this.api[spec.method]) {
                            // TODO use spec.config for validations
                            let busMethod = this.bus.importMethod(spec.method);
                            let publish = (message, replyTo) => {
                                this.log.trace && this.log.trace({message});
                                if (!replyTo) {
                                    return busMethod(message);
                                }
                                return busMethod(message)
                                    .then(result => {
                                        return this.connection.publish(replyTo, {result});
                                    })
                                    .catch(err => {
                                        return this.connection.publish(replyTo, {
                                            error: {
                                                message: err.print || err.message,
                                                type: err.type || 'unknown'
                                            }
                                        });
                                    });
                            };
                            let sid = this.connection.subscribe(spec.method, {queue: this.bus.config.implementation}, publish);
                            this.api[spec.method] = {
                                publish,
                                unsubscribe: () => this.connection.unsubscribe(sid)
                            };
                        }
                    });
                }
            });
        }
        exec(msg = {}, $meta) {
            this.checkConnection();
            return new Promise((resolve, reject) => {
                this.connection.request($meta.method, msg, this.config.requestOptions, result => {
                    if (result instanceof Error) {
                        reject(errors.natsError(result));
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        checkConnection() {
            if (!this.connection) {
                throw errors.notConnected();
            }
        }
        stop() {
            return super.stop()
                .then(() => {
                    if (!this.connection) {
                        return true;
                    }
                    Object.keys(this.api).forEach(method => {
                        this.api[method].unsubscribe();
                        this.log.trace && this.log.trace({
                            message: 'Unsubscribed',
                            method
                        });
                    });
                    return this.connection.close();
                });
        }
    }
    return Nats;
};
