const query = require('../../../bus/mysqlDal');

const controller = {
    getUserList : async ctx=> {
        try {
            let { page } = ctx.request.query
            let resData = await query(`select u.id,u.nickname,u.avatarUrl,u.phone
            from s_itedu_user u
            limit ${(page-1)*10},10`)
            let total = await query(`select count(*) cnt from s_itedu_user`)
            ctx.body = {
                code : 1,
                data : resData,
                total : total[0].cnt
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                data : null,
                err : e
            }
        }
    },
    delUser : async ctx => {
      try {
          let { id } = ctx.request.body
          let delData = await query(`delete from s_itedu_user where id = ${id}`)
          if (delData.affectedRows >= 1) {
              ctx.body = {
                  code : 1,
                  msg : '删除成功'
              }
          } else {
              ctx.body = {
                  code : 0,
                  msg : '删除失败'
              }
          }
      } catch (e) {
          ctx.body = {
              code : 0,
              msg : '删除失败',
              err : e
          }
      }
    },
    getCourseList : async ctx => {
        try {
            let { page } = ctx.request.query
            let resData = await query(`select s.*,c.catname,c.catid
            from s_itedu_course s
            left join 
            s_itedu_category c
            on s.catid = c.catid
            where c.catid is not null
            limit ${(page-1)*10},10`)
            let total = await query(`select count(*) cnt from s_itedu_course`)
            ctx.body = {
                code : 1,
                data : resData,
                total : total[0].cnt
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                data : null,
                err : e
            }
        }
    },
    addCategory : async ctx => {
        try {
            let { name } = ctx.request.body
            console.log(name);
            let insert = await query(`insert into s_itedu_category(catname) values('${name}')`)
            if (insert.affectedRows >= 1) {
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
                data : null,
                err : e
            }
        }
    },
    updateCategory : async ctx => {
        try {
            let { name , id } = ctx.request.body
            let updateData = await query(`update s_itedu_category set catname='${name}' where catid = ${id}`)
            if (updateData.affectedRows >= 1) {
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
    },
    delCategory : async ctx => {
        try {
            let { catid } = ctx.request.body
            let delData = await query(`delete from s_itedu_category where catid=${catid}`)
            if (delData.affectedRows === 1) {
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
    },
    getCategory : async ctx => {
        try {
            let resData = await query(`select * from s_itedu_category`)
            ctx.body = {
                code : 1,
                data : resData
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                data : [],
                err : e
            }
        }
    },
    getCourseDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            let resData = await query(`select * from s_itedu_course where id = ${id}`)
            let categoryList = await query(`select catid,catname from s_itedu_category`)
            resData[0].categoryList = categoryList
            if (resData[0].contentUrl) {
                resData[0].contentUrl = resData[0].contentUrl.split(',')
            }
            ctx.body = {
                code : 1,
                data : resData[0]
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    updateCourse : async ctx => {
        try {
            let params = ctx.request.body
            let updateData = await query(`update s_itedu_course set 
                catid=${params.catid},
                type=${params.type},
                title='${params.title}',
                description='${params.description}',
                imgUrl='${params.imgUrl}',
                bannerUrl='${params.bannerUrl}',
                contentUrl='${params.contentUrl}',
                teacherName='${params.teacherName}',
                teacher_head_img='${params.teacherHeadImg}',
                isRecommend=${params.isRecommend},
                weight=${params.weight},
                videoUrl='${params.videoUrl}'
                where id = ${params.id}
            `)
            if (updateData.affectedRows === 1) {
                ctx.body = {
                    code : 1,
                    data : null,
                    msg : '修改成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    data : null,
                    msg : '修改失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    addCourse : async ctx => {
        try {
            let params = ctx.request.body
            let insertData = await query(`insert into 
                s_itedu_course(title,catid,type,description,imgUrl,bannerUrl,contentUrl,teacherName,teacher_head_img,isRecommend,weight,videoUrl) 
                values('${params.title}',${params.catid},${params.type},'${params.description}','${params.imgUrl}','${params.bannerUrl}','${params.contentUrl}','${params.teacherName}','${params.teacherHeadImg}',${params.isRecommend},${params.weight},'${params.videoUrl}')
             
            `)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    data : null,
                    msg : '添加成功'
                }
            }else {
                ctx.body = {
                    code : 0,
                    data : null,
                    msg : '添加失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    delCourse : async ctx => {
        try {
            let { id } = ctx.request.body
            let updateData = await query(`delete from s_itedu_course where id=${id}`)
            if (updateData.affectedRows === 1) {
                ctx.body = {
                    code : 1,
                    data : null,
                    msg : '删除成功'
                }
            } else {
                ctx.body = {
                    code : 1,
                    data : null,
                    msg : '删除失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getShareList : async ctx => {
        try {
            let id = ctx.request.query.id
            let resData = await query(`select u.id user_id,u.nickname,u.avatarUrl,c.id course_id,c.title,p.name chapter_name
                from s_itedu_user u
                join s_itedu_share s
                on u.id =  s.userId
                join s_itedu_course c
                on s.courseId = c.id
                join s_itedu_course_chapter p
                on s.chapterId = p.id
                where u.id = ${id}
            `)
            ctx.body = {
                code : 1,
                data : resData
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getComments : async ctx => {
        try {
            let { id } = ctx.request.query
            let resData = await query(`select c.id id,c.description description,u.avatarUrl avatarUrl,u.nickname nickname
            from s_itedu_course s
            join s_itedu_evaluation c
            on s.id = c.course_id
            join s_itedu_user u
            on c.user_id = u.id
            where s.id = ${id} 
            order by c.id desc
            `)
            ctx.body = {
                code : 1,
                data : resData
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    editComment : async ctx => {
        try {
            let {type,id} = ctx.request.body
            let updateData = await query(`update s_itedu_evaluation set audit_status=${type} where id=${id}`)
            if (updateData.affectedRows === 1) {
                ctx.body = {
                    code : 1
                }
            }else {
                ctx.body = {
                    code : 0,
                    err : "修改失败"
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    addCourseChapter : async ctx => {
        try {
            let { course_id , name ,weight} = ctx.request.body
            let insertData = await query(`insert into s_itedu_course_chapter(courseId,name,weight) values(${course_id},'${name}',${weight})`)
            if (insertData.affectedRows >= 1)  {
                ctx.body = {
                    code : 1
                }
            }else {
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
    },
    delCourseChapter : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_itedu_course_chapter where id = ${id}`)
            if (delData.affectedRows === 1) {
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
    },
    delChildChapter : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_itedu_child_chapter where id = ${id}`)
            if (delData.affectedRows === 1)  {
                ctx.body = {
                    code : 1
                }
            }else {
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
    },
    addCourseChildChapter : async ctx => {
        try {
            let { chapterId , name , time , videoUrl , weight} = ctx.request.body
            let insertData = await query(`insert into s_itedu_child_chapter(chapterId,name,time,videoUrl,weight) values(${chapterId},'${name}','${time}','${videoUrl}',${weight})`)
            if (insertData.affectedRows >= 1)  {
                ctx.body = {
                    code : 1
                }
            }else {
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
    },
    getChapter : async ctx => {
        try {
            let { course_id } = ctx.request.body
            let resData = await query(`select * from s_itedu_course_chapter where courseId = ${course_id}`)
            ctx.body = {
                code : 1,
                data : resData
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getChildChapter : async ctx => {
        try {
            let { id } = ctx.request.body
            let childrenData = await query(`select * from s_itedu_child_chapter where chapterId = ${id}`)
            ctx.body = {
                code : 1,
                data : childrenData
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getCourse : async ctx => {
        let courseData = await query(`select id,title from s_itedu_course`)
        ctx.body = {
            code : 1,
            data : courseData
        }
    },
    updateChapter : async ctx => {
        try {
            let { chapter_id,name } = ctx.request.body
            let updateData = await query(`update s_itedu_course_chapter set name = '${name}' where id = ${chapter_id}`)
            if (updateData.affectedRows >= 1) {
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
    },
    updateChildChapter : async ctx => {
        try {
            let { id, name , videoUrl , time , weight } = ctx.request.body
            let updateData = await query(`update s_itedu_child_chapter set name='${name}',time='${time}',videoUrl='${videoUrl}',weight=${weight} where id=${id}`)
            if (updateData.affectedRows >= 1) {
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
    },
    getIsShowContent : async ctx => {
        try {
            let { name } = ctx.request.body
            let data = await query(`select * from s_content_config where name = '${name}'`)
            ctx.body = {
                code : 1,
                data : data[0].is_show
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    setIsShowContent : async ctx => {
        try {
            let { name , type } = ctx.request.body
            await query(`update s_content_config set is_show = ${type} where name = '${name}'`)
            ctx.body = {
                code : 1,
                msg : '修改成功'
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '修改失败',
                err : e
            }
        }
    },
    getExportShareList : async ctx => {
        try {
            let { page , startTime , endTime } = ctx.request.query
            let sql = `select c.title,u.nickname,u.phone,u.avatarUrl,p.name chapterName,DATE_FORMAT(s.create_time,'%Y-%m-%d %H:%i:%s') create_time
            from s_itedu_share s
            join s_itedu_course c
            on s.courseId = c.id
            join s_itedu_user u
            on s.userId = u.id
            join s_itedu_course_chapter p
            on s.chapterId = p.id
            where 1 = 1`
            let countSql = `select count(*) cnt
            from s_itedu_share s
            join s_itedu_course c
            on s.courseId = c.id
            join s_itedu_user u
            on s.userId = u.id
            join s_itedu_course_chapter p
            on s.chapterId = p.id
            where 1 = 1`
            if ((startTime && endTime) && (startTime !== 'null' && endTime !== 'null')) {
                sql += ` and s.create_time Between '${startTime}' and '${endTime}'`
                countSql += ` and s.create_time Between '${startTime}' and '${endTime}'`
            }
            if (page && page !== 'undefined' && page !== 'null') {
                sql += ` limit ${(page-1)*20},20`
            }
            let res = await query(sql)
            let total = await query(countSql)
            ctx.body = {
                code : 1,
                data : res,
                total : total[0].cnt
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '获取失败',
                err : e
            }
        }
    },
    getExportLookCourseList : async ctx => {
        try {
            let { page , startTime , endTime } = ctx.request.query
            let sql = `select c.title,u.nickname,u.phone,u.avatarUrl,p.name chapterName,DATE_FORMAT(r.create_time,'%Y-%m-%d %H:%i:%s') create_time
            from s_itedu_course_record r
            left join s_itedu_course c
            on r.courseId = c.id
            left join s_itedu_user u
            on r.userId = u.id
            left join s_itedu_course_chapter p
            on r.chapterId = p.id
            where 1 = 1`
            let countSql = `select count(*) cnt
            from s_itedu_course_record r
            left join s_itedu_course c
            on r.courseId = c.id
            left join s_itedu_user u
            on r.userId = u.id
            left join s_itedu_course_chapter p
            on r.chapterId = p.id
            where 1 = 1`
            if ((startTime && endTime) && (startTime !== 'null' && endTime !== 'null')) {
                sql += ` and r.create_time Between '${startTime}' and '${endTime}'`
                countSql += ` and r.create_time Between '${startTime}' and '${endTime}'`
            }
            sql+= ` order by create_time asc`
            countSql+= ` order by create_time asc`
            if (page && page !== 'undefined' && page !== 'null') {
                sql += ` limit ${(page-1)*20},20`
            }
            let res = await query(sql)
            let total = await query(countSql)
            console.log(res)
            ctx.body = {
                code : 1,
                data : res,
                total : total[0].cnt
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '获取失败',
                err : e
            }
        }
    },
    addBanner : async ctx => {
        try {
            let { url , courseId , weight} = ctx.request.body
            let insertData = await query(`insert into s_itedu_banner(imgUrl,courseId,weight) values('${url}',${courseId?courseId:null},${weight})`)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
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
                msg : '添加失败',
                err : e
            }
        }
    },
    bannerShowOrhide : async ctx => {
        try {
            let { type , id} = ctx.request.body    //0隐藏 1显示
            let updateData =  await query(`update s_itedu_banner set type = ${type} where id = ${id}`)
            if (updateData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '修改失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '修改失败',
                err : e
            }
        }
    },
    delBanner : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_itedu_banner where id = ${id}`)
            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '删除失败'
                }
            }
        } catch (e) {
          ctx.body = {
              code : 0,
              msg : '删除失败',
              err : e
          }
        }
    },
    editBanner : async ctx => {
        try {
            let { id , weight , imgUrl , courseId} = ctx.request.body
            let updateData = await query(`update s_itedu_banner set weight = ${weight},imgUrl = '${imgUrl}',courseId = ${courseId} where id = ${id}`)
            if (updateData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '修改失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '修改失败',
                err : e
            }
        }
    },
    getBanner : async ctx => {
        let bannerData = await query(`select b.*,c.title
        from s_itedu_banner b
        left join s_itedu_course c
        on b.courseId = c.id
        `)
        ctx.body = {
            code : 1,
            data : bannerData
        }
    },
    getBannerDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            let getData = await query(`select * from s_itedu_banner where id = ${id}`)
            ctx.body = {
                code : 1,
                data : getData[0]
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '获取失败',
                err : e
            }
        }
    },
    setMyCourse : async ctx => {
        try {
            let userData = await query(`select * from s_itedu_user`)
            for (let i = 0; i < userData.length; i++) {
                let userItem = userData[i]
                if (userItem.courseIds && userItem.courseIds !== 'null') {
                    let courseIds = userItem.courseIds.split(',')
                    for (let j = 0; j < courseIds.length; j++) {
                        let cnt = await query(`select count(*) total 
                        from s_itedu_course_record 
                        where userId = ${userItem.id}
                            and courseId = ${courseIds[j]}
                            and chapterId is null
                        `)
                        if (cnt[0].total === 0) {
                            await query(`insert into s_itedu_course_record(userId,courseId) values(${userItem.id},${courseIds[j]})`)
                        }
                    }
                }
            }
            ctx.body = {
                code : 1
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '插入失败'
            }
        }
    }
}
module.exports = controller
