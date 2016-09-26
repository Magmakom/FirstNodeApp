var mongoose = require('mongoose'),
    crypto = require('crypto'),

    Schema = mongoose.Schema,

    User = new Schema({
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String
        },
        city: {
            type: String
        },
        email: {
            type: String,
            unique: true,
            required: true
        },
        phoneOffice: {
            type: String
        },
        phoneCell: {
            type: String
        },
        role: {
            type: String,
            default: "user"
        },
        status: {
            type: String,
            default: "waiting"
        },
        created: {
            type: Date,
            default: Date.now
        },
        hashedPassword: {
            type: String,
            required: true
        },
        salt: {
            type: String,
            required: true
        },
        cases: [{
            number: {
                type: String
            },
            name: {
                type: String,
                required: true
            },
            body: {
                type: String,
                default: '{}'
            },
            status: {
                type: String,
                default: "waiting"
            }
        }]
    });

User
    .virtual('profile')
    .get(function() {
        return {
            'email': this.name,
            'role': this.role
        };
    });

User.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};

User.virtual('userId')
    .get(function() {
        return this.id;
    });

User.virtual('name')
    .get(function() {
        return this.lastName + (this.firstName ? (' ' + this.firstName) : '');
    });

User.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('hex');
        //more secure - this.salt = crypto.randomBytes(128).toString('hex');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._plainPassword;
    });


User.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

module.exports = mongoose.model('User', User);
