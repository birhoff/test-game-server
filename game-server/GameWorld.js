'use strict';

var GameWorld = function () {
    this.tick;
    this.players;
};

GameWorld.prototype.clone = function () {
    var newWorld = new GameWorld();
    newWorld.tick = this.tick;

    newWorld.players = {};
    Object.keys(this.players).forEach(function (name) {
        newWorld.players[name] = this.players[name].clone();
    }.bind(this));

    return newWorld;
};