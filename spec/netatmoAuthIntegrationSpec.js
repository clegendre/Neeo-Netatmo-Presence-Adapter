const Netatmo = require('netatmo');
const loadSettings = require('../driver/settings');

describe('Netatmo authentication integration', function() {
    let originalTimeout;

    beforeAll(function() {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;
    });

    afterAll(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    it('authenticates with Netatmo API', function(done) {
        if (!process.env.RUN_NETATMO_INTEGRATION) {
            pending('Set RUN_NETATMO_INTEGRATION=1 to run Netatmo auth integration.');
            return;
        }

        const settings = loadSettings();
        const creds = settings.netatmo || {};
        if (!creds.clientId || !creds.clientSecret || !creds.username || !creds.password) {
            pending('Netatmo credentials missing in settings; skipping integration test.');
            return;
        }

        const api = new Netatmo({
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            username: creds.username,
            password: creds.password,
            access_token: creds.accessToken,
            scope: 'read_presence access_presence'
        });

        api.on('authenticated', function() {
            done();
        });

        api.on('error', function(err) {
            done.fail(err);
        });
    });
});
