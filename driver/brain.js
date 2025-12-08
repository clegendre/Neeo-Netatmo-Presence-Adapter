const neeoapi = require('neeo-sdk');
const http = require('http');
const fs = require('fs');
const path = require('path');
const settings = require('./settings')();
const adpaterName = 'netatmo-presence-adapter';

/**
 * Gets the brain either from environment variable or settings.
 * If both are not specified, discover one brian.
 */
async function dealWithBrainIp(callback) {
    const brainIp = process.env.BRAINIP;
    const setBrainIp = (ip) => {
        if (ip) {
            settings.neeo.brainIp = ip;
        }
    };
    if (!callback) {
        throw '[ADAPTER] Callback missing!';
    }
    if (brainIp) {
        console.log('[ADAPTER] use NEEO Brain IP from env variable', brainIp);
        setBrainIp(brainIp);
        callback(brainIp);
      } else {
        if (settings.neeo.brainIp) {
            console.log('[ADAPTER] use NEEO Brain IP from settings variable', settings.neeo.brainIp);
            callback(settings.neeo.brainIp);
            return;
        }
        console.log('[ADAPTER] discover one NEEO Brain...');
        let brain = await neeoapi.discoverOneBrain()
        console.log('[ADAPTER] Brain discovered:', brain.name);
        setBrainIp(brain.host);
        callback(brain);
    }
};

function setAdapterDeviceId(device, brainHost) {
    const host = typeof brainHost === 'string' ? brainHost : (brainHost && brainHost.host) || settings.neeo.brainIp;
    if (!host) {
        console.log('[BRAIN] Unable to determine brain host to fetch adapter device id.');
        return Promise.resolve();
    }
    const deviceId = device.deviceidentifier;
    console.log(`[BRAIN] Adapter name is ${deviceId}`);
  
    return new Promise((resolve, reject) => {
          const req = http.get({
              host,
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
                  const parsed = JSON.parse(body);
                  const outPath = path.join(__dirname, '..', 'brain_devices.json');
                  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
                  var selected = parsed.find(x => x.details.adapterName === deviceId);
                  console.log(selected)
                  if (selected) {
                    var adapterDeviceId = selected.key;
                    console.log(`[BRAIN] Adapter device id is ${adapterDeviceId}`);
                    resolve(adapterDeviceId);
                  }
                  else{
                    console.log(parsed)
                    console.log(`[BRAIN] Driver not installed yet, please use the NEEO app to search for "${device.devicename}"`);
                    //resolve(adapterDeviceId);
                }
            });
          });

          req.on('error', function(err) {
            console.log('[HTTP REQUEST] Problem with request: ' + err.message);
            reject(err);
          });
      });
  }


/**
 * @function startDriver Starts the driver to be discovered by the brain
 */
async function startDriver( brain, devices ) {
    const brainHost = typeof brain === 'string' ? brain : brain && brain.host;
    if (!settings.neeo.brainIp && brainHost) {
        settings.neeo.brainIp = brainHost;
    }
    console.log('- Start server');
    console.log(brain);
    await neeoapi.startServer({
      brain,
      port: settings.neeo.driverPort,
      name: adpaterName,
      devices 
    });
    devices.forEach( async device => {
        device.uniqueDeviceId = await setAdapterDeviceId( device, brainHost );
    });
}

module.exports.startDriver = ( devices ) => dealWithBrainIp( brain => startDriver( brain, devices ) );
