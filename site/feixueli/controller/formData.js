const query = require('../../../bus/mysqlDal')
const controller = {
    setData : async ctx => {
        try {
            let { name , phone , marks , channel } = ctx.request.body
            let getData = await query(`select count(*) cnt from s_youxuepei_form_user where phone = '${phone}'`)
            if (getData[0].cnt > 0) {
                ctx.body = {
                    code : 2,
                    msg : '手机号已存在'
                }
            } else {
                if (marks) {
                    await query(`insert into s_youxuepei_form_user(name,phone,marks,channel) values('${name}','${phone}','${marks}',${channel})`)
                } else {
                    await query(`insert into s_youxuepei_form_user(name,phone,channel) values('${name}','${phone}',${channel})`)
                }
                ctx.body = {
                    code : 1,
                    msg : '提交成功'
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '提交失败',
                err : e
            }
        }
    }
}

module.exports = controller
