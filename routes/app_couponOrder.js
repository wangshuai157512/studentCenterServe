const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Common = require('../service/commonService.js');
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/app_couponOrder')
// 查询优惠券接口
router.post('/get', async(ctx, next) => {
    try {
        // userId isUsed
        const params = ctx.request.body;
        // 根据有无id判断在哪段展示：有id->小程序展示；无id->pc端查看
        const sql = (!params.userId && typeof (params.userId) !== 'number') ?
            'select a.*,b.*,c.isEnable,d.nickName from s_coupon_usercoursetype a,s_coupon_coupontype b,s_coupon_coursetype c,s_coupon_user d where a.courseTypeId = b.courseTypeId = c.id and a.userId = d.id'
            :
            'select a.*,b.*,c.isEnable from s_coupon_usercoursetype a,s_coupon_coupontype b,s_coupon_coursetype c where a.courseTypeId = b.courseTypeId = c.id and c.isEnable = 1 and a.userId = "'+params.userId+'" and a.isPay = "'+params.isUsed+'"';
        const res = await query(sql);
        if (res) {
            if(!params.userId && typeof (params.userId) !== 'number') {
                const newSql = "select count(*) as cnt from s_coupon_usercoursetype";
                const newRes = await query(newSql);
                ctx.body = {
                    success: true,
                    coupon: res,
                    total:newRes[0].cnt
                }
            }else{
                ctx.body = {
                    success: true,
                    coupon: res,
                }
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

//教师资格证查询优惠券
router.post('/getCoupon',async ctx => {
    //type 0:未使用 1：已使用||已过期
    try {
        let { user_id , type} = ctx.request.body
        let data;
        await Common.conponIsInvalid(user_id)
        let dataTime = new Date().getTime()
        if (type == 0) {
           data = await query(`select c.id,DATE_FORMAT(c.create_time,'%Y-%m-%d %H:%i:%s') create_time,DATE_FORMAT(c.end_time,'%Y-%m-%d %H:%i:%s') end_time,c.state,t.price,t.coupon_name,t.rules
           from s_teacher_user_coupon c
           join s_teacher_coupon_type t
           on c.coupon_type_id = t.id
           where c.user_id=${user_id}
            and c.state=0
            and ${dataTime} < UNIX_TIMESTAMP(c.end_time)*1000
            and ${dataTime} > UNIX_TIMESTAMP(c.create_time)*1000`)
        }else if(type == 1){
            data = await query(`select c.id,DATE_FORMAT(c.create_time,'%Y-%m-%d %H:%i:%s') create_time,DATE_FORMAT(c.end_time,'%Y-%m-%d %H:%i:%s') end_time,c.state,t.price,t.coupon_name,t.rules
            from s_teacher_user_coupon c
            join s_teacher_coupon_type t
            on c.coupon_type_id = t.id
            where c.user_id=${user_id}
                and (c.state=1 or c.state=2)
                `)
        }
        ctx.body = {
            success : true,
            data
        }
    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }

})

// 查询订单接口
router.post('/getOrder', async(ctx, next) => {
    try {
        // state:1已支付，0未支付,2:已关闭
        const body = ctx.request.body;
        if(body.userId) {
            // 客户端
            let sql = Number(body.state) === 1 ?
            'select a.*,b.courseType,b.title from s_coupon_userorder a,s_coupon_coursetype b where a.courseTypeId = b.id and a.isDel = 0 and a.isPay = ? and a.userId = ?'
            :
            'select a.*,b.courseType,b.title from s_coupon_userorder a,s_coupon_coursetype b where a.courseTypeId = b.id and a.isDel = 0 and a.isPast = 0 and a.isPay = ? and a.userId = ?';
            let params = [body.state, body.userId];
            let res = await query(sql, params);
            ctx.body = {
                success: true,
                order: res,
            }
        } else {
            // 管理端
            let sql = 'select a.*,b.courseType,b.title,c.nickName,c.avatarUrl,c.phone from s_coupon_userorder a,s_coupon_coursetype b,s_coupon_user c where a.courseTypeId = b.id and a.isDel = 0 and a.userId = c.id';
            let params = [body.state, body.userId];
            let res = await query(sql, params);
            if(res) {
                const newSql = "select count(*) as cnt from s_coupon_userorder";
                const newRes = await query(newSql);
                ctx.body = {
                    success: true,
                    order: res,
                    total:newRes[0].cnt
                }
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
        const sql = 'update s_coupon_userorder set isPay = 2 where isDel = 0 and id = "'+body.orderId+'" and userId = ' + body.userId;
        const res = await query(sql);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true,
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 删除订单
router.post('/deleteOrder', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = 'update s_coupon_userorder set isPay = 3 where isDel = 0 and id = "'+body.orderId+'" and userId = ' + body.userId;
        const res = await query(sql);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true,
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
