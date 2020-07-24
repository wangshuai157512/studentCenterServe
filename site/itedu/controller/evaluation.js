const query = require('../../../bus/mysqlDal');

module.exports = {
	//小程序-获取评价信息
	get: async (ctx,next) => {
         try {
            const params = ctx.request.body;
			const courseid = params.courseid;
			const page = params.page;
			const num = params.num;
            const sql = 'select e.id,e.description,e.star_num,e.audit_status,u.nickname,u.avatarUrl from s_itedu_evaluation e,s_itedu_user u where e.course_id='+courseid+' and e.user_id=u.id and e.audit_status=0 order by e.id DESC limit '+((page-1)*num)+','+num;
            const res = await query(sql);
            if (res) {
                const newSql = 'select count(*) as cnt from s_itedu_evaluation e join s_itedu_user u on e.user_id=u.id where course_id='+courseid;
                const newRes = await query(newSql);
                ctx.body = {
                    code: 1,
                    data: res,
					pageSize:Math.ceil(newRes[0].cnt/num),
                    total:newRes[0].cnt
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
                code: 0,
                err: err.message
            }
        };
	},
	//小程序-提交评价信息
	add: async (ctx,next) => {
		try {
			const params = ctx.request.body;
			const userId = params.userId;
			const courseid = params.courseid;
			const description = params.description;
			const starNum = params.starNum;
			const sql = `INSERT INTO s_itedu_evaluation (user_id,course_id,description,star_num) values (${userId},${courseid},'${description}',${starNum})`;
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
                code: 0,
                err: err.message
            }
		}
	},
	//后台管理-获取所有评价信息
	getAll: async (ctx,next) => {
         try {
            const params = ctx.request.body;
			const userId = params.userId;
			const page = params.page;
			const num = params.num;
            const sql = 'select * from s_itedu_evaluation order by id DESC limit '+((page-1)*num)+','+num;
            const res = await query(sql);
            if (res) {
                const newSql = 'select count(*) as cnt from s_itedu_evaluation';
                const newRes = await query(newSql);
                ctx.body = {
                    code: 1,
                    data: res,
					pageSize:Math.ceil(newRes[0].cnt/num),
                    total:newRes[0].cnt
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
                code: 0,
                err: err.message
            }
        };
	},
	//后台管理-删除评价信息
	del: async (ctx,next) => {
		try {
			const evaluationId = ctx.request.body.evaluationId;
			const sql = 'delete s_itedu_evaluation where id=' + evaluationId;
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
	//后台管理-审核评价信息
	updateAudit: async (ctx,next) => {
		try {
			const evaluationId = ctx.request.body.evaluationId;
			const sql = 'update s_itedu_evaluation set audit_status=1 where id=' + evaluationId;
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
	}
}
