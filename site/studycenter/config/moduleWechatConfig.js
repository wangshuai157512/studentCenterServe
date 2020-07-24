const sha1 = require('../../../utils/encryption').sha1
const config = require('./config')
const main = (ctx) => {
    let signature = ctx.query.signature
    let echostr = ctx.query.echostr
    let timestamp = ctx.query.timestamp
    let nonce = ctx.query.nonce
    let Token = config.wechat.Token
    let sha1Data = sha1([Token,timestamp,nonce].sort().join(''))
    if (sha1Data === signature) {
        ctx.body = echostr
    }
}

module.exports = main
