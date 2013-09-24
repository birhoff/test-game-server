'use strict';
var Vector3 = require("./math").Vector3;

var Player = function (name, position) {
    this.name = name;
    this.position = position || new Vector3(0, 0, 0);
};

Player.prototype.clone = function () {
    return new Player(this.name, this.position);
};

module.exports = Player;
