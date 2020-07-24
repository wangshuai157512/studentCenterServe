const query = require('../../../bus/mysqlDal');
const Config = require('../../../utils/config');
const crypto = require('crypto') // 加密模块
const axios = require('axios')
let controller = {
    checking : async ctx => {
        try {
             // 1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
            const {
                signature,
                timestamp,
                nonce,
                echostr
            } = ctx.request.query;
            // 2.将token、timestamp、nonce三个参数进行字典序排序
            let array = [Config.zypxkToken, timestamp, nonce]
            
            array.sort()

            // 3.将三个参数字符串拼接成一个字符串进行sha1加密
            const tempStr = array.join('')
            const hashCode = crypto.createHash('sha1') //创建加密类型
            const resultCode = hashCode.update(tempStr, 'utf8').digest('hex')

            // 4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
            if (resultCode === signature) {
                ctx.body = echostr;
                console.log(echostr,'echostr')
            } else {
                // 非微信服务器请求
                ctx.body = {
                    code: -1,
                    data: '验证失败'
                };
                console.log('验证失败')
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
