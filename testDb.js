var mongoose = require('lib/mongoose');
var async = require('async');

async.series([
    open,
    dropDatabase,
    createUsers,
    close
], function(err) {
    console.log(arguments);
});

function open(callback) {
    mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;
    db.dropDatabase(callback);
}

function createUsers(callback) {
    require('models/user');

    var users = [
        {username: 'test', password: 'test', email: 'test@test.ts'}
    ];

    async.each(users, function(userData, callback) {
        var user = mongoose.models.User.create(userData);
        user.save(callback);
    }, callback);
}

function close(callback) {
    mongoose.disconnect(callback);
}