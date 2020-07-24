const query = require('../../../bus/mysqlDal');
const config = require('../../../utils/config')
const axios = require('axios')

let controller = {
    getShareList : async ctx => {
        try {
            let { id,page} = ctx.request.query
            page = page || 1
            let userData = await query(`select id,shareUserId,nickname,avatarUrl,phone,teacherName,userType,isEnter,DATE_FORMAT(createTime,'%Y-%m-%d %H:%i:%s') createTime from s_xc_user  where shareUserId = ${id} limit ${(page-1)*20},20`)
            ctx.body = {
                code : 1,
                data : userData
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }

    }
}

module.exports = controller
