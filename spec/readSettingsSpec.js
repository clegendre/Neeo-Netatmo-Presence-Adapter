const loadSettings = require('../driver/settings');

describe('Settings loader', function() {
    it('reads settings configuration', function() {
        const settings = loadSettings();

        expect(settings).toBeDefined();
        expect(settings.neeo).toBeDefined();
        expect(settings.netatmo).toBeDefined();
        expect(settings.cameras).toBeDefined();
    });
});
