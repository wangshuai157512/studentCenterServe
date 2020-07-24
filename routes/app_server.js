const router = require('koa-router')()
const baseUrl = require('../service/baseUrl');
const sign = require('../service/sign')
const rediscli = require('../bus/redisAdapter')
const axios = require('axios')
const config = {
    'wx5766328e8cf6a21a' : '4dcb20c7b85d24591d01197ad9997e4c',
}
const query = require('../bus/mysqlDal')
router.prefix(baseUrl.baseUrl+'/api/app_server')

router.post('/encryption',async ctx => {
    try {
        let appId = ctx.request.body.appid
        let url = ctx.request.body.url
        let getSecret = await query(`select appid,secret from s_study_center_share_config where appid = '${appId}'`)
        console.log('参数',ctx.request.body)
        if (getSecret.length < 1) {
            ctx.body = {
                code : 0,
                msg : '请先添加appid和secret'
            }
            return
        }

        // let secret = config[appId]
        let secret = getSecret[0].secret
        let access_token,jsapi_ticket;
        let access_token_total = await query(`select * from s_study_center_access_token where appid = '${appId}'`)
        if (access_token_total.length === 0) {
            let access_token_data = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${secret}`)
            access_token = access_token_data.data.access_token
            console.log('获取的access_token',access_token)
            console.log('获取的access_token2',access_token_data)
            if (access_token) {
                let jsapi_ticket_data = await axios(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=jsapi`)
                if (jsapi_ticket_data.data.errcode === 0) {
                    jsapi_ticket = jsapi_ticket_data.data.ticket
                    console.log('获取的jsapi_ticket',jsapi_ticket)
                    let end_time = await query(`select DATE_FORMAT(DATE_ADD(NOW(),INTERVAL 3600 SECOND),'%Y-%m-%d %H:%i:%s') end_time`)
                    await query(`insert into s_study_center_access_token(access_token,jsapi_ticket,appid,end_time) values('${access_token}','${jsapi_ticket}','${appId}','${end_time[0].end_time}')`)
                }else {
                    ctx.body = {
                        success : false,
                        err : 'jsapi_ticket_data获取失败'
                    }
                }
            }else {
                ctx.body = {
                    success : false,
                    err : 'access_token获取失败'
                }
            }
        }else {
            access_token = access_token_total[0].access_token
            jsapi_ticket = access_token_total[0].jsapi_ticket
        }
        let signData = sign(jsapi_ticket, url)
        signData.appid = appId
        ctx.body = {
            success : true,
            data : signData
        }
    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})

router.post('/addShareConfig', async ctx => {
    try {
        let { appid , secret , domain } = ctx.request.body
        if (!appid || !secret || !domain) {
            ctx.body = {
                code : 0,
                msg : '缺少必要参数'
            }
            return
        }
        let insertData = await query(`insert into s_study_center_share_config(appid,secret,domain) values('${appid}','${secret}','${domain}')`)
        if (insertData.affectedRows === 1) {
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
            err : e
        }
    }
})

router.get('/getAppidList' , async ctx => {
    try {
        let data = await query(`select id,appid,domain from s_study_center_share_config`)
        ctx.body = {
            code : 1,
            data : data
        }
    }catch (e) {
        ctx.body = {
            code : 0,
            err : e
        }
    }
})

router.post('/deleteAppid', async ctx => {
    try {
        let { id } = ctx.request.body
        let delData = await query(`delete from s_study_center_share_config where id = ${id}`)
        if (delData.affectedRows === 1) {
            ctx.body = {
                code : 1
            }
        }
    }catch (e) {
        cts.body = {
            code : 0,
            err : e
        }
    }
})

router.post('/login' , async ctx => {
    try {
        let { user, pass } = ctx.request.body
        let userTotal = await query(`select count(*) cnt from s_base_user where username='${user}' and password='${pass}'`)
        if (userTotal[0].cnt >= 1) {
            ctx.body = {
                code : 1
            }
        } else {
            ctx.body = {
                code : 0
            }
        }
    }catch (e) {
        ctx.body = {
            code : 0,
            err : e
        }
    }
})


module.exports = router
