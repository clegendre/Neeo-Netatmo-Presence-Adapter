var netatmo = require('netatmo');
var settings = require('./settings')();
var auth = {
  "client_id": settings.netatmo.clientId,
  "client_secret": settings.netatmo.clientSecret,
  "refresh_token": settings.netatmo.refreshToken,
  "scope": "read_presence access_presence"
};

var api = new netatmo(auth);
var live = '/live/snapshot_720.jpg'; // '/live/index_local.m3u8'; // 

class Camera {
    constructor( cameraSettings ){
        this.name = cameraSettings.name || cameraSettings;
        this.localIp = cameraSettings.localAddress;
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

        //this.onPropertyChanged( 'liveSnapshotUrl' );
    }

    getStatus(){
        return this.status;
    }

    setStatus( value ){
        this.status = value == 'on';
    }

    enableCameraDetectionFeature( ){
        var self = this;
        return {
            getter: () => {
                return self.status;
            },
            setter: ( v ) => {
                self.status = v;
                this.onPropertyChanged( 'status' );
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
            console.log('getHomeData result:', { err, homeData });
            let homeCameras =  homeData.homes[0].cameras;
            console.log(homeCameras);
            const discoveredCameras = settings.cameras
                .map( cameraSetting => new Camera( cameraSetting ) )
                .reduce( ( prev, cam ) => {
                    let homeCamera = homeCameras.find( homeCamera => cam.name == homeCamera.name );
                    if( homeCamera ){
                        cam.setStatus( homeCamera.status );
                        cam.setLiveSnapshotUri( homeCamera.vpn_url, homeCamera.is_local );
                        prev.push( cam );
                    }
                    return prev;
                }, []);
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
