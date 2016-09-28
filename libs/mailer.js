var nodemailer = require('nodemailer');
var log = require('./log')(module);
var config = require('./config');
var transporter = nodemailer.createTransport('smtps://nodesynebo%40gmail.com:rout_main@smtp.gmail.com');
var fs = require('fs');

var currentdate = new Date();
var datetime =
    currentdate.getDate() + "/" +
    (currentdate.getMonth() + 1) + "/" +
    currentdate.getFullYear();
var defaultParams = {
    "{!currentDate}": datetime,
    "{!companyEmail}": config.get('admin:email').replace('.', '&#173;.'),
    "{!currentYear}": new Date().getFullYear(),
    "{!site}": "http://www.google.com/doodles/",
};

function sendMail(to, params, template, subject) {
    var mailOptions = {
        from: '"Admin" <nodesynebo@gmail.com>',
        to: to,
        subject: subject,
        html: getTemplate(params, template)
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return log.error(error);
        }
        log.info('Mail sended to ' + to);
    });
}

function getTemplate(params, template) {
    templatePath = config.get('client') + "/emailTemplates/" + template + ".html";
    templateContent = fs.readFileSync(templatePath, encoding = "utf8");
    newContent = templateContent;
    JSONforEach(defaultParams, function(key, entry) {
        newContent = newContent.replace(key, entry);
    });
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
