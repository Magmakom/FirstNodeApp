var mongoose = require('mongoose'),

    Schema = mongoose.Schema,

    Counter = new Schema({
        caseCount: {
            type: Number,
            default: 0
        }
    });

module.exports = mongoose.model('Counter', Counter);
