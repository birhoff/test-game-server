'use strict';
var WorldManager = require("./WorldManager"),
    Player = require("./Player"),
    GameMath = require("./math");

var config = require('config'),
    worldManager = new WorldManager(1000 / config.get("game-server:updateWorldInterval"));

var players = {
    test: {name: "test", position: new GameMath.Vector3(0, 0, 0)},
    test1: {name: "test1", position: new GameMath.Vector3(0, 0, 0)},
    test2: {name: "test2", position: new GameMath.Vector3(0, 0, 0)}
};

var updateWorld = (function () {
    var currentTick = 0;

    return function () {
        var currentWorld = worldManager.copyLast(),
            changes = worldManager.getWorldChanges();

        currentWorld.tick = currentTick++;

        changes.changes.forEach(function (change) {
            if (change.cmd === "AddPlayer") {
                var playerName = change.name,
                    newPlayer = new Player(playerName, players[playerName].position);
                currentWorld.players[playerName] = newPlayer;
            }
        });

        worldManager.add(currentWorld);
    };
})();

setInterval(updateWorld, config.get("game-server:updateWorldInterval"));
setInterval(updateClients, config.get("game-server:updateClientsInterval"));
setInterval(debugInfo, 5 * 1000);