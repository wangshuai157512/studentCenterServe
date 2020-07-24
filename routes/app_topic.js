const router = require('koa-router')()
const axios = require('axios')
const crypto = require('crypto')
const baseUrl = require('../service/baseUrl');
const isTest = false
const URL = isTest ?
    'http://211.167.76.161:8599/testexam/auth/ots'
     :
    'http://ots3.chinaedu.net/oxer/auth/ots'
const config = {
    key : 'chinaedu',
    sso : 'checkmd5',
    userId : 'test',
    role : 'teacher',
    tenant :  isTest ? 'chengjiao' : 'chengkao',
}

router.prefix(baseUrl.baseUrl+'/api/app_topic')

router.get ('/get_question_list', async (ctx) => {
    //type 0:教资
    if (parseInt(ctx.request.query.type) === 0) {
        config.tenant = 'hcxy2019'
    }else {
        config.tenant = 'chengkao'
    }
    let md5 = crypto.createHash('md5')
    let timestamp = new Date().getTime()
    let action = 'queryArrangements'
    let st = md5.update(
        `${config.userId}${config.role}${timestamp}${action}${config.key}`
    ).digest('hex');
    let res = await axios.get(`${URL}`,{params : {
            ...config,
            st,
            action,
            timestamp
        }})
    console.log(res)
    ctx.body = {
        data : res.data
    }
})
router.get('/get_question_detail', async (ctx) => {
    if (parseInt(ctx.request.query.type) === 0) {
        config.tenant = 'hcxy2019'
    }else {
        config.tenant = 'chengkao'
    }
    let id = ctx.request.query.id
    let md5 = crypto.createHash('md5')
    let timestamp = new Date().getTime()
    let action = 'getAnswerPaper'
    let arrangementId = id
    let st = md5.update(
        `${config.userId}${config.role}${timestamp}${action}${config.key}`
    ).digest('hex');
    let res = await axios.get(`${URL}`,{
        params : {
            ...config, st, arrangementId, action, timestamp
        }
    })
    console.log(res)
    ctx.body = {
        data : res.data
    }
})

router.get('/get_course_info',async (ctx) => {
    if (parseInt(ctx.request.query.type) === 0) {
        config.tenant = 'hcxy2019'
    }else {
        config.tenant = 'chengkao'
    }
    let id = ctx.request.query.id
    let md5 = crypto.createHash('md5')
    let timestamp = new Date().getTime()
    let action = 'getSimpleTestInfo'
    let arrangementId = id
    let st = md5.update(
        `${config.userId}${config.role}${timestamp}${action}${config.key}`
    ).digest('hex');
    let res = await axios.get(`${URL}`,{
        params : {
            ...config , st, arrangementId, action, timestamp
        }
    })
    ctx.body = {
        data : res.data
    }
})

module.exports = router
