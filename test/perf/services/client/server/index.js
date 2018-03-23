module.exports = () => {
    return {
        ports: [
            {
                id: 'nats',
                createPort: require('../../../../../index.js'),
                namespace: ['test']
            }
        ]
    };
};
