/* eslint no-process-exit:0, no-process-env:0, no-console:0 */
const fork = require('child_process').fork;
const path = require('path');
const serverPath = path.join(__dirname, 'services', 'server');
const clientPath = path.join(__dirname, 'services', 'client');
const workerCount = parseInt(process.env.workers) || 1;
console.log('Performance test executing. Please wait...');
return Promise.all(Array.apply(null, Array(workerCount)).map(() => {
    return new Promise(resolve => {
        let worker = fork(serverPath);
        worker.on('message', (message) => {
            if (message === 'ready') {
                resolve(worker);
            }
        });
    });
}))
.then(workers => {
    return new Promise(resolve => {
        fork(clientPath).on('message', message => {
            if (message === 'done') {
                return Promise.all(workers.map(worker => {
                    return new Promise(resolve => {
                        worker.send('done');
                        worker.on('message', () => {
                            if (message === 'done') {
                                resolve();
                            }
                        });
                    });
                })).then(resolve);
            }
        });
    });
})
.then((workers) => {
    console.log('worekrs:', workers.length);
    console.log('done');
    return process.env.autoClose === 'true' && process.exit(0);
})
.catch(console.error);
