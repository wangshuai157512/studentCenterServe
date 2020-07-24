const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Common = require('../service/commonService.js');
const Article = require('../service/articleService');
const Config = require('../utils/config.js');
const baseUrl = require('../service/baseUrl');
const services = require('../service/commonService')

router.prefix(baseUrl.baseUrl+'/api/app_teacherCourse')
// 查询接口
router.post('/get', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql = (!params.isPositivePrice && typeof (params.isPositivePrice) !== 'number') ?
            'select * from s_teacher_course s1 order by s1.weight desc limit '+((params.page-1)*(params.limit))+','+params.limit+''
            :
            'select * from s_teacher_course s1 where isDel = 0 and isPositivePrice = '+params.isPositivePrice+' order by s1.weight desc limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_teacher_course";
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

// 获取课程标签
router.get('/selectTagCourse',async(ctx,next)=>{
    try{
        let res = await query(`select * from s_teacher_tag`)
        ctx.body = {
            success : true,
            data : res
        }
    }catch(e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})
//添加课程标签
router.post('/addTagCourse',async(ctx,next)=>{
    let { title } = ctx.request.body
    console.log(ctx.request.body)

    try{
        let res = await query(`insert into s_teacher_tag(title) values('${title}')`)
        ctx.body = {
            success : true,
            data : res
        }
    }catch(e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})
// 删除课程标签
router.post('/deleteTagCourse',async(ctx,next)=>{
    let { id } = ctx.request.body
    try{
        let res = await query(`DELETE FROM s_teacher_tag where id = ${id}`)
        ctx.body = {
            success : true,
            data : res
        }
    }catch(e) {
        ctx.body = {
            success : false,
            err : e
        }
    }
})

//获取精讲课列表
router.post('/getCourseList', async ctx => {
    let { type , page  } = ctx.request.body
    try {
        let resData = await query(`select s1.*, s2.tag from s_teacher_course s1
        left join(
         SELECT t1.id, GROUP_CONCAT(distinct t3.title) as tag FROM s_teacher_course t1 
         join s_teacher_course_tag t2 
         join s_teacher_tag t3
         on t1.id = t2.course_id
         and t2.tag_id = t3.id
         group by t1.id
        ) s2
        on s1.id = s2.id
        where s1.isDel = 0 and s1.type = ${type} order by s1.weight desc
        `)
        for (let i = 0; i < resData.length; i++) {
            if(resData[i].tag) {
                resData[i].tag = resData[i].tag.split(',')
            }else {
                resData[i].tag = []
            }
            
        }
        console.log(resData)
        ctx.body = {
            success : true,
            data : resData
        }
    }catch (e) {
        console.log(e)
        ctx.body = {
            success : false,
            err : e
        }
    }
})



// 查看课程详情
router.post('/look', async(ctx, next) => {
    let recommendList = []
    try {
        let { id , userId , suitablePerson } = ctx.request.body;
        if (!userId) {
            console.log(111)
            let resData = await query(`select s1.* from s_teacher_course s1 where s1.id = ${id} order by s1.weight desc`)
            let resTitle = await query(`select  s1.id,t1.id from s_teacher_course_tag s1 left join s_teacher_tag t1 on s1.tag_id = t1.id where course_id = ${id}`)
            // console.log(resData)
            let  courseTag = []
            for (let i = 0; i <  resTitle.length; i++) {
               courseTag.push(resTitle[i].id )
            }
            resData[0].courseTag = courseTag
            ctx.body = {
                success: true,
                course: resData
            }
        }else {
            const sql = `select c.*,(select count(*) from 
            s_teacher_userorder where 
            courseId = c.id and isPay = 1 ) PayNum 
            from s_teacher_course c 
            where c.id = ${id} `;
            if(suitablePerson == 0 || suitablePerson == 1 || suitablePerson == 2) {
                recommendList = await query(`select s1.*,s2.tag from s_teacher_course s1
                    left join(select t1.id , GROUP_CONCAT(distinct t3.title) as tag FROM s_teacher_course t1 
                    join s_teacher_course_tag t2 
                    join s_teacher_tag t3
                    on t1.id = t2.course_id
                    and t2.tag_id = t3.id 
                    group by t1.id
                    ) s2
                    on s1.id = s2.id
                    where suitablePerson = ${suitablePerson} 
                        and s1.id <> ${id} order by s1.weight desc`)
            }else {
                recommendList = await query(`select s1.*,s2.tag from s_teacher_course s1
                left join(select t1.id , GROUP_CONCAT(distinct t3.title) as tag FROM s_teacher_course t1 
                join s_teacher_course_tag t2 
                join s_teacher_tag t3
                on t1.id = t2.course_id
                and t2.tag_id = t3.id 
                group by t1.id
                ) s2
                on s1.id = s2.id
                where type= 3 and s1.id <> ${id} order by s1.weight desc`)
            }
            for (let i = 0; i < recommendList.length; i++) {
                if(recommendList[i].tag) {
                    recommendList[i].tag = recommendList[i].tag.split(',')
                }else {
                    recommendList[i].tag = []
                } 
            }
            let isPay = await services.isPay(id,userId)
            const res = await query(sql);
            res[0].recommendList = recommendList

            res[0].isPay = isPay
            
            res[0].PayNum = res[0].baseNum + res[0].PayNum
            console.log(res[0])
            if (res && res.length > 0) { 
                ctx.body = {
                    success: true,
                    course: res[0]
                }
            } else {
                ctx.body = {
                    success: false,
                    err: 'err'
                }
            }
        }

    } catch (err) {
        console.log(err)
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 新增
router.post('/add', async(ctx, next) => {
    try {
        const token = ctx.header['x-token'];
        const isTeacherLogin = await Common.isTeacherLogin(token);
        if(isTeacherLogin){
            const course = ctx.request.body;
            console.log(course.videoUrl)
            console.log(course.imgUrl)
            if(course.type === 0) {
               var disCount = 1
            }else {
                disCount = 0
            }
            const tag = course.tag
            const sql = course.price ?
                'INSERT INTO s_teacher_course (title,type,price,oldPrice,videoUrl,imgUrl,bannerUrl,tem1,tem2,tem3,introduce,suitablePerson,isPositivePrice,isDel,studyNum,disCount,weight,baseNum) values ("'+course.title+'","'+course.type+'","'+course.price+'","'+course.oldPrice+'","'+Article.audioUrlReplace(course.videoUrl)+'","'+Article.audioUrlReplace(course.url)+'","'+Article.audioUrlReplace(course.urlBanner)+'","'+Article.audioUrlReplace(course.urlCourse)+'","'+Article.audioUrlReplace(course.urlTeacher)+'","'+Article.audioUrlReplace(course.urlTable)+'","'+course.introduce+'","'+course.suitablePerson+'",1,0,"'+course.studyNum+'","'+disCount+'","'+course.weight+'","'+course.baseNum+'")'
                :
                'INSERT INTO s_teacher_course (title,type,imgUrl,bannerUrl,tem1,tem2,tem3,introduce,suitablePerson,isPositivePrice,isDel,studyNum,disCount,baseNum) values ("'+course.title+'","'+course.type+'","'+Article.audioUrlReplace(course.url)+'","'+Article.audioUrlReplace(course.urlBanner)+'","'+Article.audioUrlReplace(course.urlCourse)+'",'+Article.audioUrlReplace(course.urlTeacher)+'",'+Article.audioUrlReplace(course.urlTable)+'","'+course.introduce+'","'+course.suitablePerson+'",0,0,"'+course.studyNum+'","'+disCount+'","'+course.weight+'","'+course.baseNum+'")';
            const res = await query(sql);
            let courseId = res.insertId
            for (let i = 0; i < tag.length; i++) {
                await query(`insert into s_teacher_course_tag(tag_id,course_id) values(${tag[i]},${courseId})`)
            }
            if (res.insertId) {
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

// 编辑
router.post('/edit', async(ctx, next) => {
    try {
        const token = ctx.header['x-token'];
        const isTeacherLogin = await Common.isTeacherLogin(token);
        if(isTeacherLogin){
            const body = ctx.request.body;
            if(body.type === 0) {
               var disCount = 1
            }else {
                disCount = 0
            }
            const sql = body.price ?
                'update s_teacher_course set type = "'+body.type+'",title = "'+body.title+'",price = "'+body.price+'",oldPrice="'+body.oldPrice+'",videoUrl="'+Article.audioUrlReplace(body.videoUrl)+'",introduce = "'+body.introduce+'",suitablePerson = "'+body.suitablePerson+'",isPositivePrice = 1,studyNum = "'+body.studyNum+'",disCount = "'+disCount+'",weight = "'+body.weight+'",baseNum = "'+body.baseNum+'" where id = ' + body.id
                // `update s_teacher_course set type = '${body.type}',title = '${body.title}',price = '${body.price}',oldPrice = '${body.oldPrice}',videoUrl = '${body.videoUrl}',introduce = '${body.introduce}',suitablePerson = '${body.suitablePerson}',isPositivePrice = 1,isDel = 0,studyNum = '${body.studyNum}',disCount = '${disCount}' where id = ${body.id}`
                :
                'update s_teacher_course set type = "'+body.type+'",title = "'+body.title+'",introduce = "'+body.introduce+'",suitablePerson = "'+body.suitablePerson+'",isPositivePrice = 0,studyNum = "'+body.studyNum+'",weight = "'+body.weight+'",baseNum = "'+body.baseNum+'" where id = ' + body.id;
            const res = await query(sql);
                let oldTag = `select tag_id from s_teacher_course_tag where course_id = ${body.id}`
            let  resOldTag = await query(oldTag); 
            let oldTagList = []
            for (let i = 0; i < resOldTag.length; i++) {
                oldTagList.push(resOldTag[i].tag_id)
            }
            let newTag = body.tag
            // console.log(oldTagList)
            // console.log(newTag)
            // let insertList = []
            // let removeList = []
            for (let i = 0; i < oldTagList.length; i++) {
                if(newTag.indexOf(oldTagList[i]) === -1) {
                var remove = await query(`DELETE FROM s_teacher_course_tag where tag_id = ${oldTagList[i]} and course_id = ${body.id}`)
                    // removeList.push(item)
                }
            }
           newTag.forEach(async(item)=> {
               if(oldTagList.indexOf(item) === -1) {
                var insert = await query(`insert into s_teacher_course_tag(tag_id,course_id) values(${item},${body.id})`)
                //    insertList.push(item)
                 
               }
           })
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

// 修改图片
router.post('/editUploadphoto', async(ctx, next) => {
  try {
    const token = ctx.header['x-token'];
    const isTeacherLogin = await Common.isTeacherLogin(token);
    if(isTeacherLogin){
      const body = ctx.request.body;
      let sql
      if(parseInt(body.imgUrlType) === 0) {
        sql = 'update s_teacher_course set imgUrl = "'+Article.audioUrlReplace(body.url)+'" where id = ' + body.id
      }else if(parseInt(body.imgUrlType) === 1) {
        sql = 'update s_teacher_course set tem1 = "'+Article.audioUrlReplace(body.url)+'" where id = ' + body.id
      }else if(parseInt(body.imgUrlType) === 2) {
        sql = 'update s_teacher_course set tem2 = "'+Article.audioUrlReplace(body.url)+'" where id = ' + body.id
      }else if(parseInt(body.imgUrlType) === 3) {
        sql = 'update s_teacher_course set tem3 = "'+Article.audioUrlReplace(body.url)+'" where id = ' + body.id
      }else {
        sql = 'update s_teacher_course set bannerUrl = "'+Article.audioUrlReplace(body.url)+'" where id = ' + body.id
      }
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

// 伪删除
router.post('/showTeacherCourse', async(ctx, next) => {
    try {
        const token = ctx.header['x-token'];
        const isTeacherLogin = await Common.isTeacherLogin(token);
        if(isTeacherLogin){
            const {courseId,isShow} = ctx.request.body.id;
            const sql = `update s_teacher_course set isDel = ${isShow} where id = ${courseId}`;
            const res = await query(sql);
            if (parseInt(res.affectedRows) === 1) {
                ctx.body = {
                    success: true,
                    code: isShow
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

// 删除
router.post('/del', async(ctx, next) => {
    try {
        const token = ctx.header['x-token'];
        const isTeacherLogin = await Common.isTeacherLogin(token);
        if(isTeacherLogin){
            const courseId = ctx.request.body.id;
            const sql = 'DELETE FROM s_teacher_course where id = ' + courseId;
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

module.exports = router
