# NEEO Netatmo Presence Adapter

This NEEO Driver allows you to add a device for each Netatmo Camera you want.

But before, you need to register on the Netatmo developer platform in order to obtain a clientId and a clientSecret for your application.

Navigate to https://dev.netatmo.com, creates an account, and creates an application. Netatmo will provide you both *clientId* and *clientSecret* for the application.

Sets your credentials to the settings.json file:
```json
    "netatmo": {
        "clientId": "",
        "clientSecret": "",
        "username": "",
        "password": ""
    }
```
Sets the name of the cameras you want to add to NEEO:
```json
    "cameras":["Name_Of_The_Presence_Camera"]
```
The run the following command to start the driver:
> node index.js

If you to test your configuration and credentials, you can run:
> npm run test

You should see some logs which displays the liveSnapshotUrl of your cameras. You can copy paste to your browser to see the picture.

On the NEEO App, look for the name of your Cameras or for Netatmo to find them. Adds as a shortcuts the *cameraimage* component.

Enjoy !

_Issues_: On the NEEO Remote, pictures seems to flicker a lot during component update. You can increase the **updateDelayMs** configuration in settings to try to fix the issue.

_Issues_: The driver is added as a "Projector" device type since there is no Camera device type and since an Accessory cannot be added to a Recipe... Hope it will be fixed one day. 

_Issues_: The cameradetector switch does not work since there is no way through the Netatmo API to change the detection mode of the camera.