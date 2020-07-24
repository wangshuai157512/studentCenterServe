const schedule = require('node-schedule')
const query = require('../bus/mysqlDal');
const config = require('../utils/config')
const dateTime = require('../utils/dateTime')
const axios = require('axios')
const create_time = () => new Date().getTime();


const updateCouponState = () => {
    schedule.scheduleJob('30 * * * * *', async () => {
        let dataTime = create_time()
        await query(`update s_teacher_user_coupon set state=2 
        where ${dataTime} > UNIX_TIMESTAMP(end_time)*1000
        and state=0
        `)
    })
}
const updateOrderState = () => {
    schedule.scheduleJob('30 * * * * *', async () => {
        let dataTime = create_time()
        let orderData = await query(`update s_teacher_user_coupon s 
        join (select couponId,userId from s_teacher_userorder where 
        ${dataTime} > UNIX_TIMESTAMP(endTime)*1000
        and isPay = 0) c 
        on  s.id = c.couponId 
        set state = 0 
        where s.id = c.couponId 
            and s.user_id = c.userId
        `)
        await query(`update s_teacher_userorder set isPay=2 
        where ${dataTime} > UNIX_TIMESTAMP(endTime)*1000
        and isPay = 0
        `)
    })
}
const updateAccessToken = () => {
    schedule.scheduleJob('30 * * * * *', async () => {
        let dataTime = create_time()
        await query(`delete from s_study_center_access_token 
        where ${dataTime} > UNIX_TIMESTAMP(end_time)*1000
        `)
    })
}
const updateSquadState = () => {
    schedule.scheduleJob('* * * * * *', async () => {
        let dataTime = create_time()
        let endTime =  dataTime - 24*60*60*1000
    
        let expList = await query(`select * from s_xc_squad where squadState = 2 and ${endTime} > UNIX_TIMESTAMP(createTime)*1000`)
        // console.log(expList)
        for( var i=0; i<expList.length; i++) {
            var msgList = await query(`update s_xc_squad set squadState = 0 where id = ${expList[i].id}`)
            let openId = await query(`select openid from s_xc_user where id = ${expList[i].createUserId}`)
            let materialListName = await query(`select materialName from s_xc_class_category where id = ${expList[i].classId}`)
            console.log(materialListName[0].materialName,963)
            let materialName = materialListName[0].materialName
            let resultOpenId = openId[i].openid
            let appid = config.zypxkAppid
            let secret = config.zypxkAppSecret
            let myDate = new Date()
            myDate = dateTime.formatTime(myDate)
            // console.log(openId,777)
            let data = await axios({
                url : `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
                method : 'get',
            })
            let accessToken = data.data.access_token
            let takeMsg = await axios({
                url : `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${accessToken}`,
                method: 'post',
                data : {
                        "touser": resultOpenId,
                        "template_id": "0q6BvftM_yKS_sXd-4K4UYHcig5CWv0AjNMMsrYlJYQ",
                        "page":`pages/group/group?userId=${expList[i].createUserId}&classId=${expList[i].classId}&squadId=${expList[i].id}`,
                        // "miniprogram_state":"trial",
                        "data": {
                            "thing1": {
                                "value": materialName
                            },
                            "phrase2": {
                                "value": "拼团失败"
                            } ,
                            "thing5": {
                                "value": "别灰心~点击再次发起拼团>>"
                            }
                        }
                }
    
            })
            // console.log(takeMsg.data)
        }

    })
}

module.exports = {
    updateCouponState,
    updateOrderState,
    updateAccessToken,
    updateSquadState
}
