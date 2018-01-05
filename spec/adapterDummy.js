const fs = require('fs');

function buildDevice( camera ){
    console.log('Building device ' + camera.name);
    setInterval( function() {
        const uri = camera.getLiveSnapshotUri();
        console.log(uri);
        const status = camera.getStatus();
        console.log(status);
    }, 2 * 1000 );

    return new Promise( (resolve, reject) => resolve(camera) );
}

module.exports.buildDevice = buildDevice;
