const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Article = require('../service/articleService');
const common = require('../service/commonService');
const coupon = require('../service/couponService');
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/app_couponCourse')
// 查询接口
router.post('/get', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql = 'select * from s_coupon_coursetype order by sort limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
          const newSql = "select count(*) as cnt from s_coupon_coursetype";
          const newRes = await query(newSql);
          const childrenList = await coupon.getChildrenList(res)
            ctx.body = {
                success: true,
                coursePackList: res,
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

// 操作，开启/停用课程包
router.post('/enable', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = 'update s_coupon_coursetype set isEnable = ? where id = ?';
        const params = [body.isEnable, body.pid];
        const res = await query(sql,params);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true,
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

// 查看用户拥有的课程包详情
router.post('/detail', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql = 'select b.* from s_coupon_course_coursetype a, s_coupon_course b where a.courseTypeId = "'+params.courseTypeId+'" and b.id = a.courseId limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
          const newSql = 'select count(*) as cnt from s_coupon_course_coursetype where courseTypeId = "'+params.courseTypeId+'"';
          const newRes = await query(newSql);
          const paySql = 'select s_coupon_usercoursetype.isPay from s_coupon_usercoursetype where userId = "'+params.userId+'" and courseTypeId = "'+params.courseTypeId+'"';
          const payRes = await query(paySql);
            ctx.body = {
                success: true,
                courseMsg: payRes[0],
                courseList: res,
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


// 管理端查看所有的课程
router.post('/allDetail', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = 'select * from s_coupon_course limit '+((body.page-1)*(body.limit))+','+body.limit+'';
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_coupon_course";
            const newRes = await query(newSql);
            ctx.body = {
                success: true,
                courseList: res,
                total:newRes[0].cnt
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

//新增课程
router.post('/addCourse', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = body.courseTime !== '' ?
        'INSERT INTO s_coupon_course (courseName,introduce,imgUrl,address,courseType,sign,teacher,courseTime,startTime,endTime) values ("'+body.courseName+'","'+body.introduce+'","'+body.imgUrl+'","'+body.address+'","'+body.courseType+'","'+body.sign+'","'+body.teacher+'","'+body.courseTime+'","'+body.startTime+'","'+body.endTime+'")'
        :
        'INSERT INTO s_coupon_course (courseName,introduce,imgUrl,address,courseType,sign,teacher,courseTime,startTime,endTime) values ("'+body.courseName+'","'+body.introduce+'","'+body.imgUrl+'","'+body.address+'","'+body.courseType+'","'+body.sign+'","'+body.teacher+'",null,"'+body.startTime+'","'+body.endTime+'")';
        const res = await query(sql);
        if (res.insertId) {
            ctx.body = {
                success: true,
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

//课程包关联课程
router.post('/relaseCourse', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const overSql = 'select * from s_coupon_course_coursetype where courseId = ? and courseTypeId = ?';
        const overParams = [body.courseId, body.courseTypeId];
        const overRes = await query(overSql, overParams);
        if(overRes[0]){
            // 已存在
            ctx.body = {
                success: false,
                err: '抱歉，禁止添加重复课程！'
            }
            return;
        }
        const sql = 'insert into s_coupon_course_coursetype (courseId,courseTypeId) values ("'+body.courseId+'","'+body.courseTypeId+'")';
        const res = await query(sql);
        if(res.affectedRows) {
            const sqlSelect = 'select s_coupon_coursetype.courseList from s_coupon_coursetype where id = ' +　body.courseTypeId;
            const resSelect = await query(sqlSelect);
            const item = resSelect[0].courseList + body.courseId + ',';
            const newql = 'update s_coupon_coursetype set courseList = ? where id = ?';
            const newParams = [item, body.courseTypeId];
            const newRes = await query(newql, newParams);
            if(newRes.affectedRows) {
                ctx.body = {
                    success: true,
                }
            } else {
                ctx.body = {
                    success: false,
                    err: '系统异常！'
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

//课程包移除课程
router.post('/outCourse', async(ctx, next) => {
    try {
        // 如果课程包仅关联一个课程，禁止删除
        const body = ctx.request.body;
        const params = [body.courseId, body.courseTypeId];
        const disSql = `select * from s_coupon_course_coursetype where courseTypeId = ${body.courseTypeId}`;
        const disRes = await query(disSql,params);
        if(disRes.length <= 1) {
            ctx.body = {
                success: false,
                err: '抱歉课程包必须至少关联一门课程'
            }
            return;
        }
        const sql = 'delete from s_coupon_course_coursetype where s_coupon_course_coursetype.courseId = ? and s_coupon_course_coursetype.courseTypeId = ?';
        const res = await query(sql,params);
        if (res.affectedRows) {
            const sqlSelect = 'select s_coupon_coursetype.courseList from s_coupon_coursetype where s_coupon_coursetype.id = ' + body.courseTypeId;
            const resSelect =　await query(sqlSelect);
            const courseList = coupon.editChildrenList(resSelect[0].courseList, body.courseId);
            const newSql = 'update s_coupon_coursetype set courseList = "'+courseList+'" where id = ' + body.courseTypeId;
            const newRes = await query(newSql);
            if(newRes.affectedRows) {
                ctx.body = {
                    success: true,
                }
            }else{
                ctx.body = {
                    success: false,
                    err: '系统异常！'
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

//课程包新增
router.post('/add', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const lastBody = body.courseList + ',';
        const sql = `INSERT INTO s_coupon_coursetype 
        (courseType,title,introduce,imgUrl,bannerUrl,oldPrice,isEnable,courseList,imgState) values 
        (?,?,?,?,?,${body.oldPrice},${body.isEnable},?,?)`;
        const params = [body.courseType,body.title,body.introduce,body.imgUrl,body.bannerUrl,lastBody,body.imgState];
        const res = await query(sql, params);
        if(res){
            const t = await coupon.addCourse(res.insertId, body.courseList)
            switch(t) {
                case (-1):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (0):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (1):
                    ctx.body = {
                        success: true,
                        msg: '新增成功'
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

//课程包查询
router.post('/getbar', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = `select * from s_coupon_coursetype where id = ${body.id}`;
        const res = await query(sql);
        ctx.body = {
            success: true,
            res: res[0]
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})


//课程包编辑
router.post('/edit', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = `update s_coupon_coursetype set courseType = ?, isEnable = ?, oldPrice = ?, imgUrl = ?,
        title = ?, introduce = ?, bannerUrl = ?, imgState = ? where id = ?`;
        const params = [body.courseType,body.isEnable,body.oldPrice,body.imgUrl,body.title,body.introduce,body.bannerUrl,body.imgState,body.id];
        const res = await query(sql, params);
        if(Number(res.affectedRows) === 1){
            ctx.body = {
                success: true,
                msg: '编辑成功'
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

//课程编辑
router.post('/editCourse', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        const sql = `update s_coupon_course set courseName = ?, imgUrl = ?, introduce = ?, address = ?,
        courseType = ?, sign = ?, teacher = ?, courseTime = ?, startTime = ?, endTime = ? where id = ?`;
        const params = [body.courseName,body.imgUrl,body.introduce,body.address,body.courseType,body.sign,body.teacher,body.courseTime,body.startTime,body.endTime,body.id];
        const res = await query(sql, params);
        if(Number(res.affectedRows) === 1){
            ctx.body = {
                success: true,
                msg: '编辑成功'
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
module.exports = router
