const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/app_banner')
//教师资格证资料列表
router.get('/data_list' , async ctx => {
    try {
        let resData = await query(`select * from s_teacher_data`)
        ctx.body = {
            success : true,
            data : resData
        }
    }catch (e) {
        ctx.body = {
            success : false,
            data : e
        }
    }
})
//教师资格证资料详情
router.get('/data_detail', async ctx => {
    try {
        let {id,user_id} = ctx.request.query
        let resData = await query(`select d.id,d.title,d.price,d.oldPrice,d.data_url,d.bannerUrl,(select count(*) count from s_teacher_data_order where isPay = 1) PayNum 
        from s_teacher_data d
        where d.id = ${id}
        `)
        let img_list = await query(`select img_url from s_teacher_data_img
        where data_id = ${id}
        `)
        let isPay = await query(`select count(*) cnt
        from s_teacher_data_order
        where dataId = ${id}
            and userId = ${user_id}
            and isPay = 1
        `)
        resData[0].isPay = isPay[0].cnt > 0?true : false
        resData[0].img_list = img_list
        resData[0].PayNum += 70
        ctx.body = {
            success : true,
            data : resData[0]
        }
    }catch (e) {
        ctx.body = {
            success : false,
            data : e
        }
    }
})
//教师资格证阶段分类
router.get('/course_stage' , async ctx => {
    try {
        let resData = await query(`select s.id,s.title,s.suiTablePerson,s.imgUrl,s.courseId
        from s_teacher_course_stage s
        left join s_teacher_course c
        on s.courseId = c.id
        where s.isDel = 0 
        and c.isDel = 0
        `)
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

module.exports = router
