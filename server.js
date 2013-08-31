"use strict";

var db = function () {
    var _db = {};

    this.get = function (token) {
        return _db[token];
    }

    this.add = function (user) {
        var token = cryptoUtility.getToken(user.email);
        user.token = token;
        _db[token] = user;
        console.log("user registered: %s [%s]", user.email, token);
    }
}


var CryptoUtility = function () {
    var _key = "oyster&power",
        _digits = "::";

    this.getToken = function (email) {
        return crypto.createHmac('sha1', _key).update(email).digest('hex');
    }

    this.getSign = function (uri, password, timestamp) {
        //sign: hash3({k1} + {uri} + {k2} + {requestTimestamp} + {k3}, hash4({credential}, {s3}));
        var text = _digits + uri + _digits + timestamp + _digits;
        var key = crypto.createHmac('sha1', _key).update(password).digest('hex');
        return crypto.createHmac('sha1', key).update(text).digest('hex');
    }
}

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    crypto = require('crypto'),
    cryptoUtility = new CryptoUtility(),
    db = new db();

db.add({
    email: "test",
    password: "test",
    name: "test"
});

server.listen(8080);

app.configure(function () {
    app.use(express.bodyParser());
    app.use(function (req, res, next) {
        console.log('%s %s', req.method, req.url);
        next();
    });

});

app.get('/api/login', function (req, res) {
    debugger;
    var auth = readAuthentication(req.headers);

    if (!auth.token) {
        res.send("Only registered users can access this page");
        return;
    }

    var user = db.get(auth.token);
    if (!user) {
        res.send("your user can not find in DB");
        return;
    }
    var userSign = cryptoUtility.getSign("/api/login", user.password, auth.timestamp);
    if (userSign !== auth.sign) {
        res.send("Your Email or Password is invalid");
        return;
    }
    res.send("You are sucessfully conected");
});

app.post("/api/register", function (req, res) {
    debugger;
    var auth = readAuthentication(req.headers);
    if (auth.token) {
        res.send("You are log in. Please log off before register");
    }

    if (!req.body.name || !req.body.email || !req.body.password) {
        res.send("User information invalid. Please enter valid information");
        return;
    }

    db.add({
        name: req.body.name,
        email: req.body.email,
        password: req.body.pass
    });
    res.send("user" + req.body.name + " registered");
});

function readAuthentication(headers) {
    return {
        token: headers["x-auth-token"],
        timestamp: headers["x-auth-time"],
        sign: headers["x-auth-sign"]
    }
}



