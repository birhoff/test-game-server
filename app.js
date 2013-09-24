'use strict';

var network = require("./network");
network.listen();

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(3000);

var tickTime = 15,
    updateTime = 1000 / 20;

io.set('log level', 1);

io.sockets.on('connection', function (socket) {
    socket.on('message', function (messageText) {

        if (!isJSON(messageText)) {
            socket.send(new Response("Error", "This service work only with JSON: " + messageText));
            return;
        }

        var message = JSON.parse(messageText);
        if (!message) return;

        if (message.type === "PlayerUpdate") {
            worldChanges.changes.push({cmd: "login", name: message.args.name});
            socket.send(new Response("WorldUpdate", worldHistory.states[0]));
            return;
        }

        if (message.type === "PlayerLogin") {
            var name = message.name;
            if (players[name]) {
                var data = {
                    name: name,
                    position: players[name].position
                };

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

function updatePlayers() {
    var state = worldHistory.states[0] || new World();
    var snapshot = worldHistory.createSnapshot(state);

    worldHistory.updateClient(state);
    io.sockets.send(new Response("WorldUpdate", snapshot));
}

var Response = function (type, data) {
    this.type = type || "message";
    this.data = data || {};
    return this.toString();
};

Response.prototype.toString = function () {
    return JSON.stringify(this);
};

var World = function () {
    this.tick;
    this.players = {};
};

World.prototype.clone = function () {
    var newWorld = new World();
    newWorld.tick = this.tick;
    newWorld.players = this.players;
    return newWorld;
};

var WorldStates = function () {
    this.states = [];
    this.clientState;
};

WorldStates.prototype.add = function (world) {
    if (!(world instanceof World)) return;

    var availableStates = 1000 / tickTime;

    // if maximum states existed
    if (this.states.length > availableStates) {
        this.states.splice(availableStates);
    }

    this.states.unshift(world);
};

WorldStates.prototype.updateClient = function (state) {
    this.clientState = state;
};

WorldStates.prototype.createSnapshot = function (serverState) {
    if (!this.states.length) return new World();

    var clientState = this.clientState;

    if (!clientState) return serverState;

    var snapshot = new World();
    snapshot.tick = serverState.tick;

    Object.keys(clientState.players).forEach(function (name) {

        /* Player remove */
        if (!clientState.players[name]) {
            snapshot.players[name] = clientState.players[name];
            snapshot.players[name].position = null;
            return;
        }

        if (!serverState.players[name].position.equal(clientState.players[name].position)) {
            snapshot.players[name] = serverState.players[name];
            return;
        }
    });

    Object.keys(serverState.players).forEach(function (name) {
        /* new user */
        if (!clientState.players[name]) {
            snapshot.players[name] = serverState.players[name];
            return;
        }
    });

    return snapshot;
};

var Player = function (name, position) {
    this.name = name;
    this.position = position;
};

var Position = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Position.prototype.equal = function (position) {
    if (!(position instanceof Position)) return false;

    if (this.x !== position.x)return false;
    if (this.y !== position.y)return false;
    if (this.z !== position.z)return false;
    return true;
};

Position.prototype.toString = function () {
    return this.x + ";" + this.y + ";" + this.z;
};

var WorldChanges = function () {
    this.changes = [];
};

var players = {
    test: {name: "test", position: new Position(0, 0, 0)},
    test1: {name: "test1", position: new Position(0, 0, 0)},
    test2: {name: "test2", position: new Position(0, 0, 0)}
};


var onlinePlayers = {};

var worldHistory = new WorldStates();
var worldChanges = new WorldChanges();

var tick = 0;

var updateWorld = function () {

    var lastWorld = (worldHistory.states[0] || new World());
    var currentWorld = new World();//(worldHistory.states[0] || new World()).clone();
    currentWorld.tick = tick++;

    Object.keys(lastWorld.players).forEach(function (name) {
        currentWorld.players[name] = lastWorld.players[name];
    });

    worldChanges.changes.forEach(function (change) {
        if (change.cmd === "login") {
            var playerName = change.name,
                newPlayer = new Player(playerName, players[playerName].position);
            currentWorld.players[playerName] = newPlayer;
        }
    });
    worldChanges.changes = [];

    worldHistory.add(currentWorld);
};

function debugInfo() {
    console.log(worldHistory.clientState);
}

setInterval(updateWorld, tickTime);
setInterval(updatePlayers, updateTime);
setInterval(debugInfo, 5 * 1000);

