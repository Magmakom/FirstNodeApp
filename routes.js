var path = require('path');
var log = require('./libs/log')(module);

module.exports = function(app) {

    app.use('/', function(req, res, next) {
        log.info(req.method + ' ' + req.originalUrl);
        log.info('Body: ' + JSON.stringify(req.body));
        next();
    })

    app.use('/api/cases', require('./api/case'));
    app.use('/api/users', require('./api/user'));

    app.use(function(req, res, next) {
        res.status(404);
        log.debug('%s %d %s', req.method, res.statusCode, req.url);
        res.json({
            error: 'Not found'
        });
        return;
    });

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        log.error('%s %d %s %s', req.method, res.statusCode, err.message, err.stack);
        res.json({
            error: err.message
        });
        return;
    });

    // All other routes should redirect to the index.html
    app.get('/*', function(req, res) {
        res.sendfile('index.html', {
            root: path.join(__dirname, "../../Dropbox/mean_app")
        })
    });
};;
