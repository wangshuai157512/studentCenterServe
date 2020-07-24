const query = require('../../../bus/mysqlDal')
const controller = {
    getUserList : async ctx => {
        try {
            let { page } = ctx.request.query
            let userTotal = await query(`select count(*) cnt from s_youxuepei_user`)
            let userList = await query(`select id,nickname,avatarUrl,phone from s_youxuepei_user limit ${(page-1)*20},20`)
            ctx.body = {
                code : 1,
                data : userList,
                total : userTotal[0].cnt
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '获取失败',
                err : e
            }
        }
    },
    getFormUserList : async ctx => {
        try {
            let { page , startTime , endTime ,channel } = ctx.request.query
            let getSql = `select u.id,u.name,u.phone,u.marks,c.channel_name,DATE_FORMAT(u.create_time,'%Y-%m-%d %H:%i:%s') create_time
            from s_youxuepei_form_user u
            left join s_youxuepei_channel c
            on u.channel = c.id
            where 1 = 1`
            let getSqlTotal = `select count(*) total from s_youxuepei_form_user where 1 = 1`
            if ((startTime && endTime) && (startTime !== 'null' && endTime !== 'null')) {
                startTime = `${startTime} 00:00:00`
                endTime = `${endTime} 23:59:59`
                getSql += ` and u.create_time Between '${startTime}' and '${endTime}'`
                getSqlTotal += ` and create_time Between '${startTime}' and '${endTime}'`
            }
            if (channel) {
                getSql += ` and u.channel=${channel}`
                getSqlTotal += ` and channel=${channel}`
            }
            getSql += ` order by u.create_time desc`
            if (page && page !== 'null') {
                getSql += ` limit ${(page-1)*10},10`
            }
            let userData = await query(getSql)
            let userTotal = await query(getSqlTotal)

            ctx.body = {
                code : 1,
                data : userData,
                total : userTotal[0].total
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '获取失败'
            }
        }
    },
    delUser : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_youxuepei_form_user where id = ${id}`)
            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '删除成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '删除失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '删除失败',
                err : e
            }
        }
    },
    getChannel : async ctx => {
        try {
            let data = await query(`select id,channel_name from s_youxuepei_channel`)
            ctx.body = {
                code : 1,
                data
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '获取失败',
                err : e
            }
        }
    },
    addChannel : async ctx => {
        try {
            let name = ctx.request.body.name
            let insertData = await query(`insert into s_youxuepei_channel(channel_name) values('${name}')`)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '添加成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '添加失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '添加失败',
                err : e
            }
        }
    },

    delChannel : async ctx => {
        try {
            let id = ctx.request.body.id
            let delData = await query(`delete from s_youxuepei_channel where id = ${id}`)

            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '删除成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '删除失败'
                }
            }

        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '删除失败',
                err : e
            }
        }
    }
}

module.exports = controller
