var nconf = require('nconf');

nconf.argv()
    .env()
    .file({
        file: process.cwd() + '/config.' + process.env.NODE_ENV + '.json'
    });

module.exports = nconf;
