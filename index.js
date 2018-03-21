const nats = require('nats');
module.exports = (params = {}) => {
    const api = {};
    const Port = params.parent;
    class Nats extends Port {
        constructor(params = {}) {
            super(params);
            this.config = Object.assign(
                {
                    id: 'nats',
                    logLevel: 'debug',
                    requestTimeout: 30000
                },
                params.config,
                {
                    type: 'nats',
                    options: {
                        json: true
                    }
                }
            );
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
                        if (!api[spec.method]) {
                            // TODO use spec.config for validations
                            let busMethod = this.bus.importMethod(spec.method);
                            let publish = (msg, replyTo) => {
                                return busMethod(msg)
                                    .then(result => {
                                        return this.connection.publish(replyTo, {result});
                                    })
                                    .catch((err) => {
                                        return this.connection.publish(replyTo, {
                                            error: {
                                                message: err.print || err.message,
                                                type: err.type || 'unknown'
                                            }
                                        });
                                    });
                            };
                            let sid = this.connection.subscribe(spec.method, publish);
                            api[spec.method] = {
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
                this.connection.requestOne($meta.method, msg, this.config.requestTimeout, (result) => {
                    if (result instanceof Error) {
                        reject(result);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        checkConnection() {
            if (!this.connection) {
                throw new Error('port.notConnected');
            }
        }
        stop() {
            return super.stop()
                .then(() => {
                    if (!this.connection) {
                        return true;
                    }
                    Object.keys(api).forEach(key => api[key].unsubscribe());
                    return this.connection.close();
                });
        }
    }
    return Nats;
};
