const fs = require('fs');
const path = require('path');
const request = require('request-promise');

const axios = require('axios')

const Config = require('../utils/config');
const domain = `https://api.weixin.qq.com`;
const apis = {
  token: `${domain}/cgi-bin/token`, // 获取token
  sendMessage: `${domain}/cgi-bin/message/custom/send`, // 发送消息
};
const accessTokenJson = require('../utils/auth'); //引入本地存储的 access_token


class Wechat {
  constructor(config) {
    this.config = config;
    this.token = config.token
    this.appID = config.appID
    this.appScrect = config.appScrect
  }

  // 获取AccessToken
//   getAccessToken() {
//     return new Promise((resolve, reject) => {
//       const currentTime = new Date().getTime();
//       console.log(this.appID,'这是APPID')
//       const url = `${apis.token}?grant_type=client_credential&appid=${this.appID}&secret=${this.appScrect}`;
//       // 过期判断
//       if (!accessTokenJson.access_token || accessTokenJson.access_token == '' || accessTokenJson.expires_time < currentTime) {
//         request(url).then(data => {
//           const res = JSON.parse(data);
//           if (data.indexOf('errcode' < 0)) {
//             accessTokenJson.access_token = res.access_token;
//             accessTokenJson.expires_time = new Date().getTime() + (parseInt(res.expires_in) - 200) * 1000;
//             // 存储新的 access_token
//             fs.writeFile('./src/api/message/access_token.json', JSON.stringify(accessTokenJson), (err, res) => {
//               if (err) {
//                 reject();
//                 return;
//               }
//             })
//             resolve(accessTokenJson.access_token);
//           } else {
//             resolve(res);
//           }
//         }).catch((err) => {
//           reject();
//         })
//       } else {
//         resolve(accessTokenJson.access_token);
//       }
//     })
//   }


  // 发送文本消息
  async sendTextMessage(openid, message) {
    const token = await accessTokenJson.access_token()
    let accessToken = token.access_token
    const msgData = {
      "touser": openid,
      "msgtype": 'text',
      "text": {
        "content": message
      }
    }
    let data = await axios({
      method: 'POST',
      url: `${apis.sendMessage}?access_token=${accessToken}`,
      data: msgData
    })
    console.log(data.data,'22222')
  }
}

module.exports = Wechat