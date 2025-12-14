const netatmo = require('netatmo');
const settings = require('./settings')();
const auth = {
  "client_id": settings.netatmo.clientId,
  "client_secret": settings.netatmo.clientSecret,
  "access_token": settings.netatmo.accessToken,
  "refresh_token": settings.netatmo.refreshToken,
  "scope": "read_presence access_presence write_presence"
};

const api = new netatmo(auth);
const live = '/live/snapshot_720.jpg'; // '/live/index_local.m3u8'; // 

class Camera {
    constructor( c ){
        this.name = c.name;
        this.callbacks = [];
    }

    getLiveSnapshotUri( deviceId ){
        return this.liveSnapshotUrl + "?t=" + new Date().getTime();
    }

    setLiveSnapshotUri( value, isLocal ){
        if( isLocal && this.localIp ){
            let urlParts = value.replace('https://', '').split('/');
            let cameraId = urlParts[3];
            this.liveSnapshotUrl = 'http://' + this.localIp + '/' + cameraId + live ;
        }
        else this.liveSnapshotUrl = value + live ;
    }

    getStatus(){
        return this.status;
    }

    setStatus( value ){
        this.status = value == 'on';
    }

    enableCameraDetectionFeature( ){
        let self = this;
        return {
            getter: () => {
                return self.status;
            },
            setter: ( v ) => {
                self.status = v;
            }
        }
    }

    onPropertyChanged( propertyName ) {
        // TODO: POST Netatmo API to change camera status
        //console.log(propertyName +" firing "  + this.callbacks.length)
        //this.callbacks.forEach( c => c(propertyName));
    }

    notifyPropertyChanged( callback ){
        console.log('Callback registered')
        //this.callbacks.push(callback);
    }
}

module.exports.discoverCameras = () => {
    console.log('Discovering cameras')
    return new Promise( (resolve, reject) => {
        api.getHomeData( (err,homeData) => {
            let homeCameras =  homeData.homes[0].cameras;
            let discoveredCameras = [];
            console.log(homeCameras);
            for( let homeCamera of homeCameras) {
                const cam = new Camera( homeCamera );
                cam.setStatus( homeCamera.status );
                cam.setLiveSnapshotUri( homeCamera.vpn_url, homeCamera.is_local );
                discoveredCameras.push(cam);
            }
            resolve( discoveredCameras );
        });
    });
}

module.exports.refreshCameras = ( cameras ) => {
    api.getHomeData(  (err,homeData) => {
        let homeCameras =  homeData.homes[0].cameras;
        homeCameras.forEach( homeCamera => {
            const camera = cameras.find( cam => cam.name == homeCamera.name );
            if( camera ){
                camera.setStatus( homeCamera.status );
                camera.setLiveSnapshotUri( homeCamera.vpn_url, homeCamera.is_local );
            }
        });
    });
}
