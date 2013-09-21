'use strict';

var express = require('express'),
    app = express(),
    config = require('config'),
    http = require('http');

var User = require('models/user');

var path = require('path');

// all environments
app.set('port', config.get('port'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// development only
if ('development' === app.get('env')) {
    app.use(express.errorHandler());
}

/* user section */
app.get('/api/user', function (req, res) {
    var authData = readAuthentication(req.headers);
    if (!authData) {
        res.send("ERROR::300::Authorization data not found");
        return;
    }

    User.findOne({token: authData.token}, function (err, user) {
        if (err) {
            res.send("ERROR::301::User not found");
            return;
        }
        var isAuthenticated = user.checkSign("/api/user", authData.sign, authData.timestamp);
        if (!isAuthenticated) {
            res.send("ERROR::302::Email or Password is incorrect");
            return;
        }
        res.send("SUCCESS::user loged in");
    });
});

app.post('/api/user', function (req, res) {
    var authData = readAuthentication(req.headers),
        registrationData = parseRegistrationData(req.body);

    if (authData) {
        res.send("ERROR::303::You already authorithated");
        return;
    }
    if (!registrationData) {
        res.send("ERROR::305::User information invalid. Please enter valid information");
        return;
    }

    User.findOne({email: registrationData.email}, function (err, user) {
        if (err) {
            throw err;
        }

        if (user) {
            res.send("ERROR::306::User with this email already registered");
            return;
        }

        var newUser = User.create({
            username: registrationData.name,
            email: registrationData.email,
            password: registrationData.password
        });

        newUser.save(function (err, user, affected) {
            if (err) throw err;
            res.send("SUCCESS::user " + user.username + " registered");
        });
    });
});
/* end user section */

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

function readAuthentication(headers) {
    var data = {
        token: headers["x-auth-token"],
        timestamp: headers["x-auth-time"],
        sign: headers["x-auth-sign"]
    };
    if (!data.token || !data.sign || !data.timestamp) return null;
    return data;
}

function parseRegistrationData(data) {
    var regData = {
        name: data.name,
        email: data.email,
        password: data.pass
    };
    if (!regData.name || !regData.email || !regData.password) return null;
    return regData;
}
