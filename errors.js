module.exports = (create) => {
    const NATS = create('nats');
    return {
        natsError: create('error', NATS),
        notConnected: create('notConnected', NATS, 'connection failed')
    };
};
