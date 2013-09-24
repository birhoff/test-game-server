'use strict';

var Client = require("./Client"),
    Response = require("./Response"),
    EventHandler = require("./EventHandler");

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var eventHandler = new EventHandler();

var Network = function () {
    this.clients = [];
};

Network.prototype.on = function (event, callback) {
    eventHandler.register(event, callback);
};

Network.prototype.listen = function () {
    app.listen(3000);
};

var network = new Network();
module.exports = network;

io.set('log level', 1);

io.sockets.on('connection', function (socket) {

    var client = new Client(socket);
    network.clients.push(socket);
    //socket.set("client", client);

    socket.on('message', function (message) {

        if (!isJSON(message)) {
            socket.send(new Response(Response.types.Error, {message: "Request parsing failed"}));
            return;
        }

        var request = JSON.parse(message);

        if (!request) return;

        eventHandler.dispatch("message", [client, request]);
    });

    socket.on('disconnect', function () {
        eventHandler.dispatch("message", [client, {
            type: "disconnect"
        }]);
    });
});

function isJSON(json) {
    if (/^[\],:{}\s]*$/.test(json.replace(/\\["\\\/bfnrtu]/g, '@').
        replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
        replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
    } else {
        return false;
    }
}