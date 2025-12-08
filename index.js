'use strict';

const controller = require('./driver/controller');
const adapter = require('./driver/adapter');
const brain = require('./driver/brain');
const settings = require('./driver/settings');

console.log('NEEO SDK "Netatmo Presence" adapter');
console.log('---------------------------------------------');

/**
 * @function buildDevices Create all devices from all discovered SqueezePlayer
 * @param cameras
 * @returns An array of devices build by the fluent neeoapi
 *  */
async function buildDevices( cameras ){
    const devices = [];
    return new Promise( ( resolve, reject) => {
        cameras.forEach( async (camera, idx ) => {
            let device = await adapter.buildDevice( camera );
            devices.push( device );
        });
        resolve( devices );
    })
}  

async function run()
{
    const cameras = await controller.discoverCameras();
    const devices = await buildDevices( cameras );
    brain.startDriver( devices );
    setInterval( () => controller.refreshCameras( cameras ), 1000 * 60 * 15 );
}

run().then( x => console.log(x)).catch( err => console.log(err));