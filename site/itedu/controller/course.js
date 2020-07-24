const query = require('../../../bus/mysqlDal');
const controller = {
    //分类下的课程列表
    courseList :  async ctx => {
        try {
            let { catid } = ctx.request.query
            if (catid == 0) {
                let resData = await query(`select s.id,s.type,s.title,s.description,s.imgUrl,s.bannerUrl,(
                select count(*) from s_itedu_look_video_user 
                where course_id = s.id
                ) look_num
                from s_itedu_course s
                where isRecommend=1 and isDel = 0
                order by s.weight desc
                `)
                ctx.body = {
                    code : 1,
                    data : resData
                }
            }else {
                let resData = await query(`select s.id,s.type,s.title,s.description,s.imgUrl,s.bannerUrl,(
                select count(*) from s_itedu_look_video_user 
                where course_id = s.id
                ) look_num
                from s_itedu_course s
                where s.catid = ${catid} and isDel = 0
                order by s.weight desc
                `)
                ctx.body = {
                    code : 1,
                    data : resData
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
	//我的课程-列表
    getMycourseList :  async ctx => {
        try {
            const userId = ctx.request.body.userId;
			let resCourse = await query(`select courseIds from s_itedu_user where id=${userId}`);
			let courseIds = resCourse[0].courseIds;
			let resData = await query(`select s.id,s.type,s.title,s.description,s.imgUrl,(
			select count(*) from s_itedu_look_video_user 
			where course_id = s.id
			) look_num
			from s_itedu_course s 
			where s.id in(${courseIds}) and s.isDel = 0
			order by s.weight desc
			`)
			ctx.body = {
				code : 1,
				data : resData
			};
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    //分类列表
    categoryList : async ctx => {
        try {
            let resData = await query(`select catid,catname from s_itedu_category`)
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
    //轮播图列表
    bannerList : async ctx => {
        try {
            let resData = await query(`select * from s_itedu_banner where type = 1 order by weight desc`)
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
    //课程详情
    courseDetail : async ctx => {
        try {
            let { id , user_id } = ctx.request.query
            let resData = await query(`select id,type,title,description,imgUrl,bannerUrl,contentUrl,
                teacherName,teacher_head_img,videoUrl
                from s_itedu_course 
                where id = ${id}
                order by weight desc
            `)
            let chapterData = await query(`select c.id,c.name,(
                select count(*) from 
                s_itedu_share 
                where 
                userId=${user_id} 
                    and courseId=${id} 
                    and chapterId=c.id) isShare
                from s_itedu_course_chapter c
                where courseId = ${id}
            `)
            let res = await controller.getChildChapter(chapterData)

            console.log(chapterData)

            resData[0].chapter = res
            resData[0].contentUrl = resData[0].contentUrl?resData[0].contentUrl.split(','):[]
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
    //获取子章节
    getChildChapter : async (chapterData) => {
        for (let i = 0; i < chapterData.length; i++ ){
            chapterData[i].childChapter = await query(`select name,time,videoUrl
                from s_itedu_child_chapter
                where chapterId = ${chapterData[i].id}
                order by weight desc
             `)
        }
        return chapterData
    },
    //课程分享
    shareCourse : async ctx => {
        try {
            let { id , user_id ,chapter_id} = ctx.request.body
            let insert = await query(`insert into s_itedu_share(userId,courseId,chapterId) values(${user_id},${id},${chapter_id})`)
            if (insert.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    data : null,
                    msg : '分享成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    data : null,
                    msg : '分享失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                data : null,
                msg : '分享失败'
            }
        }
    },
    //多少人观看
    lookNum : async ctx => {
        try {
            let { user_id,course_id } = ctx.request.body
            let isLook = await query(`select count(*) cnt from s_itedu_look_video_user where user_id=${user_id} and course_id=${course_id}`)
            if (isLook[0].cnt < 1) {
                let insertData = await query(`insert into s_itedu_look_video_user(user_id,course_id) values(${user_id},${course_id})`)
                if (insertData.affectedRows >= 1) {
                    ctx.body = {
                        code : 1
                    }
                }else {
                    ctx.body = {
                        code : 0,
                        err : '添加失败'
                    }
                }
            }else {
                ctx.body = {
                    code : 1
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }

    }
}
module.exports = controller
