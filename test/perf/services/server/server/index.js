const path = require('path');
module.exports = () => {
    return {
        ports: [
            {
                id: 'db',
                createPort: require('ut-port-sql'),
                createTT: false,
                linkSP: true,
                imports: ['test'],
                schema: [{
                    path: path.join(__dirname, '..', 'schema'),
                    linkSP: true
                }]
            },
            {
                id: 'nats',
                createPort: require('../../../../../index.js'),
                api: ['test']
            }
        ],
        modules: {
            test: {}
        },
        validations: {
            test: {
                test: {}
            }
        }
    };
};
