const neeoapi = require('neeo-sdk');
const http = require('http');
const settings = require('./settings')();
const adpaterName = 'netatmo-presence-adapter';

/**
 * Gets the brain either from environment variable or settings.
 * If both are not specified, discover one brian.
 */
function dealWithBrainIp(callback) {
    const brainIp = process.env.BRAINIP;
    if (!callback) {
        throw '[ADAPTER] Callback missing!';
    }
    if (brainIp) {
        console.log('[ADAPTER] use NEEO Brain IP from env variable', brainIp);
        callback(brainIp);
      } else {
        if (settings.neeo.brainIp) {
          console.log('[ADAPTER] use NEEO Brain IP from settings variable', settings.neeo.brainIp);
          callback(settings.neeo.brainIp);
          return;
        }
        console.log('[ADAPTER] discover one NEEO Brain...');
        neeoapi.discoverOneBrain()
          .then((brain) => {
            console.log('[ADAPTER] Brain discovered:', brain.name);
            callback(brain);
        });
    }
};

function setAdapterDeviceId(device) {
    const deviceId = device.deviceidentifier;
    console.log(`[BRAIN] Adapter name is ${deviceId}`);
  
    return new Promise((resolve, reject) => {
          http.get({
              host: settings.neeo.brainIp,
              port: 3000,
              path: '/v1/projects/home/devices',
              headers: {
                  'Content-Type': 'application/json'                
              }
          }, function(response) {
  
              const { statusCode } = response;
                
              var error;            
              if (statusCode !== 200) {
                  error = new Error('[HTTP REQUEST] Request Failed.\n' + `Status Code: ${statusCode}`);                    
              }
              if (error) {
                  console.log('[HTTP REQUEST] Problem with request: ' + error.message);
                  response.resume();
                  reject(error);
              } 
              var body = '';
              response.on('data', function(d) {
                  body += d;
              });
  
              response.on('end', function() {    
                  var parsed = JSON.parse(body);
                  var selected = parsed.find(x => x.details.adapterName === adpaterName);
                  if (selected) {
                    var adapterDeviceId = selected.adapterDeviceId;
                    console.log(`[BRAIN] Adapter device id is ${adapterDeviceId}`);
                    // controller.ready();
                    resolve(adapterDeviceId);
                  }
                  else{
                    console.log(`[BRAIN] Driver not installed yet, please use the NEEO app to search for "${device.devicename}"`);
                  }
                  return;                
              });
          });               
      });
  }


/**
 * @function startDriver Starts the driver to be discovered by the brain
 */
function startDriver( brain, devices ) {
    console.log('- Start server');
    return neeoapi.startServer({
      brain,
      port: settings.neeo.driverPort,
      name: adpaterName,
      devices 
    })
    .then(() => {
        console.log('# READY! use the NEEO app to search for "SqueezeBox".');
        devices.forEach( device => {
            setAdapterDeviceId( device );
        })
    })
    .catch((error) => {
      console.error('ERROR!', error.message);
      process.exit(1);
    });
}

  module.exports.startDriver = ( devices ) => dealWithBrainIp( brain => startDriver( brain, devices ) );