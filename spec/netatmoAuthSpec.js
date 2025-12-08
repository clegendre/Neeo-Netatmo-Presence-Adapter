describe('Netatmo authentication', function() {
    let originalRequestModule;
    let requestPath;
    let requestStub;

    beforeEach(function() {
        // Stub out the request module so we can intercept the auth POST without real network.
        requestPath = require.resolve('request');
        originalRequestModule = require(requestPath);
        requestStub = jasmine.createSpy('requestStub').and.callFake((options, cb) => {
            cb(
                null,
                { statusCode: 200, headers: { 'content-type': 'application/json' } },
                JSON.stringify({ access_token: 'token', expires_in: 3600, refresh_token: 'refresh' })
            );
        });
        require.cache[requestPath] = { id: requestPath, filename: requestPath, loaded: true, exports: requestStub };
        delete require.cache[require.resolve('netatmo')];
    });

    afterEach(function() {
        require.cache[requestPath] = { id: requestPath, filename: requestPath, loaded: true, exports: originalRequestModule };
        delete require.cache[require.resolve('netatmo')];
    });

    it('posts credentials to authenticate with Netatmo', function() {
        const settings = require('../driver/settings')();
        const Netatmo = require('netatmo');

        new Netatmo({
            client_id: settings.netatmo.clientId,
            client_secret: settings.netatmo.clientSecret,
            username: settings.netatmo.username,
            password: settings.netatmo.password,
            scope: 'read_presence access_presence'
        });

        expect(requestStub).toHaveBeenCalled();
        const callArgs = requestStub.calls.mostRecent().args[0];
        expect(callArgs.url).toBe('https://api.netatmo.com/oauth2/token');
        expect(callArgs.form).toEqual(jasmine.objectContaining({
            client_id: settings.netatmo.clientId,
            client_secret: settings.netatmo.clientSecret,
            username: settings.netatmo.username,
            password: settings.netatmo.password,
            scope: 'read_presence access_presence',
            grant_type: 'password'
        }));
    });
});
