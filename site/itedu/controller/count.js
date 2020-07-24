const query = require('../../../bus/mysqlDal');

module.exports = {
	//我的课程-获取用户信息
	getUserInfo: async (ctx,next) => {
		try {
			const userId = ctx.request.body.userId;
			const sql = 'select * from s_itedu_user where id=' + userId;
			const res = await query(sql);
			if (res) {
                ctx.body = {
                    code:1,
                    data: res
                }
			} else {
                ctx.body = {
                    code:0,
                    data: false,
                    err: 'err'
                }
			}
		} catch (err) {
			ctx.body = {
				success: false,
				err: err.message
			}
		}
	},
	//设置我的课程
    setMycourse :  async ctx => {
        try {
            const userId = ctx.request.body.userId;
			const courseId = ctx.request.body.courseId;	
			const chapterId = ctx.request.body.chapterId;	
			let resCourseId = await query(`select u.courseIds from s_itedu_user as u
			where id=${userId}
			`);
			let resCourseIdStr = resCourseId[0].courseIds;
		    let resCourseIdArr = [];
			if(resCourseIdStr) {
				resCourseIdArr = resCourseIdStr.split(',');
			}			
			let courseIdIndex = resCourseIdArr.indexOf(courseId.toString());
			if(courseIdIndex != -1) {
				resCourseIdStr = resCourseIdArr.join(',');
			} else {
				resCourseIdArr.push(courseId);
				resCourseIdStr = resCourseIdArr.join(',');
			}
			let resCourseIdLen = resCourseIdArr.length;
			let resData = await query(`update s_itedu_user set courseIds='${resCourseIdStr}' where id= ${userId}`);
			let resCourseLen = await query(`update s_itedu_user set learningCourseNum='${resCourseIdLen}' where id= ${userId}`);
			let resCheck  = await query(`select * from s_itedu_course_record where userId=${userId} and courseId=${courseId} and chapterId=${chapterId}`)
			console.log(resCheck)
			if(resCheck.length===0) {
				let resRecord = await query(`insert into  s_itedu_course_record(userId,courseId,chapterId) values(${userId},${courseId},${chapterId})`)
			}
			
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
	//设置学习天数
	setDays: async (ctx,next) => {
		try {
			const userId = ctx.request.body.userId;
			const sql = 'update s_itedu_user set learningDays = learningDays+1 where id=' + userId;
			const res = await query(sql);
			if (res) {
                ctx.body = {
                    code:1,
                    data: res
                }
			} else {
                ctx.body = {
                    code:0,
                    data: false,
                    err: 'err'
                }
			}
		} catch (err) {
			ctx.body = {
				success: false,
				err: err.message
			}
		}
	},
	//设置学习时长
	setDuration: async (ctx,next) => {
		try {
			const userId = ctx.request.body.userId;
			const sql = 'update s_itedu_user set learningDuration = learningDuration+1 where id=' + userId;
			const res = await query(sql);
			if (res) {
                ctx.body = {
                    code:1,
                    data: res
                }
			} else {
                ctx.body = {
                    code:0,
                    data: false,
                    err: 'err'
                }
			}
		} catch (err) {
			ctx.body = {
				success: false,
				err: err.message
			}
		}
	},
	//设置学习课程节数
	setCourseNum: async (ctx,next) => {
		try {
			const userId = ctx.request.body.userId;
			const sql = 'update s_itedu_user set learningCourseNum = learningCourseNum+1 where id=' + userId;
			const res = await query(sql);
			if (res) {
                ctx.body = {
                    code:1,
                    data: res11
                }
			} else {
                ctx.body = {
                    code:0,
                    data: false,
                    err: 'err'
                }
			}
		} catch (err) {
			ctx.body = {
				success: false,
				err: err.message
			}
		}
	}
}
