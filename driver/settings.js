'use strict';

const path = require('path');
const fs = require('fs');
const dirname = __dirname;

module.exports = function() {
    try {
        let res = JSON.parse(fs.readFileSync(path.join(dirname, '../settings.json')));
        return res;
    }
    catch (err) {
        console.log(err)
        throw err;
    }
}