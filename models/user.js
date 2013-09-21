'use strict';

var crypto = require('lib/crypto'),
    mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

schema.methods.checkSign = function (uri, sign, timestamp) {
    var dbSign = crypto.createSign(uri, this.password, timestamp);
    return sign === dbSign;
};

schema.statics.create = function (data) {
    data.token = crypto.createToken(data.email);
    return new User(data);
};

var User = mongoose.model('User', schema);

module.exports = User;