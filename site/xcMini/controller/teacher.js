const query = require('../../../bus/mysqlDal');

let controller = {
    addTeacherName : async ctx => {
        try {
            let {userId, name, city} = ctx.request.body
            let  nameList = await query(`update s_xc_user set teacherName = '${name}',teacherCity = '${city}',userType = 2 where id = ${userId}`)
            if (nameList.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '更新成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '更新失败'
                }
            }

        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    getTeacherName : async ctx => {
        try {
            let {userId} = ctx.request.body
            let  getName = await query(`select teacherName,teacherCity from s_xc_user where id = ${userId}`)
            let teacherName = getName[0].teacherName
            if (teacherName) {
                ctx.body = {
                    code : 1,
                    data : getName[0],
                    msg : '已存在该老师名字'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '不存在该老师，请添加'
                }
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
