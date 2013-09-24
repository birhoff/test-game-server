'use strict';

var EventHandler = function () {
    this._events = {};
};

EventHandler.prototype.register = function (event, callback) {
    if (!event || !callback)return;

    if (!this._events[event]) {
        this._events[event] = [];
    }

    this._events[event].push(callback);
};

EventHandler.prototype.dispatch = function (event, args) {
    if (!event) return;
    if (!this._events[event]) return;
    if (args && !(args instanceof Array)) {
        args = [args];
    }


    this._events[event].forEach(function (callback) {
        if (!callback) return;
        callback.apply(args);

    });
};

module.exports = EventHandler;
