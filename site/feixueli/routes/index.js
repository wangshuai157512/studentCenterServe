const login = require('./login')
const admin = require('./admin')
const formData = require('./formData')
module.exports = (app) => {
    app.use(login.routes(),login.allowedMethods());
    app.use(admin.routes(),admin.allowedMethods());
    app.use(formData.routes(),formData.allowedMethods());
}
