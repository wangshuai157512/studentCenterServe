const query = require('../../../bus/mysqlDal');
const Config = require('../../../utils/config');
const decryptWXContact = require('../../../service/decryptContact'); // 微信消息解密
const WX = require('../../../service/wx');

let controller = {
    
    checking : async ctx => {
        try {
             // 客服消息自动回复
            const miniapp = new WX({
            token: Config.zypxkToken,
            appID: Config.zypxkAppid,
            appScrect: Config.zypxkAppSecret
            });
            // 接收并处理用户消息
             // 加密方式
            const { ToUserName, Encrypt } = ctx.request.body;
            console.log(ctx.request.body,'999')
            const decryptData = decryptWXContact(Encrypt);
            const { MsgType, FromUserName, MediaId } = decryptData;
            console.log(decryptData)
            
            await miniapp.sendTextMessage(FromUserName, '您好，客服小姐姐稍后上线，请您先留言');

            // 非加密方式
            // const { MsgType, FromUserName, Content,  Event } = ctx.request.body;
            
            ctx.body = 'success';

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
