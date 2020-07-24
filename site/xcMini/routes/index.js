const login = require('./login');
const admin = require('./admin');
const course = require('./course');
const channel = require('./channel');
const createCode = require('./createCode');
const user = require('./user');
const squad = require('./squad');
const teacher = require('./teacher');
const material = require('./material')
const concatCheck = require('./concatCheck')
const concat = require('./concat')
module.exports = (app) => {
    app.use(login.routes(),login.allowedMethods());
    app.use(admin.routes(),admin.allowedMethods());
    app.use(course.routes(),course.allowedMethods());
    app.use(channel.routes(),channel.allowedMethods());
    app.use(createCode.routes(),createCode.allowedMethods());
    app.use(user.routes(),user.allowedMethods());
    app.use(squad.routes(),squad.allowedMethods());
    app.use(teacher.routes(),teacher.allowedMethods());
    app.use(material.routes(),material.allowedMethods());
    app.use(concatCheck.routes(),concatCheck.allowedMethods());
    app.use(concat.routes(),concat.allowedMethods());
}
