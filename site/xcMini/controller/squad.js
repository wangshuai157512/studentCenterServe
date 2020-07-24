const query = require('../../../bus/mysqlDal');
const config = require('../../../utils/config')
const dateTime = require('../../../utils/dateTime')
const axios = require('axios')

let controller = {
    getUserList : async (squadId) => {
        let squadDataList = await query(`select id,createUserId,classId,squadState,DATE_FORMAT(createTime,'%Y-%m-%d %H:%i:%s') createTime from s_xc_squad where id = ${squadId}`)

        let squadData = squadDataList[0]
        let squadUserList = await query(`select u.id,u.nickname,u.avatarUrl,u.shareUserId from 
        s_xc_squad_user s
        left join s_xc_user u
        on s.userId = u.id
        and s.userId is not null
        where squadId = ${squadData.id}
        order by s.id
        `)
        // let squadUserList = await query(`select u.id,u.nickname,u.avatarUrl,u.shareUserId,t.squadState from
        // s_xc_squad_user s
        // inner join s_xc_user u
        // on s.userId = u.id
        // and s.userId is not null
        // inner join s_xc_squad t on t.id = s.squadId
        // where squadId = ${squadData.id}`)
        squadData.userList = squadUserList
        return squadData
    },
    getSquadState : async (userId,classId) => {
        let sc = await query(`select count(*) c from s_xc_squad where createUserId = ${userId} and classId = ${classId} and squadState <> 0`)
        if (sc[0].c > 0) {
            return true
        }
        return false
    },
    getEnterState : async(userId,classId) => {
        let et = await query(`select count(*) c from s_xc_squad_user a left join s_xc_squad b on a.squadId = b.id where a.userId = ${userId} and a.classId = ${classId} and a.userId <> b.createUserId and b.squadState <> 0`)
        if (et[0].c > 0) {
            return true
        }
        return false
    },

    // 开团
    createSquad : async ctx => {
        let { userId,classId } = ctx.request.body
        let scState = await controller.getSquadState(userId,classId)
        if (scState) {
            ctx.body = {
                code : 0,
                err : '您已经创建过该团了'
            }
        } else {
            let insertSquadData = await query(`insert into s_xc_squad(createUserId,classId) values(${userId},${classId})`)
            console.log(insertSquadData)
            if (insertSquadData.affectedRows === 1) {
                let squadId = insertSquadData.insertId
                console.log(classId)
                let insertSquadUserData = await query(`insert into s_xc_squad_user(squadId,userId,classId) values(${squadId},${userId},${classId})`)
                if (insertSquadUserData.affectedRows === 1) {
                    let squadData = await controller.getUserList(squadId)
                    ctx.body = {
                        code : 1,
                        squadUserList : squadData
                    }

                } else {
                    ctx.body = {
                        code : 0,
                        err : '加入小队失败'
                    }
                }
            } else {
                ctx.body = {
                    code : 0,
                    err : '创建小队失败'
                }
            }
        }
    },

    // 是否开过团
    getSquadStatus : async ctx => {
        let { userId,classId } = ctx.request.body
        let scState = await controller.getSquadState(userId,classId)
        let etState = await controller.getEnterState(userId,classId)
        if (scState || etState) {
            let squadDataList
            if(scState) {
                squadDataList = await query(`select id,createUserId,classId,squadState from s_xc_squad where createUserId = ${userId} and classId = ${classId} and squadState <> 0`)
                console.log(squadDataList,'这是创建过团')
            }
            if(etState){
                 squadDataList = await query(`select a.squadId id,a.classId from s_xc_squad_user a left join s_xc_squad b on a.squadId = b.id where a.userId = ${userId} and a.classId = ${classId} and b.squadState <> 0`)
                 console.log(squadDataList,'这是加入过团')
            }
            console.log(squadDataList,'这是最终结果')
            let squadData = squadDataList[0]
            ctx.body = {
                code : 1,
                data : {
                    isCreate: scState,
                    isEnter: etState,
                    squadId : squadData.id
                }
            }
        } else {
            ctx.body = {
                code : 1,
                data : null
            }
        }
    },

    // 获取人数
    getSquadUser : async ctx => {
        let { squadId } = ctx.request.body
        let squadData = await controller.getUserList(squadId)
        ctx.body = {
            code : 1,
            squadUserList : squadData
        }
    },

    subMsg : async(openId,materialName,squadId,userId,classId)=> {
        let appid = config.zypxkAppid
        let secret = config.zypxkAppSecret
        let myDate = new Date()
        myDate = dateTime.formatTime(myDate)
        console.log(openId,777)
        let data = await axios({
            url : `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            method : 'get',
        })
        let accessToken = data.data.access_token
        let takeMsg = await axios({
            url : `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
            method: 'post',
            data : {
                    "touser": openId,
                    "template_id": "ghNxgfgBjhH7SL8i6w75BZauADub3ukGUG38sdcixKc",
                    "page": `pages/group/group?squadId=${squadId}&userId=${userId}&classId=${classId}`,
                    // "miniprogram_state":"trial",
                    "data": {
                        "thing1": {
                            "value": materialName
                        },
                        "phrase2": {
                            "value": "成功"
                        },
                        "thing5": {
                            "value": "恭喜~点击下载备考资料>>"
                        }
                    }
            }

        })
        console.log(takeMsg.data,'开团成功')
    },

    // 加入团
    addSquad : async ctx => {
        try {
            let { squadId,userId,classId } = ctx.request.body
            let insertStatus = await query(`insert into s_xc_squad_user(squadId,userId,classId) values(${squadId},${userId},${classId})`)
            if (insertStatus.affectedRows >= 1) {
                let updateState  =await query(`update s_xc_squad set squadState = 1 where id = ${squadId}`)
                let openId = await query(`select u.openid from s_xc_squad s left join s_xc_user u on s.createUserId = u.id where s.id = ${squadId}`)
                let materialListName = await query(`select materialName from s_xc_class_category where id = ${classId}`)
                let materialName = materialListName[0].materialName
                // for(var i=0; i<openId.length;i++ ) {
                    let resultOpenId = openId[0].openid
                    controller.subMsg(resultOpenId,materialName,squadId,userId,classId)
                // }

                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0,
                    err : '小队加入失败'
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    // 我的拼团
    getMySquad : async ctx => {
        try {
            let {userId} = ctx.request.query
            let mySquadDate = await query(`select u.id,u.nickname,u.avatarUrl,u.shareUserId,t.squadState from 
            s_xc_squad_user s
            inner join s_xc_user u
            on s.userId = u.id
            and s.userId is not null
            inner join s_xc_squad t on t.id = s.squadId
            where u.id = ${userId}`)
            ctx.body = {
                code : 1,
                data : mySquadDate
            }

        }catch(e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    //我的拼团列表
    getMySquadList : async ctx => {
        try {
            let { userId,type } = ctx.request.query
            let sql = `select sq.id squadId,sc.id classId,sc.materialName,sc.materialImg,sc.materialIntroduction,sc.materialTag,DATE_FORMAT(sq.createTime,'%Y-%m-%d %H:%i:%s') createTime,sq.squadState
            from s_xc_squad_user su
            join s_xc_squad sq
            on su.squadId = sq.id
            join s_xc_class_category sc
            on su.classId = sc.id
            where su.userId = ${userId}
            `
            if (type) {
                sql += ` and sq.squadState = ${type}`
            }
            let getMySquadList = await query(sql)
            for (let i = 0; i < getMySquadList.length; i++) {
                if (!getMySquadList[i].materialTag) {
                    getMySquadList[i].materialTag = []
                } else {
                    getMySquadList[i].materialTag = getMySquadList[i].materialTag.split(',')
                }
            }
            ctx.body = {
                code : 1,
                data : getMySquadList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getSquadStateApi : async ctx => {
        try {
            let { userId, classId } = ctx.request.query
            let squadState = await query(`select sq.id squadId,sq.squadState,su.classId
            from s_xc_squad_user su
            join s_xc_squad sq
            on su.squadId = sq.id
            where su.userId = ${userId}
                and su.classId = ${classId}
                and sq.squadState <> 0
            `)
            ctx.body = {
                code : 1,
                data : squadState[0] || {}
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    /**
     * 删除团
     */
    deleteSquad : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_xc_squad where id = ${id}`)
            let delUser = await query(`delete from s_xc_squad_user where squadId = ${id}`)
            ctx.body = {
                code : 1,
                msg : '删除成功'
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
