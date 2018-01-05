const controller = require('../driver/controller');

describe( "Discover cameras", function( ){
    it("Should discover at least one camera", function( done ){
        controller.discoverCameras().then( cameras => {
            expect(cameras).toBeDefined();
            expect(cameras.length).toBe(1);
            console.log(cameras);
            done();
        });
    });

    it("Should refresh cameras", function(done){
        controller.discoverCameras().then( cameras => {
            setInterval( () => {
                controller.refreshCameras( cameras );
                console.log(cameras);
                done()
            }, 1 * 1000 );
        });
    });
});