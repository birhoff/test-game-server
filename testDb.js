var User = require('models/user');

var user = User.create({
    username: "test",
    email: "test@test.ru",
    password: "test"
});

user.save(function (err, user, affected) {
    if (err) throw err;

    User.findOne({username: "test"}, function (err, tester) {
        console.log(tester);
    });
});