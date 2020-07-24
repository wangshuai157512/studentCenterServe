const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const redisClient = require('../bus/redisAdapter');
const sign = require('../service/signService.js');
const Axios = require('axios');
const baseUrl = require('../service/baseUrl');
const Config = require('../utils/config.js');

router.prefix(baseUrl.baseUrl+'/api/app_question')

// 获取微信信息
router.post('/getMsg', async(ctx, next) => {
    try {
        const code = ctx.request.body.code;
        const res = await Axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
        params: {
          appid: Config.appid,
          secret: Config.secret,
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
                //添加浏览次数
                // var pcSql = 'select * from s_question_user where user = ? and avatarUrl = ?';
                // var pcParams = [newRes.data.nickname,newRes.data.headimgurl]
                // var pcRes = await query(pcSql,pcParams);
                // if(pcRes[0]){
                //     var updateSql = 'update s_question_user set browseNum = "'+(pcRes[0].browseNum + 1)+'" where user = ? and avatarUrl = ?';
                //     var updateRes = await query(updateSql,pcParams);
                // }else{
                //     var insertSql = 'INSERT INTO s_question_user (user,avatarUrl,browseNum) values (?,?,1)';
                //     var insertRes = await query(insertSql,pcParams)
                // }

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
})

// 签名
router.post('/signture', async(ctx, next) => {
    try {
        const signUrl = ctx.request.body.signUrl;
        const url = 'https://api.weixin.qq.com/cgi-bin/token';
        const res = await Axios.get(url, {
            params: {
              appid: Config.appid,
              secret: Config.secret,
              grant_type: 'client_credential'
            }
        })
        if(res.data.access_token){
            const access_token = res.data.access_token
            const newRes = await Axios.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
                params: {
                  access_token: access_token,
                  type:'jsapi'
                }
            })
            if (parseInt(newRes.data.errcode) === 0) {
                const ticket = newRes.data.ticket;
                // 通过调用计算签名方法
                const signatureStr = sign(ticket, signUrl);
                // 当前时间戳
                signatureStr.deadline = new Date().getTime();
                // 返回给页面
                ctx.body = {
                    success: true,
                    msg: signatureStr
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
})

// 获取统计用户信息
router.post('/getUser', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql = 'select * from s_question_user limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_question_user";
            const newRes = await query(newSql);
            ctx.body = {
                success: true,
                data: res,
                total:newRes[0].cnt
            }
        } else {
            ctx.body = {
                success: false,
                err: 'err'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

module.exports = router