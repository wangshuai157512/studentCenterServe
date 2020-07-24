const auth = require('../../../utils/auth')
const WXBizDataCrypt = require('../../../bus/WXBizDataCrypt');
const config = require('../../../utils/config')
const query = require('../../../bus/mysqlDal')
const controller = {
    authUserInfo : async ctx => {
        try {
            let params = ctx.request.body
            let openidData = await auth.getOpenid(params.code,config.feixueliAppid,config.feixueliAppSecret)
            const sessionKey = openidData.session_key
            const pc = new WXBizDataCrypt(config.feixueliAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            let selectUserSql = `select id,nickname,avatarUrl,phone from s_youxuepei_user where openid = '${openidData.openid}'`
            let upDateUser = await query(`update s_youxuepei_user set nickname='${data.nickName}',avatarUrl='${data.avatarUrl}' where openid = '${openidData.openid}'`)
            if (upDateUser.affectedRows === 1) {
                let userInfo = await query(selectUserSql)
                ctx.body = {
                    code : 1,
                    data : userInfo[0]
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '更新失败'
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '授权失败',
                err : e
            }
        }
    },
    login : async ctx => {
        try {
            let params = ctx.request.body
            let openidData = await auth.getOpenid(params.code,config.feixueliAppid,config.feixueliAppSecret)
            console.log(JSON.stringify(openidData))
            console.log(params.code)
            let totalUser = await query(`select count(*) cnt from s_youxuepei_user where openid = '${openidData.openid}'`)
            let selectUserSql = `select id,nickname,avatarUrl,phone from s_youxuepei_user where openid = '${openidData.openid}'`
            if (totalUser[0].cnt <= 0) {
                let insertUser = await query(`insert into s_youxuepei_user(openid) values('${openidData.openid}')`)
                if (insertUser.affectedRows >= 1) {
                    let userInfo = await query(selectUserSql)
                    ctx.body = {
                        code : 1,
                        data : userInfo[0],
                        msg : '添加成功'
                    }
                }else {
                    ctx.body = {
                        code : 0,
                        data : null,
                        msg : '添加失败'
                    }
                }
            }else {
                let userInfo = await query(selectUserSql)
                ctx.body = {
                    code : 1,
                    data : userInfo[0]
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '登录失败'
            }
        }
    },
    authPhone : async ctx => {
        try {
            let params = ctx.request.body
            let openidData = await auth.getOpenid(params.code,config.feixueliAppid,config.feixueliAppSecret)
            const sessionKey = openidData.session_key
            const openId = openidData.openid
            const pc = new WXBizDataCrypt(config.feixueliAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const phone = data.phoneNumber
            let updateData = await query(`update s_youxuepei_user set phone = ${phone} where openid = '${openId}'`)
            if (updateData.affectedRows >= 1) {
                let userData = await query(`select id,nickname,avatarUrl,phone from s_youxuepei_user where openid = '${openId}'`)
                ctx.body = {
                    code : 1,
                    data : userData[0]
                }
            } else {
                ctx.body = {
                    code : 0,
                    err : '授权失败'
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '授权失败',
                err : e
            }
        }
    }
}

module.exports = controller
