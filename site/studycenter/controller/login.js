const Axios = require('axios')
const redisClient = require('../../../bus/redisAdapter')
const controller = {
    getUserInfo : async ctx => {
        try {
            const code = ctx.request.body.code;
            // consoel.log(code)
            const res = await Axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
                params: {
                    appid: 'wx5766328e8cf6a21a',
                    secret: '4dcb20c7b85d24591d01197ad9997e4c',
                    code: code,
                    grant_type: 'authorization_code'
                }
            })
            if(res.data.openid){
                const access_token = res.data.access_token
                const openid = res.data.openid
                redisClient.set(access_token, access_token);
                const newRes = await Axios.get('https://api.weixin.qq.com/sns/userinfo', {
                    params: {
                        access_token: access_token,
                        openid: openid,
                        lang: 'zh_CN'
                    }
                })
                if(newRes.data.nickname){
                    ctx.body = {
                        success: true,
                        msg:{
                            nickname:newRes.data.nickname,
                            headimgurl:newRes.data.headimgurl
                        }
                    }
                }else{
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                }
            }else{
                ctx.body = {
                    success: false,
                    err: '系统异常！'
                }
            }
        } catch (err) {
            ctx.body = {
                success: false,
                err: err.message
            }
        }
    }
}

module.exports = controller
