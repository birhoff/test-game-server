'use strict';

var Vector3 = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vector3.prototype.toString = function () {
    return this.x + ";" + this.y + ";" + this.z;
};

Vector3.prototype.equal = function (vector) {
    if (!(vector instanceof Vector3)) return false;

    if (this.x !== vector.x)return false;
    if (this.y !== vector.y)return false;
    if (this.z !== vector.z)return false;
    return true;
};

module.exports.Vector3 = Vector3;
