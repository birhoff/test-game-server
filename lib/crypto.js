'use strict';

var extend = require('node.extend'),
    crypto = require('crypto'),
    config = require('config');

var CryptoUtility = function () {
    this._settings = extend({}, CryptoUtility.defaults, {
        key: config.get('crypto:key'),
        divider: config.get('crypto:divider')
    });
};

CryptoUtility.prototype.createToken = function (email) {
    return crypto.createHmac('sha1', this._settings.key).update(email).digest('hex');
};

//sign: hash3({k1} + {uri} + {k2} + {requestTimestamp} + {k3}, hash4({credential}, {s3}));
CryptoUtility.prototype.createSign = function (uri, password, timestamp) {
    if (!uri || !password || !timestamp) return null;

    var digits = this._settings.divider,
        text = digits + uri + digits + timestamp + digits,
        key = crypto.createHmac('sha1', this._settings.key).update(password).digest('hex');

    return crypto.createHmac('sha1', key).update(text).digest('hex');
};

CryptoUtility.defaults = {
    key: "my secret key",
    divider: "::"
};

module.exports = new CryptoUtility();