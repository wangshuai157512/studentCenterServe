const Axios = require('axios');
const Request = require('request');
const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Common = require('../service/commonService');
const shoppingService = require('../service/shoppingService');
const baseUrl = require('../service/baseUrl');
const getRawBody = require('raw-body')
const Config = require('../utils/config.js');

/**
 * 生成前端调启支付界面的必要参数
 * @param {String} prepay_id
 */
const getClientPayConfig = (prepay_id)=>{
    let obj = {
        appId: Config.teacherAppid,
        timeStamp: String(Math.floor(Date.now()/1000)),
        nonceStr: shoppingService.getNonceStr(32),
        package: 'prepay_id=' + prepay_id,
        signType: 'MD5'
    }
    let arr = Object.keys(obj).sort().map(item => {
        return `${item}=${obj[item]}`;
    });
    let str = arr.join('&') + '&key=' + Config.key;
    obj.paySign = shoppingService.getSign(str);
    return obj;
}

router.prefix(baseUrl.baseUrl+'/api/app_shopping')
// 支付
router.post('/pay', async(ctx, next) => {
    //payType 0:课程 1:资料
    try {
        let bodyCtx = ctx.request.body;
        let obj = {
            appid: Config.teacherAppid,
            mch_id: Config.mchid,
            nonce_str: bodyCtx.isOrderPay ? bodyCtx.nonceStr : shoppingService.getNonceStr(32),
            body: bodyCtx.desc,
            out_trade_no: bodyCtx.isOrderPay ? bodyCtx.merchOrderId : Common.getRandomString(),
            total_fee: parseInt(bodyCtx.totalPrice * 100),
            spbill_create_ip: Config.spbill_create_ip,
            notify_url: bodyCtx.notify_url,
            trade_type: 'JSAPI',
            openid: bodyCtx.openId,
        }
        // console.log(obj)
        // js的默认排序即为ASCII的从小到大进行排序(字典排序)
        let arr = Object.keys(obj).sort().map(item => {
            return `${item}=${obj[item]}`;
        });
        // 这里拼接签名字符串的时候一定要注意: 商户的key是要单独拿出来拼在最后面的
        let str = arr.join('&') + '&key=' + Config.key;
        obj.sign = shoppingService.getSign(str);

        let bodyRes = await Axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', shoppingService.json2xml(obj))
        let newObj = shoppingService.parseXml(bodyRes.data).xml;
        if(newObj.return_code === 'SUCCESS' && newObj.result_code === 'SUCCESS') {
            let newRes = getClientPayConfig(newObj.prepay_id)
            if(newRes) {
                if(bodyCtx.isOrderPay) {
                        ctx.body = {
                            success: true,
                            prepayId: newObj.prepay_id,
                            outTradeNo: obj.out_trade_no,
                            res: newRes,
                        }
                }else{
                    let t = await shoppingService.setOrder(bodyCtx.id,bodyCtx.courseId,obj.nonce_str,obj.out_trade_no,bodyCtx.payType,bodyCtx.couponId,bodyCtx.totalPrice);
                    if(t || typeof t === 'number'){
                        ctx.body = {
                            success: true,
                            prepayId: newObj.prepay_id,
                            outTradeNo: obj.out_trade_no,
                            res: newRes,
                            orderId: t,
                        }
                    }
                }

            }
        }else{
            ctx.body = {
                success: false,
                err: newObj.err_code_des,
            }
        }

    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 用户付款
// router.post('/payMoney', async(ctx, next) => {
//      try {
//         let body = ctx.request.body;
//         let sql = 'update s_teacher_userorder set isPay = 1 where id = ?';
//         let params = [body.orderId];
//         let res = await query(sql, params);
//         if (res.affectedRows == 1) {
//             ctx.body = {
//                 success: true,
//                 msg: '支付成功'
//             }
//         }
//     } catch (err) {
//         console.log(err)
//         ctx.body = {
//             success: false,
//             err: err.message
//         }
//     }
// }) 

router.post('/getOrder', async(ctx, next) => {
     try {
        let body = ctx.request.body;
        let data = {
            appid: Config.teacherAppid,
            mch_id: Config.mchid,
            nonce_str: shoppingService.getNonceStr(32),//随机字符串
            transaction_id: 123,//微信订单号
        }
        // js的默认排序即为ASCII的从小到大进行排序(字典排序)
        let arr = Object.keys(data).sort().map(item => {
            return `${item}=${data[item]}`;
        });
        // 这里拼接签名字符串的时候一定要注意: 商户的key是要单独拿出来拼在最后面的
        let str = arr.join('&') + '&key=' + Config.key;
        data.sign = shoppingService.getSign(str);
        let res = await Axios.post('https://api.mch.weixin.qq.com/pay/orderquery', data)
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

router.post('/sendTemplate', async(ctx, next) => {
  try {
      let body = ctx.request.body;
      let sql = 'select * from s_teacher_user where id = ?';
      let params = [body.userId]
      let res = await query(sql, params);
      if(body.prepayId && res && res.length > 0){
          let t = await shoppingService.NotifyMsg(res[0].openId,body.prepayId,body.outTradeNo,body.courseName,body.price,body.courseId)
          switch(t) {
            //失败
            case (0):
                ctx.body = {
                    success: false,
                    err: '系统异常！'
                }
                break;
            case (1):
                ctx.body = {
                    success: true
                }
                break;
          }
      }else{
          ctx.body = {
              success: false,
          }
      }
  } catch (err) {
      ctx.body = {
          success: false,
          err: err.message
      }
  }
})

router.post('/accept', async(ctx, next) => {
     try {
        //转化字节流
        let newData = await getRawBody(ctx.req,{
            length: ctx.request.length,
            limit: "1mb",
            encoding: ctx.request.charset
        });
        //转字符串xml
        let data = newData.toString();
        let dataJson = await shoppingService.parseStringAsync(data)
        console.log(dataJson.xml)
        if(dataJson.xml.return_code[0] === 'SUCCESS' && dataJson.xml.result_code[0] === 'SUCCESS') {
            console.log(dataJson.xml)
            let t = await shoppingService.setOrderState(dataJson.xml.out_trade_no, dataJson.xml.cash_fee[0])
            switch(t) {
                //商户号不存在
                case (-1):
                    ctx.body = {
                        success: false,
                        msg: '商户号不存在'
                    }
                    break;
                //商户号存在，状态修改失败
                case (0):
                    ctx.body = {
                        success: false,
                        err: '系统异常！'
                    }
                    break;
                case (1):
                    console.log('成功')
                    // const resXml = "<xml>" + "<return_code><![CDATA[SUCCESS]]></return_code>" +
                    //     "<return_msg><![CDATA[OK]]></return_msg>" + "</xml> "
                    //     ctx.body = {
                    //         resXml
                    //     }
                    ctx.body = 'SUCCESS'
                    break;
            }
        }
    } catch (err) {
        console.log(err)
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

router.get('/acceptMsg', async(ctx, next) => {
  try {
      let body = ctx.request.query;
      let echostr, nonce, signature, timestamp;
      signature = body.signature;
      timestamp = body.timestamp;
      nonce = body.nonce;
      echostr = body.echostr;
      if(shoppingService.check(timestamp,nonce,signature,'myToken117023HCJYXXZX')){
          ctx.body = echostr
      }else{

      }
  } catch (err) {
      ctx.body = {
          success: false,
          err: err.message
      }
  }
})

//客服消息
router.post('/acceptMsg', async(ctx, next) => {
  try {
      let body = ctx.request.body;
      // console.log('收到消息')
      // console.log(body)
      ctx.body = 'success'
  } catch (err) {
      ctx.body = {
          success: false,
          err: err.message
      }
  }
})

module.exports = router
