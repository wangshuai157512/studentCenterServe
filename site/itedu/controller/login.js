const Axios = require('axios');
const query = require('../../../bus/mysqlDal');
const redisClient = require('../../../bus/redisAdapter');
const Config = require('../../../utils/config.js');
const WXBizDataCrypt = require('../../../bus/WXBizDataCrypt');
const common = require('../../../service/commonService');

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

module.exports = {
	//登录(IT教育公开课)
	iteduLogin: async (ctx,next) => {
	    try {
	        const code = ctx.request.body.code
	        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
	            params: {
	              appid: Config.itAppId,
	              secret: Config.itSecret,
	              js_code: code,
	              grant_type: 'authorization_code'
	            }
	        })
	        if(res.data.openid){
	        	let data = res.data
	            let totalUser = await query(`select count(*) cnt from s_itedu_user where openId = '${data.openid}'`)
				let selectUserSql = `select id,nickname,avatarUrl,phone,courseIds,learningDays,learningCourseNum,learningDuration,DATE_FORMAT(learningTime,'%Y-%m-%d') learningTime from s_itedu_user where openId = '${data.openid}'`
				if (totalUser[0].cnt <= 0) {
					let nowTime = await query(`select DATE_FORMAT(NOW(),'%Y-%m-%d') now`)
					let time = nowTime[0].now
					let insertUser = await query(`insert into s_itedu_user(openId,learningTime) values('${data.openid}','${time}')`)
					if (insertUser.affectedRows >= 1) {
						let userInfo = await query(selectUserSql)
						ctx.body = {
							code : 1,
							data : userInfo[0],
							msg : '添加成功'
						}
					}else {
                        ctx.body = {
                            code : 0,
                            data : null,
                            msg : '添加失败'
                        }
					}
				} else {
                    let userInfo = await query(selectUserSql)
					let userLearningTime = userInfo[0].learningTime
                    let nowTime = await query(`select DATE_FORMAT(NOW(),'%Y-%m-%d') now`)
                    let time = nowTime[0].now
					if (userLearningTime !== time) {
						await query(`update s_itedu_user set learningDays=learningDays+1,learningTime='${time}' where openid='${data.openid}'`)
                        userInfo = await query(selectUserSql)
					}
                    ctx.body = {
                        code : 1,
                        data : userInfo[0]
                    }
				}
	        }else{
	            ctx.body = {
	                code : 0,
	                err:'openid获取失败'
	            }
	        }
	    } catch (err) {
	        ctx.body = {
	            code : 0,
	            err: err.message
	        }
	    }
	},
	//小程序端loginAuth(授权登录)(IT教育公开课)
	iteduLoginAuth: async (ctx,next) => {
	    try {
	        const params = ctx.request.body
	        const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
	            params: {
	              appid: Config.itAppId,
	              secret: Config.itSecret,
	              js_code: params.code,
	              grant_type: 'authorization_code'
	            }
	        })
	        if(res.data){
	        	const resData = res.data
	            const sessionKey = res.data.session_key
	            const pc = new WXBizDataCrypt(Config.itAppId, sessionKey)
	            const data = pc.decryptData(params.encryptedData , params.iv)
                let selectUserSql = `select id,nickname,avatarUrl,phone,courseIds,learningDays,learningCourseNum,learningDuration from s_itedu_user where openId = '${resData.openid}'`
				let upDateUser = await query(`update s_itedu_user set unionid='${data.unionId}',nickname='${data.nickName}',avatarUrl='${data.avatarUrl}' where openId = '${resData.openid}'`)
				if (upDateUser.affectedRows === 1) {
					let userInfo = await query(selectUserSql)
					ctx.body = {
						code : 1,
						data : userInfo[0]
					}
				} else {
                    ctx.body = {
                        code : 0,
                        data : null
                    }
				}
	        }
	    } catch (err) {
	        ctx.body = {
	            success: false,
	            err: err.message
	        }
	    }
	},
	//授权手机号
	iteduAuthPhone : async ctx => {
		try {
            let { code ,encryptedData ,iv }	= ctx.request.body
            const res = await Axios.get('https://api.weixin.qq.com/sns/jscode2session', {
                params: {
                    appid: Config.itAppId,
                    secret: Config.itSecret,
                    js_code: code,
                    grant_type: 'authorization_code'
                }
            })
            if (res.data) {
                const sessionKey = res.data.session_key
                const openId = res.data.openid
                const pc = new WXBizDataCrypt(Config.itAppId, sessionKey)
                const data = pc.decryptData(encryptedData , iv)
                const phone = data.phoneNumber
                console.log(data)
                let updateData = await query(`update s_itedu_user set phone = ${phone} where openId = '${openId}'`)
                if (updateData.affectedRows >= 1) {
                    let userData = await query(`select id,nickname,avatarUrl,phone,courseIds,learningDays,learningCourseNum,learningDuration,DATE_FORMAT(learningTime,'%Y-%m-%d') learningTime from s_itedu_user where openId = '${openId}'`)
                    ctx.body = {
                        success : true,
                        data : userData[0]
                    }
                } else {
                    ctx.body = {
                        success : false,
                        err : '授权失败'
                    }
                }
            }
        }catch (e) {
			ctx.body = {
				code : 0,
				err : e
			}
        }
	},
	//是否显示内容
    iteduIsShowContent : async ctx => {
		try {
            let { name } = ctx.request.body
            let data = await query(`select * from s_content_config where name = '${name}'`)
            let isShow = data[0].is_show === 1 ? true : false
            ctx.body = {
                code : 1,
                data : isShow
            }
        }catch (e) {
			ctx.body = {
				code : 0,
				err : e
			}
        }
	}
}
