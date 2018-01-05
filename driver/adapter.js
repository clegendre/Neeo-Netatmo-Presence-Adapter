const neeoapi = require('neeo-sdk');
const settings = require('./settings')();

/**
 * @function buildDevice
 * @param {Camera} camera
 * @description  A basic adapter to control a logitech squeezebox. It looks for favorites and spotify playlist and add them as shortcuts.
 * @returns A promise that sould redolve with the device built.
 */
function buildDevice( camera ){
    return new Promise( (resolve, reject) => {

        let device = neeoapi.buildDevice( camera.name )
            .setManufacturer('Netatmo')
            .addAdditionalSearchToken('IPCam')
            .addAdditionalSearchToken('Camera')
            .setType('PROJECTOR')
            .addImageUrl({ name: 'cameraimage', label: 'Entrée: ', size: 'large' }, camera.getLiveSnapshotUri.bind( camera ) )
            .addSwitch({ name: 'cameradetector', label: 'Détection'}, camera.enableCameraDetectionFeature() )
            .addTextLabel({ name: 'camerastatus', label: 'Camera: ' }, () => camera.name );

        const setUpdateCallbackReference = function ( sendComponentUpdate, optionalCallbackFunctions ) {
            
            setInterval( function() {
                const uniqueDeviceId = "default";
                const uri = camera.getLiveSnapshotUri();
                sendComponentUpdate({
                    uniqueDeviceId,
                    component: 'cameraimage',
                    value: uri
                })
            }, settings.updateDelayMs || 2000 );
        };

        device.registerSubscriptionFunction( setUpdateCallbackReference.bind(this) );

        resolve( device );
    })
}

module.exports.buildDevice = buildDevice;