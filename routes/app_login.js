const Axios = require('axios');
const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const redisClient = require('../bus/redisAdapter');
const common = require('../service/commonService');
const jwt = require('jsonwebtoken');
const Config = require('../utils/config.js');
const WXBizDataCrypt = require('../bus/WXBizDataCrypt');
const baseUrl = require('../service/baseUrl');

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

router.prefix(baseUrl.baseUrl+'/api/app_login')
// 登录接口
router.post('/login', async(ctx, next) => {
    try {
        const sql = 'select * from s_base_user where username = ? and password = ?';
        const params = [
            ctx.request.body.username,
            ctx.request.body.password
        ];
        const res = await query(sql, params);
        if (res && res.length > 0) {
            // var token = "token_" + guid();
            // redisClient.set(token, JSON.stringify(res[0]), 3600);
            const userMsg = {
                name:ctx.request.body.username,
            }
            const token = jwt.sign(userMsg, Config.tokenSecret, { expiresIn: "2h" });
            ctx.body = {
                success: true,
                token: token,
                user: res[0]
            }
        } else {
            ctx.body = {
                success: false,
                err: "用户名或密码不正确！"
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})
//自动登录
router.post('/autoLogin', async(ctx, next) => {
    try {
        const res = await common.getUserByToken(ctx.request.body.token);
        if (res) {
            ctx.body = {
                success: true
            }
        } else {
            ctx.body = {
                success: false
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//小程序端login(提升专本科)
router.post('/wxLogin', async(ctx, next) => {
    try {
        const code = ctx.request.body.code
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.appid,
              secret: Config.secret,
              js_code: code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const t = await common.setOpenId(res.data.openid)
            switch(t) {
                //该客户已登录过
                case (-1):
                    const newSql = 'select id,user,avatarUrl,token,share_num,openId from s_intergral_user where openId = ?';
                    const newParams = [res.data.openid];
                    const newRes = await query(newSql,newParams);
                    if (newRes[0].user) {
                        ctx.body = {
                            success: true,
                            msg: '用户信息',
                            data: newRes
                        }
                    } else {
                        ctx.body = {
                            success: true,
                            msg: '用户未授权'
                        }
                    }
                    break;
                //添加失败
                case (0):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (1):
                    ctx.body = {
                        success: true,
                        msg: '添加成功'
                    }
                    break;
            }
        }else{
            ctx.body = {
                success: false,
                err:'系统异常！'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//小程序端loginAuth(授权登录)(提升专本科)
router.post('/wxLoginAuth', async(ctx, next) => {
    try {
        const params = ctx.request.body
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.appid,
              secret: Config.secret,
              js_code: params.code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const sessionKey = res.data.session_key
            const pc = new WXBizDataCrypt(Config.appid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const t = await common.setUserInfo(res.data.openid,data.nickName,data.avatarUrl)
            switch(t) {
                //没有此openId
                case (-1):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                //添加失败
                case (0):
                    const newSql = 'select id,user,avatarUrl,token,share_num,openId from s_intergral_user where openId = ?';
                    const newParams = [res.data.openid];
                    const newRes = await query(newSql,newParams);
                    ctx.body = {
                        success: true,
                        msg: '授权成功',
                        data: newRes
                    }
                    break;
                case (1):
                    const newSqlS = 'select id,user,avatarUrl,token,share_num,openId from s_intergral_user where openId = ?';
                    const newParamsS = [res.data.openid];
                    const newResS = await query(newSqlS,newParamsS);
                    ctx.body = {
                        success: true,
                        msg: '授权成功',
                        data: newResS
                    }
                    break;
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//管理端查看积分账户
router.post('/look', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql =  'select id,user,avatarUrl,token,share_num from s_intergral_user limit ' + ((params.page-1)*(params.limit)) + ','+params.limit+'';
        const res = await query(sql);
        if(res) {
          const newSql = "select count(*) as cnt from s_intergral_user";
          const newRes = await query(newSql);
            ctx.body = {
                success: true,
                data: res,
                total:newRes[0].cnt
            }
        }else{
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

//登录(教师资格证)
router.post('/teacherLogin', async(ctx, next) => {
    try {
        const code = ctx.request.body.code
        // 获取access_token
        let tokenRes = await Axios.get('https://api.weixin.qq.com/cgi-bin/token', {
            params: {
              grant_type: 'client_credential',
              appid: Config.teacherAppid,
              secret: Config.teacherSecret,
            }
        })
        // console.log(tokenRes.data.access_token)
        if(tokenRes.data.access_token) {
          redisClient.set('access_token', tokenRes.data.access_token, 7200)
        }
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.teacherAppid,
              secret: Config.teacherSecret,
              js_code: code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const t = await common.setTeacherOpenId(res.data.openid)
            // const userId = await query(`select id from s_teacher_user where openId = '${res.data.openid}'`)
            // console.log(userId)
            switch(t) {
                //该客户已登录过
                case (-1):
                  const newSql = 'select * from s_teacher_user where openId = ?';
                  const newParams = [res.data.openid];
                  const newRes = await query(newSql,newParams);
                  const coupon = await query(`select count(*) cnt
                  from s_teacher_coupon_type c
                  left join s_teacher_user_coupon u
                  on c.id = u.coupon_type_id
                  where u.user_id = ${newRes[0].id}
                  `)
                    let isHasCoupon = coupon[0]['cnt']>=1?true:false
                    newRes[0].isHasCoupon = isHasCoupon
                    if (newRes[0].user) {
                        ctx.body = {
                            success: true,
                            msg: '用户信息',
                            data: newRes[0]
                        }
                    } else {
                        ctx.body = {
                            success: true,
                            data: newRes[0],
                            msg: '用户未授权'
                        }
                    }
                    break;
                //添加失败
                case (0):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (1):
                    let resData = await query(`select * from s_teacher_user where openId = '${res.data.openid}'`)
                    resData[0].isHasCoupon = false
                    ctx.body = {
                        success: true,
                        data : resData[0],
                        msg: '添加成功'
                    }
                    break;
            }
        }else{
            ctx.body = {
                success: false,
                err:'系统异常！'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//小程序端loginAuth(授权登录)(教师资格证)
router.post('/teacherLoginAuth', async(ctx, next) => {
    try {
        const params = ctx.request.body
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.teacherAppid,
              secret: Config.teacherSecret,
              js_code: params.code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const sessionKey = res.data.session_key
            const pc = new WXBizDataCrypt(Config.teacherAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const token = "token_" + guid();
            let t;
            if(params.token){
                t = await common.setTeacherUserInfo(res.data.openid,token,data.nickName,data.avatarUrl,params.token,params.type,params.id)
            }else{
                t = await common.setTeacherUserInfo(res.data.openid,token,data.nickName,data.avatarUrl)
            }
            switch(t) {
                //没有此openId
                case (-1):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                //添加失败
                case (0):
                    const newSql = 'select id,user,avatarUrl,token,isShare,isShareCourse,openId from s_teacher_user where openId = ?';
                    const newParams = [res.data.openid];
                    const newRes = await query(newSql,newParams);
                    ctx.body = {
                        success: true,
                        msg: '授权成功',
                        data: newRes
                    }
                    break;
                case (1):
                    const newSqlS = 'select id,user,avatarUrl,token,isShare,isShareCourse,openId from s_teacher_user where openId = ?';
                    const newParamsS = [res.data.openid];
                    const newResS = await query(newSqlS,newParamsS);
                    ctx.body = {
                        success: true,
                        msg: '授权成功',
                        data: newResS
                    }
                    break;
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//教师资格证授权手机号
router.post('/teacherPhoneAuth', async ctx => {
    try {
        const params = ctx.request.body
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: Config.teacherAppid,
                secret: Config.teacherSecret,
                js_code: params.code,
                grant_type: 'authorization_code'
            }
        })
        if (res.data) {
            const sessionKey = res.data.session_key
            const openId = res.data.openid
            const pc = new WXBizDataCrypt(Config.teacherAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const phone = data.phoneNumber
            let updateData = await query(`update s_teacher_user set phone = ${phone} where openId = '${openId}'`)
            if (updateData.affectedRows >= 1) {
                let userData = await query(`select * from s_teacher_user where openId = '${openId}'`)
                ctx.body = {
                    success : true,
                    data : userData[0]
                }
            } else {
                ctx.body = {
                    success : false,
                    err : '授权失败'
                }
            }
        }
    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})

//小程序端查询用户信息
router.post('/getMsg', async(ctx, next) => {
    try {
        const params = ctx.request.body
        const sql = 'select * from s_teacher_user where id = ' + params.id;
        const res = await query(sql);
        if (res[0].id) {
            ctx.body = {
                success: true,
                user:res[0]
            }
        }else{
            ctx.body = {
                success: false,
                err: '查询信息失败'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//完善个人信息
router.post('/editMsg', async(ctx, next) => {
    try {
        const params = ctx.request.body
        const sql = 'update s_teacher_user set realName = "'+params.realName+'",phone = "'+params.phone+'" where id = ' + params.id;
        const res = await query(sql);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true
            }
        }else{
            ctx.body = {
                success: false,
                err: '完善信息失败'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//管理端查看用户(教师资格证)
router.post('/teacherGet', async(ctx, next) => {
    try {
        const params = ctx.request.body
        var sql = 'select id,user,avatarUrl,token,isShare,isShareCourse,phone from s_teacher_user where  (user is not null) limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_teacher_user where (user is not null)";
            const newRes = await query(newSql);
            ctx.body = {
                success: true,
                user: res,
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

//管理端查看用户(阿波罗小程序)
router.post('/couponUserGet', async(ctx, next) => {
    try {
        const params = ctx.request.body
        const sql = 'select * from s_coupon_user where (nickName is not null) limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_coupon_user";
            const newRes = await query(newSql);
            ctx.body = {
                success: true,
                user: res,
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

//登录(阿波罗小程序)
router.post('/couponLogin', async(ctx, next) => {
    try {
        const code = ctx.request.body.code
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.apolloAppid,
              secret: Config.apolloSecret,
              js_code: code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const t = await common.setCouponOpenId(res.data.openid)
            switch(t) {
                //该客户已登录过
                case (-1):
                  const newSql = 'select * from s_coupon_user where openId = ?';
                  const newParams = [res.data.openid];
                  const newRes = await query(newSql,newParams);
                    if (newRes[0].openId) {
                        ctx.body = {
                            success: true,
                            msg: '用户信息',
                            data: newRes[0],
                        }
                    }
                    break;
                //添加失败
                case (0):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (1):
                  const newSqlAdd = 'select * from s_coupon_user where openId = ?';
                  const newParamsAdd = [res.data.openid];
                  const newResAdd = await query(newSqlAdd,newParamsAdd);
                    if (newResAdd[0].openId) {
                        ctx.body = {
                            success: true,
                            msg: '用户信息',
                            data: newResAdd[0],
                        }
                    }
                    break;
            }
        }else{
            ctx.body = {
                success: false,
                err:'系统异常！'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//授权登录(阿波罗小程序)
router.post('/couponLoginAuth', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.apolloAppid,
              secret: Config.apolloSecret,
              js_code: params.code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const sessionKey = res.data.session_key
            const pc = new WXBizDataCrypt(Config.apolloAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const t = await common.setCouponUserInfo(res.data.openid,data.nickName,data.avatarUrl)
            switch(t) {
                //没有此openId
                case (-1):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                //添加失败
                case (0):
                    const newSql = 'select * from s_coupon_user where openId = ?';
                    const newParams = [res.data.openid];
                    const newRes = await query(newSql,newParams);
                    ctx.body = {
                        success: true,
                        msg: '授权成功',
                        data: newRes
                    }
                    break;
                case (1):
                    const newSqlS = 'select * from s_coupon_user where openId = ?';
                    const newParamsS = [res.data.openid];
                    const newResS = await query(newSqlS,newParamsS);
                    ctx.body = {
                        success: true,
                        msg: '授权成功',
                        data: newResS
                    }
                    break;
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//授权手机号(阿波罗小程序)
router.post('/couponGetPhone', async(ctx, next) => {
    try {
        const params = ctx.request.body
        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
              appid: Config.apolloAppid,
              secret: Config.apolloSecret,
              js_code: params.code,
              grant_type: 'authorization_code'
            }
        })
        if(res.data){
            const sessionKey = res.data.session_key
            const pc = new WXBizDataCrypt(Config.apolloAppid, sessionKey)
            const data = pc.decryptData(params.encryptedData , params.iv)
            const t = await common.setCouponPhone(params.userId, data.phoneNumber, res.data.openid);
            // const t = await common.setCouponUserInfo(res.data.openid,data.nickName,data.avatarUrl)
            switch(t) {
                // 手机号授权失败
                case (-1):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (0):
                    const newSqlS = 'select * from s_coupon_user where openId = ?';
                    const newParamsS = [res.data.openid];
                    const newResS = await query(newSqlS,newParamsS);
                    ctx.body = {
                        success: true,
                        msg: '抱歉，该用户不属于学员！',
                        data: newResS
                    }
                    break;
                case (1):
                    const newSqlSe = 'select * from s_coupon_user where openId = ?';
                    const newParamsSe = [res.data.openid];
                    const newResSe = await query(newSqlSe,newParamsSe);
                    ctx.body = {
                        success: true,
                        msg: '手机号码授权成功',
                        data: newResSe
                    }
                    break;
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//优惠券发放
router.post('/setCoupon', async(ctx, next) => {
    try {
        const body = ctx.request.body
        // 查找未删除的、未过期的、开启赠送的优惠券
        const sql = 'select a.courseTypeId, b.isEnable from s_coupon_coupontype a,s_coupon_coursetype b where a.isDel = 0 and a.overTime = 0 and a.isGive = 1 and a.courseTypeId = b.id and b.isEnable = 1';
        const res = await query(sql);
        const addSql = 'update s_coupon_user set isStudent = 1 where id = ' + body.userId;
        const addRes = await query(addSql)
        if(res && res.length > 0) {
            // 有开启赠送的优惠券
            const newParams = [body.userId, 0];
            const newSql = 'INSERT INTO s_coupon_usercoursetype (`userId`, `courseTypeId`, `isPay`) select ?, a.courseTypeId, ? from s_coupon_coupontype a,s_coupon_coursetype b where a.courseTypeId = b.id and b.isEnable = 1';
            const newRes = await query(newSql,newParams);
            if (newRes.affectedRows) {
                // 优惠券发放成功
                const allSql = 'select a.*,s_coupon_coursetype.isEnable from (s_coupon_coupontype a left join s_coupon_usercoursetype on a.courseTypeId = s_coupon_usercoursetype.courseTypeId and s_coupon_usercoursetype.userId = "'+body.userId+'") left join s_coupon_coursetype on a.courseTypeId = s_coupon_coursetype.id where a.overTime = 0 and a.isDel = 0 and a.isGive = 1 and s_coupon_coursetype.isEnable = 1';
                const allRes = await query(allSql);
                ctx.body = {
                    success: true,
                    msg: '优惠券发放成功',
                    data: allRes,
                }
            } else {
                // 优惠券发放失败
                ctx.body = {
                    success: false,
                    err: '系统异常！'
                }
            }
        } else if (res && res.length <= 0) {
            // 没有开启赠送优惠券
            ctx.body = {
                success: true,
                msg: '目前没有任何优惠券活动',
                data: [],
            }
        } else {
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

module.exports = router
