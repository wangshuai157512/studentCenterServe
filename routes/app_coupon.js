const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Article = require('../service/articleService');
const common = require('../service/commonService');
const coupon = require('../service/couponService');
const baseUrl = require('../service/baseUrl');
const redis = require("redis");

router.prefix(baseUrl.baseUrl+'/api/app_coupon')
// 新增接口
router.post('/add', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        ctx.body = {
            success:true,
        }
        // const sql = 'update s_coupon_user set phone = ?,state = 1 where openId = ?';
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

//教师资格证发放优惠券
router.post('/addCoupon',async ctx => {
    // type 发放类型 0：精讲课
    try {
        let { user_id , type } = ctx.request.body
        let resData = await query(`select * from s_teacher_coupon_type where course_type_id=${type} and coupon_state = 1`)
        if (resData && resData.length > 0) {
            let end_time = await query(`select DATE_FORMAT(DATE_ADD(NOW(),INTERVAL 7 DAY),'%Y-%m-%d %H:%i:%s') end_time`)
            let insert = await query(`insert into s_teacher_user_coupon(user_id,coupon_type_id,state,end_time) values(${user_id},${resData[0].id},0,'${end_time[0].end_time}')`)
            if (insert.affectedRows > 0) {
                ctx.body = {
                    success : true
                }
            } else {
                ctx.body = {
                    success : false,
                    err : '发放失败'
                }
            }

        } else {
            ctx.body = {
                success : false,
                err : '暂无该优惠券类型'
            }
        }
    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})
//教师资格证修改优惠券状态
router.post('/updateCouponState' ,async ctx => {
    try {
        let { id , user_id} = ctx.request.body
        let updateData = await query(`update s_teacher_user_coupon
        set state = 1
        where user_id = '${user_id}'
            and id = '${id}'
        `)
        if (updateData.affectedRows > 0) {
            ctx.body = {
                success : true
            }
        } else {
            ctx.body = {
                success : false,
                err : '修改失败'
            }
        }
    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})


// 查询接口
router.post('/get', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = 'select a.*,b.courseType,b.title from s_coupon_coupontype a,s_coupon_coursetype b where a.courseTypeId = b.id limit '+((body.page-1)*(body.limit))+','+body.limit+'';
        const res = await query(sql);
        if (res) {
          const newSql = "select count(*) as cnt from s_coupon_coupontype";
          const newRes = await query(newSql);
            ctx.body = {
                success: true,
                couponList: res,
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

//教师资格证查询用户是否拥有该课程下可用的券
router.post('/teacher_look' ,async ctx => {
    try {
        let dataTime = new Date().getTime()
        //type 0:课程 1:资料
        let { user_id , course_id , type} = ctx.request.body
        if (type == 0) {
            // await common.conponIsInvalid(user_id)
            let courseTotal = await query(`select count(*) cnt
            from s_teacher_user_coupon u
            join s_teacher_coupon_type c
            on u.coupon_type_id = c.id
            join s_teacher_course sc
            on c.course_type_id = sc.type
            where u.user_id = ${user_id}
                and sc.id = ${course_id}
                and c.course_type_id = sc.type
                and state = 0
                and sc.price > c.use_price
                and ${dataTime} <= UNIX_TIMESTAMP(u.end_time)*1000
                and ${dataTime} >= UNIX_TIMESTAMP(u.create_time)*1000
             `)
            if (courseTotal[0].cnt >= 1) {
                let courseData = await query(`select k.id course_id,k.price course_price,k.title,u.id coupon_id,c.course_type_id,c.price coupon_price,(k.price-c.price) payment_price
                from s_teacher_user_coupon u
                join s_teacher_coupon_type c
                on u.coupon_type_id = c.id 
                join s_teacher_course k
                on c.course_type_id = k.type
                where u.user_id = ${user_id}
                    and k.id = ${course_id}
                    and u.state = 0
                    and ${dataTime} <= UNIX_TIMESTAMP(u.end_time)*1000
                    and ${dataTime} >= UNIX_TIMESTAMP(u.create_time)*1000
                order by payment_price    
                `)
                courseData[0].hasCoupon = true
                ctx.body = {
                    success : true,
                    data : courseData[0]
                }
            }else {
                let courseData = await query(`select k.id course_id,k.price course_price,k.title,k.price payment_price
                from s_teacher_course k
                where k.id = ${course_id}
                `)
                courseData[0].hasCoupon = false
                ctx.body = {
                    success : true,
                    data : courseData[0]
                }
            }
        } else if (type == 1) {
            let resData = await query(`select id course_id,title,price course_price,price payment_price
            from s_teacher_data 
            where id = ${course_id}
            `)
            resData[0].hasCoupon = false
            ctx.body = {
                success : true,
                data : resData[0]
            }
        }

    }catch (e) {
        ctx.body = {
            success : false,
            err : e
        }
    }

})

// 成考辅导查询用户是否拥有该课程下可用的券
router.post('/look', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = 'select a.*, b.price from s_coupon_usercoursetype a, s_coupon_coupontype b where a.isPay = 0 and a.userId = ? and a.courseTypeId = ? and a.courseTypeId = b.courseTypeId and b.isGive = 1 and b.overTime = 0 and b.isDel = 0';
        const params = [body.userId, body.courseTypeId];
        const res = await query(sql, params);
        if(res && res.length > 0) {
            // 用户存在可用的券
            const newSql = 'select a.*, b.oldPrice,c.price as couponPrice,(b.oldPrice - c.price) as actualPrice from s_coupon_usercoursetype a,s_coupon_coursetype b,s_coupon_coupontype c where a.userId = ? and a.courseTypeId = ? and a.courseTypeId = c.courseTypeId and a.courseTypeId = b.id';
            const newRes = await query(newSql, params);
            ctx.body = {
                success: true,
                hasCoupon: 1,
                data:newRes[0],
            }
        } else if (res && res.length <= 0) {
            // 没有可用的券
            const newSql = 'select a.*, b.oldPrice,b.oldPrice as actualPrice from s_coupon_usercoursetype a,s_coupon_coursetype b,s_coupon_coupontype c where a.userId = ? and a.courseTypeId = ? and a.courseTypeId = b.id = c.courseTypeId;';
            const newRes = await query(newSql, params);
            if(newRes && newRes.length > 0) {
                ctx.body = {
                    success: true,
                    msg: '该用户没有可以使用的券',
                    hasCoupon: 0,
                    data:newRes[0],
                }
            }else if(newRes && newRes.length == 0){
                const couponData = await coupon.getLookMsg(body.userId, body.courseTypeId);
                ctx.body = {
                    success: true,
                    msg: '该用户没有可以使用的券',
                    hasCoupon: 0,
                    data:couponData
                }
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
