var nodemailer = require('nodemailer');
var log = require('./log')(module);
var transporter = nodemailer.createTransport('smtps://nodesynebo%40gmail.com:rout_main@smtp.gmail.com');
var fs = require('fs');

function sendMail(to, params, template, subject) {
    var mailOptions = {
        from: '"Admin" <admin@nodemailer.com>',
        to: to,
        subject: subject,
        html: getTemplate(params, template)
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return log.info(error);
        }
        log.info('Mail sent to: ' + to);
    });
}

function getTemplate(params, template) {
    templatePath = "../../Dropbox/mean_app/emailTemplates/" + template + ".html";
    templateContent = fs.readFileSync(templatePath, encoding = "utf8");
    newContent = templateContent;
    JSONforEach(params, function(key, entry) {
        newContent = newContent.replace(key, entry);
    });
    return newContent;
}

function JSONforEach(data, callback) {
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            callback(key, data[key]);
        }
    }
}

exports.sendMail = sendMail;
