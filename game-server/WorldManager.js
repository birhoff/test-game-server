'use strict';
var GameWorld = require("./GameWorld");

var WorldManager = function (limit) {
    this.clientsWorld = null;
    this.history = [];
    this.worldChanges = [];

    this._historyLimit = limit || 67;
};

WorldManager.prototype.add = function (world) {
    if (!(world instanceof GameWorld)) return;

    // if maximum states existed
    if (this.states.length > this._historyLimit) {
        this.states.splice(this._historyLimit);
    }

    this.states.unshift(world);
};

WorldManager.prototype.updateClientWorld = function (world) {
    if (!(world instanceof GameWorld)) return;

    this.clientsWorld = world;
};

WorldManager.prototype.createSnapshot = function (serverWorld) {
    if (!this.states.length || !(serverWorld instanceof GameWorld))
        return new GameWorld();

    var clientState = this.clientState,
        serverState = serverWorld;

    if (!clientState) return serverState;

    var snapshot = new GameWorld();
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

WorldManager.prototype.getWorldChanges = function () {
    var copy = this.worldChanges.splice(0, 0);
    this.worldChanges.splice(0);
    return copy;
};

WorldManager.prototype.copyLast = function () {
    if (!this.worldChanges.length)
        return new GameWorld();

    return this.worldChanges[0].clone();
};


module.exports = WorldManager;