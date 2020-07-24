const query = require('../../../bus/mysqlDal');
const config = require('../../../utils/config')
const dateTime = require('../../../utils/dateTime')
const axios = require('axios')

let controller = {
    subMsg : async(openId,name)=> {
        let appid = config.zypxkAppid
        let secret = config.zypxkAppSecret
        let myDate = new Date()
        myDate = dateTime.formatTime(myDate)
        let data = await axios({
            url : `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            method : 'get',
        })
        let accessToken = data.data.access_token
        let takeMsg = await axios({
            url : `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
            method: 'post',
            data : {
                    "touser": openId,
                    "template_id": "mYgdiiOxgQDUmpfhpzhmWKPo1sGDaQCjyUB-RqvRSrw",
                    "page": "pages/myShare/myShare",
                    "data": {
                        "thing1": {
                            "value": name
                        },
                        "time2": {
                            "value": myDate
                        } ,
                        "thing5": {
                            "value": "客户信息请联系市场部获取"
                        }
                    }
            }

        })
        // console.log(takeMsg.data)
    },

    addUser : async ctx => {
        try {
            let { name,phone,marks,channel,shareUserId } = ctx.request.body
            let totalNum = await query(`select count(*) c from s_xc_form_user where phone = '${phone}'`)
            if (totalNum[0].c > 0) {
                ctx.body = {
                    code : 2
                }
            } else {
                if(shareUserId) {
                    var insertData = await query(`insert into s_xc_form_user(name,phone,marks,channel,shareUserId) values('${name}','${phone}','${marks?marks:''}',${channel},${shareUserId})`)
                }else {
                    var insertData = await query(`insert into s_xc_form_user(name,phone,marks,channel) values('${name}','${phone}','${marks?marks:''}',${channel})`)
                }
                
                if (insertData.affectedRows >= 1) {
                    ctx.body = {
                        code : 1
                    }
                    if(shareUserId) {
                        console.log(shareUserId)
                        let openId = await query(`select openid from s_xc_user where id = ${shareUserId}`)
                        let resultOpenId = openId[0].openid
                        controller.subMsg(resultOpenId,name)
                    }
                    
                } else {
                    ctx.body = {
                        code : 0
                    }
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    }
}

module.exports = controller
