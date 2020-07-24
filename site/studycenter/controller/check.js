const moduleWechatConfigMain = require('../config/moduleWechatConfig')
const controller = {
    checkToken : async ctx => {
        if (!ctx.query.openid) moduleWechatConfigMain(ctx)
    }
}

module.exports = controller
