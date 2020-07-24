const query = require('../../../bus/mysqlDal');
const config = require('../../../utils/config')
const axios = require('axios')

let controller = {
    createCode : async ctx => {
        let userId = ctx.request.body.id
        let appid = config.zypxkAppid
        let secret = config.zypxkAppSecret
        // let appid = 'wx40c26250795b28d6'
        // let secret = 'c48428322775935d481fda0f12db0149'
        let data = await axios({
            url : `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            method : 'get',
        })
        let accessToken = data.data.access_token
        // console.log(data)
        let codeData = await axios({
            url : `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
            method: 'post',
            data : {
                scene : `userId=${userId}`,
                page : 'pages/index/index'
                // scene : `isTeacher=1`,
                // page : 'pages/userCode/userCode/'
                // page : 'pages/loginhome/loginhome'
            },
            json : true,
            encoding : null,
            responseType : 'arraybuffer'
        })
        let img = new Buffer(codeData.data).toString('base64');
        console.log(img)
        ctx.body = {
            code : 1,
            data : img
        }
    },
    createTeacherCode : async ctx => {
        let appid = config.zypxkAppid
        let secret = config.zypxkAppSecret
        let data = await axios({
            url : `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
            method : 'get',
        })
        let accessToken = data.data.access_token
        console.log(data.data)
        let codeData = await axios({
            url : `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
            method: 'post',
            data : {
                scene : `a=1`,
                page : 'pages/teacherIndex/teacherIndex'
            },
            json : true,
            encoding : null,
            responseType : 'arraybuffer'
        })
        let img = new Buffer(codeData.data).toString('base64');
        console.log(img)
        ctx.body = {
            code : 1,
            data : img
        }
    }
}

module.exports = controller
