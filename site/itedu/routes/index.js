const login = require('./login');
const evaluation = require('./evaluation');
const course = require('./course');
const count = require('./count');
const admin = require('./admin')
const upload = require('./upload')

module.exports = (app) => {
	app.use(login.routes(),login.allowedMethods());
	app.use(evaluation.routes(),evaluation.allowedMethods());
	app.use(course.routes(),course.allowedMethods());
	app.use(count.routes(),count.allowedMethods());
	app.use(admin.routes(),admin.allowedMethods());
	app.use(upload.routes(),upload.allowedMethods());
}
