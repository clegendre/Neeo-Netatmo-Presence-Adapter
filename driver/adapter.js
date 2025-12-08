const neeoapi = require('neeo-sdk');
const settings = require('./settings')();

/**
 * @function buildDevice
 * @param {Camera} camera
 * @description  A basic adapter to control Netatmo Camera
 * @returns A promise that sould redolve with the device built.
 */
function buildDevice( camera ){
    return new Promise( (resolve, reject) => {

        let device = neeoapi.buildDevice( camera.name )
            .setManufacturer('Netatmo')
            .addAdditionalSearchToken('IPCam')
            .addAdditionalSearchToken('Camera')
            .setType('PROJECTOR')
            .addImageUrl({ name: 'cameraimage', label: 'Entrée: ', size: 'large' }, ( deviceId ) =>  camera.getLiveSnapshotUri.bind( camera, deviceId ) )
            .addSwitch({ name: 'cameradetector', label: 'Détection'}, camera.enableCameraDetectionFeature() )
            .addTextLabel({ name: 'camerastatus', label: 'Camera: ' }, ( deviceId ) => camera.name );


        device.registerSubscriptionFunction( function ( sendComponentUpdate, optionalCallbackFunctions ) {
            const updateCallbackReference = function() {
                const uniqueDeviceId = camera.uniqueDeviceId || 'default';
                const uri = camera.getLiveSnapshotUri();
                const component = 'cameraimage';
                console.log(uri)
                sendComponentUpdate({
                    uniqueDeviceId,
                    component,
                    value: uri
                }).catch(err => {
                    console.log('[ADAPTER] Unable to send component update', { component, uniqueDeviceId, err: err && err.message ? err.message : err });
                });
            };

            console.log('Update Callback Received. Registering Notify Property Changed handler')
            //camera.notifyPropertyChanged( ( property ) => 
            setInterval( updateCallbackReference , settings.updateDelayMs );
        } );

        resolve( device );
    })
}

module.exports.buildDevice = buildDevice;
