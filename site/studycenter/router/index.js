const check = require('./check')
const login = require('./login')
module.exports = (app) => {
	app.use(check.routes(),check.allowedMethods());
	app.use(login.routes(),login.allowedMethods());
}
