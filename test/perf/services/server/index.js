/* eslint no-console:0, no-process-env:0 */
const packageJson = require('../../../../package.json');
require('ut-run').run({
    version: packageJson.version
}).then(({stop}) => {
    return new Promise(resolve => {
        process.send && process.send('ready');
        process.on('message', message => {
            if (message === 'done') {
                process.send && process.send('done');
                resolve();
            }
        });
    }).then(() => {
        return process.env.autoClose === 'true' && stop();
    });
}).catch(console.error);
