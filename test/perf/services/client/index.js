/* eslint no-process-env:0, no-console:0 */
const packageJson = require('../../../../package.json');
require('ut-run').run({
    version: packageJson.version
}).then(({bus, stop}) => {
    const iterations = parseInt(process.env.iterations) || 1;
    const busMethod = bus.importMethod('test.test');
    const msg = {x: 1};
    const arr = Array.apply(null, Array(iterations));
    const time = process.hrtime();
    return Promise.all(arr.map(() => busMethod(msg)))
        .then(x => {
            let diff = process.hrtime(time);
            let ms = diff[0] * 1000 + diff[1] / 1000000;
            console.log(JSON.stringify({
                iterations,
                timeTotal: ms + ' ms',
                mps: (iterations * 1000) / ms
            }, null, 4));
            process.send && process.send('done');
            // return stop();
        });
}).catch(console.error);
