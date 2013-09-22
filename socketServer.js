'use strict';

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var players = {
    test: {name: "test", position: "3;0;0"},
    test1: {name: "test1", position: "0;0;0"},
    test2: {name: "test2", position: "0;0;0"}
};

var onlinePlayers = {};

server.listen(3000);

io.set('log level', 1);

io.sockets.on('connection', function (socket) {
    socket.on('message', function (messageText) {

        if (!isJSON(messageText)) {
            socket.send(new Response("Error", "This service work only with JSON: " + messageText));
            return;
        }

        var message = JSON.parse(messageText);
        if (!message) return;

        if (message.type === "PlayerLogin") {
            var name = message.name;
            if (players[name]) {
                var data = {
                    name: name,
                    position: players[name].position
                }
                socket.broadcast.send(new Response("PlayerJoin", data));

                socket.set("name", name, function () {
                    data.players = [];
                    Object.keys(onlinePlayers).forEach(function (name) {
                        data.players.push(onlinePlayers[name]);
                    });
                    onlinePlayers[name] = players[name];
                    onlinePlayers[name].socket = socket.id;

                    socket.send(new Response("PlayerLogin", data));
                    console.log("Player log in: " + name);
                });

            } else {
                socket.send(new Response("Error", "This user doesn't exist"));
            }
            return;
        }

        if (message.type === "PlayerUpdate") {
            socket.get("name", function (err, name) {
                var player = onlinePlayers[name];
                var position = message.position;

                player.position = position;
                io.sockets.send(new Response("PlayerUpdate", {name: name, position: position}));
                return;
            });
            return;
        }

        if (message.type === "PlayerJoin") {
            socket.get("name", function (err, name) {
                if (!name) return;

            });
        }
    });

    socket.on('disconnect', function () {
        socket.get("name", function (err, name) {
            var player = onlinePlayers[name];
            if (!player)return;

            delete onlinePlayers[name];
            socket.broadcast.send(new Response("PlayerDisconnect", {name: name}));
            console.log("Player log out: " + name);
        });
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

var Response = function (type, data) {
    this.type = type || "message";
    this.data = data || {};
    return this.toString();
}

Response.prototype.toString = function () {
    return JSON.stringify(this);
};