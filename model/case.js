var mongoose = require('mongoose'),

    Schema = mongoose.Schema,

    Case = new Schema({
        _creator: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
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
        },
        created: {
            type: Date,
            default: Date.now
        }
    });


module.exports = mongoose.model('Case', Case);
