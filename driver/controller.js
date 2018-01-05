var netatmo = require('netatmo');
var settings = require('./settings')();
var auth = {
  "client_id": settings.netatmo.clientId,
  "client_secret": settings.netatmo.clientSecret,
  "username": settings.netatmo.username,
  "password": settings.netatmo.password,
  "scope": "read_presence access_presence"
};

var api = new netatmo(auth);
var live = '/live/snapshot_720.jpg'; // '/live/index_local.m3u8'; // 
class Camera {
    constructor( name, camera ){
        this.name = name;
        this.liveSnapshotUrl = camera.vpn_url +live ;
        this.status = camera.status == 'on';
    }

    getLiveSnapshotUri(){
        return this.liveSnapshotUrl;
    }

    setLiveSnapshotUri( value ){
        this.liveSnapshotUrl = value + live + "?t=" + new Date().getTime();
    }

    getStatus(){
        return this.status;
    }

    setStatus( value ){
        this.status = value == 'on';
    }

    enableCameraDetectionFeature(){
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
    }
}

module.exports.discoverCameras = () => {
    return new Promise( (resolve, reject) => {
        api.getHomeData( (err,homeData) => {
            let homes = homeData.homes;
            let firstHome = homes[0];
            const cameras = settings.cameras.map( c => {
                let cameraData = firstHome.cameras.find( homeCamera => c == homeCamera.name ); // Entree
                return new Camera( c, cameraData );
            });
            resolve( cameras );
        });
    });
}

module.exports.refreshCameras = ( cameras ) => {
    api.getHomeData(  (err,homeData) => {

        let homes = homeData.homes;
        let firstHome = homes[0];
        firstHome.cameras.forEach( homeCamera => {
            const camera = cameras.find( tc => tc.name == homeCamera.name );
            camera.setStatus( homeCamera.status );
            camera.setLiveSnapshotUri( homeCamera.vpn_url );
        });
    });
}