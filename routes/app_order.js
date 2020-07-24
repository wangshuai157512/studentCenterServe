const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Common = require('../service/commonService.js');
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/app_order')
router.get('/getorder' ,async ctx => {
    try {
        let resData = await query(`select * from s_teacher_userorder`)
        ctx.body = {
            success : true,
            data : resData
        }
    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})
// 查询管理端
router.post('/getAdmin',async(ctx,next) => {
    //0:未支付 2:已删除 1：已支付
    try{
        const params = ctx.request.body;
        if ((params.startTime && params.endTime) && (params.startTime !== 'null' && params.endTime !== 'null')) {
            var sql =  `select a.id, a.userId, a.courseId, a.merchOrderId, a.nonceStr, a.isPay, a.state, a.date, a.actualPayMoney, b.type, b.title, b.price, b.imgUrl, b.introduce, b.suitablePerson, c.user, c.avatarUrl, c.realName, c.phone from s_teacher_userorder a, s_teacher_course b, s_teacher_user c where a.isDel = 0 and b.id = a.courseId and a.userId = c.id and a.date Between '${params.startTime}' and '${params.endTime}'`;
            var newSql = `select count(*) as cnt from s_teacher_userorder a where a.date Between '${params.startTime}' and '${params.endTime}' and a.isDel = 0`;
        }else {
            var sql =  `select a.id, a.userId, a.courseId, a.merchOrderId, a.nonceStr, a.isPay, a.state, a.date, a.actualPayMoney, b.type, b.title, b.price, b.imgUrl, b.introduce, b.suitablePerson, c.user, c.avatarUrl, c.realName, c.phone from s_teacher_userorder a, s_teacher_course b, s_teacher_user c where a.isDel = 0 and b.id = a.courseId and a.userId = c.id`;
            var newSql = `select count(*) as cnt from s_teacher_userorder where isDel = 0`;
        }
        if (params.page && params.page !== 'undefined' && params.page !== 'null') {
            sql += ` limit ${(params.page-1)*10},10`
        }
        let res = await query(sql);
        const newRes = await query(newSql);
        res = [...res]
        if (res) {
            ctx.body = {
                success: true,
                course: res,
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

// 查询接口
router.post('/get', async(ctx, next) => {
    //0:未支付 2:已删除 1：已支付
    try {
        const params = ctx.request.body;
        console.log(params)
        // 根据有无id判断在哪段展示：有id->小程序展示；无id->pc端查看
        const sql = (!params.id && typeof (params.id) !== 'number') ?
            'select a.id, a.userId, a.courseId, a.merchOrderId, a.nonceStr, a.isPay, a.state, a.date, a.actualPayMoney, b.type, b.title, b.price, b.imgUrl, b.introduce, b.suitablePerson, c.user, c.avatarUrl, c.realName, c.phone from s_teacher_userorder a, s_teacher_course b, s_teacher_user c where a.isDel = 0 and b.id = a.courseId and a.userId = c.id limit '+((params.page-1)*(params.limit))+','+params.limit+''
            :
            'select a.id, a.userId, a.courseId, a.merchOrderId, a.nonceStr, a.isPay, a.state, a.date,DATE_FORMAT(a.endTime,"%Y-%m-%d %H:%i:%s") endTime,a.shouldPayMone, a.actualPayMoney, b.type, b.title, b.price, b.imgUrl, b.introduce, b.suitablePerson, c.user, c.avatarUrl, c.realName, c.phone ' +
            'from s_teacher_userorder a, s_teacher_course b, s_teacher_user c ' +
            'where a.isDel = 0 and b.isDel = 0 and b.id = a.courseId and a.isPay = "'+params.type+'" and a.userId = "'+params.id+'" and a.userId = c.id ' +
            'order by a.date desc'
            'limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        let res = await query(sql);
        let resData = await query(`select o.id,o.merchOrderId,o.date,o.nonceStr,o.actualPayMoney,o.shouldPayMone ,DATE_FORMAT(o.endTime,"%Y-%m-%d %H:%i:%s") endTime, d.id courseId,d.title,d.price,d.imgUrl imgUrl,d.isData isData,u.id userId,u.user user,u.phone phone
        from s_teacher_data_order o
        left join s_teacher_data d
        on o.dataId = d.id
        left join s_teacher_user u
        on o.userId = u.id
        where o.userId = ${params.id} 
            and o.isPay = ${params.type}
            and d.isDel = 0
        order by o.date desc
        limit ${(params.page-1)*(params.limit)},${params.limit}  
        `)
        res = [...resData,...res]
        if (res) {
            const newSql = "select count(*) as cnt from s_teacher_userorder where isDel = 0";
            const newRes = await query(newSql);
            ctx.body = {
                success: true,
                course: res,
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

// 客服人员标记课程订单状态
router.post('/sign', async(ctx, next) => {
    try {
        const token = ctx.header['x-token'];
        const isTeacherLogin = await Common.isTeacherLogin(token);
        if(isTeacherLogin){
            const body = ctx.request.body;
            const sql = 'update s_teacher_userorder set state = 1 where isDel = 0 and id = ' + body.id;
            const res = await query(sql);
            if (parseInt(res.affectedRows) === 1) {
                ctx.body = {
                    success: true
                }
            }
        } else {
            ctx.body = {
                success: false,
                code: 50014,
                err: '身份信息已过期,请重新登录！'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 取消订单
router.post('/cancelOrder', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        let sql;
        if (body.type == 1) {
            sql = `update s_teacher_data_order set isPay = 2 where isDel = 0 and id = ${body.id}`
        }else {
            sql = 'update s_teacher_userorder set isPay = 2 where isDel = 0 and id = ' + body.id;
            let couponData = await query(`select couponId,userId from s_teacher_userorder where id = ${body.id}`)
            if (couponData[0].couponId) {
                await query(`update s_teacher_user_coupon set state = 0 where id = ${couponData[0].couponId} and user_id = ${couponData[0].userId}`)
            }
        }
        const res = await query(sql);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 关闭订单
router.post('/closeOrder', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        let sql;
        if (body.type === 1) {
            sql = 'update s_teacher_data_order set isPay = 3 where isDel = 0 and id = ' + body.id;
        }else {
            sql = 'update s_teacher_userorder set isPay = 3 where isDel = 0 and id = ' + body.id;
        }
        const res = await query(sql);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 查询订单是否完成(已支付)
router.post('/orderComplete', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        let sql
        if (body.type == 0) {
            sql = "select count(*) as cnt from s_teacher_userorder where userId = " + body.userId + " and courseId = " + body.courseId + " and isPay = 1";
        } else if (body.type == 1) {
            sql = `select count(*) cnt 
            from s_teacher_data_order 
            where userId = ${body.userId}
                and dataId = ${body.courseId}
                and isPay = 1
            `
        }
        const res = await query(sql);
        console.log(res)
        if(parseInt(res[0].cnt) > 0) {
              ctx.body = {
                  success: true,
                  isPay: 1
              }
        }else{
              ctx.body = {
                  success: true,
                  isPay: 0
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
