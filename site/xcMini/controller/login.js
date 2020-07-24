const query = require('../../../bus/mysqlDal');
const redisClient = require('../../../bus/redisAdapter');
const Config = require('../../../utils/config.js');
const WXBizDataCrypt = require('../../../bus/WXBizDataCrypt');
const auth = require('../../../utils/auth')

let controller = {
    /**
     * 登录
     * @param ctx
     * @returns {Promise<void>}
     */
    login : async ctx => {
        try {
            let params = ctx.request.body
            let openidData = await auth.getOpenid(params.code,Config.zypxkAppid,Config.zypxkAppSecret)
            let totalUser = await query(`select count(*) cnt from s_xc_user where openid = '${openidData.openid}'`)
            let selectUserSql = `select id,nickname,avatarUrl,phone,shareUserId,teacherName from s_xc_user where openid = '${openidData.openid}'`
            if (totalUser[0].cnt <= 0) {
                let insertUser
                if (params.shareUserId && params.shareUserId !== '' && params.shareUserId !== 'undefined') {
                    insertUser = await query(`insert into s_xc_user(openid,shareUserId) values('${openidData.openid}',${params.shareUserId})`)
                } else {
                    insertUser = await query(`insert into s_xc_user(openid) values('${openidData.openid}')`)
                }
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
                let userData = await query(selectUserSql)
                if (params.shareUserId && params.shareUserId !== '' && !userData[0].shareUserId) {
                    await query(`update s_xc_user set shareUserId = ${params.shareUserId} where openid = '${openidData.openid}'`)
                }
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

    /**
     * 授权用户信息
     * @param ctx
     * @returns {Promise<void>}
     */
    authUserInfo : async ctx => {
        try {
            let params = ctx.request.body
            let openidData = await auth.getOpenid(params.code,Config.zypxkAppid,Config.zypxkAppSecret)
            const sessionKey = openidData.session_key
            const pc = new WXBizDataCrypt(Config.zypxkAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            let selectUserSql = `select id,nickname,avatarUrl,phone from s_xc_user where openid = '${openidData.openid}'`
            let upDateUser = await query(`update s_xc_user set nickname='${data.nickName}',avatarUrl='${data.avatarUrl}' where openid = '${openidData.openid}'`)
            console.log(upDateUser)
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

    /**
     * 授权手机号
     * @param ctx
     * @returns {Promise<void>}
     */
    authPhone : async ctx => {
        try {
            let params = ctx.request.body
            let openidData = await auth.getOpenid(params.code,Config.zypxkAppid,Config.zypxkAppSecret)
            const sessionKey = openidData.session_key
            const openId = openidData.openid
            const pc = new WXBizDataCrypt(Config.zypxkAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const phone = data.phoneNumber
            let userData = await query(`select userType from s_xc_user where openid = '${openId}'`)
            let updateData = await query(`update s_xc_user set phone = ${phone},userType = ${userData[0].userType === 2?2:1} where openid = '${openId}'`)
            if (updateData.affectedRows >= 1) {
                let userData = await query(`select id,nickname,avatarUrl,phone from s_xc_user where openid = '${openId}'`)
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
