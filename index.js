'use strict';

const controller = require('./driver/controller');
const adapter = require('./driver/adapter');
const brain = require('./driver/brain');

console.log('NEEO SDK "Netatmo Presence" adapter');
console.log('---------------------------------------------');

/**
 * @function buildDevices Create all devices from all discovered SqueezePlayer
 * @param cameras
 * @returns An array of devices build by the fluent neeoapi
 *  */
function buildDevices( cameras ){
    const devices = [];
    return new Promise( ( resolve, reject) => {
        cameras.forEach( (camera, idx ) => {
            adapter.buildDevice( camera ).then( device => {
                devices.push( device );

                if( idx == cameras.length - 1 ){
                    resolve( devices );
                }
            });
        });
    })
}  

controller.discoverCameras().then( cameras => {
    buildDevices( cameras ).then( devices => brain.startDriver( devices ) );
    setInterval( () => controller.refreshCameras( cameras ), 60 * 1000 );
});