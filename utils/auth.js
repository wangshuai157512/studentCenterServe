const axios = require('axios')
const config = require('./config')
const getOpenid = (code,appid,AppSecret) => {
    return new Promise((resolve, reject) => {
        axios.get('https://api.weixin.qq.com/sns/jscode2session', {
            params: {
                appid: appid,
                secret: AppSecret,
                js_code: code,
                grant_type: 'authorization_code'
            }
        })
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(err)
        })
    })
}
const access_token = () => {
    return new Promise((resolve, reject) => {
        axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.zypxkAppid}&secret=${config.zypxkAppSecret}`)
        .then(res => {
            resolve(res.data)
        })
        .catch(err => {
            reject(err)
        })
    })
}


module.exports = {
    getOpenid,
    access_token
}
