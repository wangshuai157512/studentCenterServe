const query = require('../bus/mysqlDal');
const crypto = require('crypto')
const xml2js = require('xml2js')
const Parser = new xml2js.Parser()
const CommonService = require('./commonService');
const redisClient = require('../bus/redisAdapter');
const Config = require('../utils/config.js');
const Axios = require('axios');

/**
 * 生成指定长度的随机数
 * @param {*int} len
 */
const getNonceStr = (len)=>{
    let str = '';
    while(str.length < len){
        str +=  Math.random().toString(36).slice(2);
    }
    return str.slice(-len);
}

/**
 * 对指定字符串进行md5加密
 * @param {String} str
 */
const getSign = (str)=>{
    let hash = crypto.createHash('md5').update(str,'utf8');
    return hash.digest('hex').toUpperCase();
}

/**
 * 转化xml用了xml2js库
    https://github.com/Leonidas-from-XIV/node-xml2js
 * @param {Object} obj
 */
const json2xml = (obj)=>{
    let builder = new xml2js.Builder({
        headless:true,
        allowSurrogateChars: true,
        rootName:'xml',
        cdata:true
    });
    const xml = builder.buildObject(obj);
    return xml;
}

const parseXml = (xml)=>{
    let {parseString} = xml2js;
    let res;
    parseString(xml,  {
        trim: true,
        explicitArray: false
    }, function (err, result) {
        res = result;
    });
    return res;
}

//存储小程序(教师资格证)订单
const setOrder = async (userId,courseId,nonce_str,out_trade_no,payType,couponId,total_fee) => {
  let t=1,
      sql,
      res
  if (payType == 0) {
      let totalOrder = await query(`select count(*) total from s_teacher_userorder where courseId = ${courseId} and isPay = 0 and userId = ${userId}`)
      // if (totalOrder[0].total === 0) {
          let end_time = await query(`select DATE_FORMAT(DATE_ADD(NOW(),INTERVAL 30 minute),'%Y-%m-%d %H:%i:%s') end_time`)
          if (couponId) {
              sql = `INSERT INTO s_teacher_userorder (userId,courseId,merchOrderId,nonceStr,isPay,isDel,state,date,endTime,shouldPayMone,couponId) 
          values (${userId},${courseId},'${out_trade_no}','${nonce_str}',0,0,0,'${CommonService.getNowDate()}','${end_time[0].end_time}',${total_fee},${couponId})`
              await query(`update s_teacher_user_coupon set state = 1 where user_id=${userId} and id = ${couponId}`)
          } else {
              sql = `INSERT INTO s_teacher_userorder (userId,courseId,merchOrderId,nonceStr,isPay,isDel,state,date,endTime,shouldPayMone) 
          values (${userId},${courseId},'${out_trade_no}','${nonce_str}',0,0,0,'${CommonService.getNowDate()}','${end_time[0].end_time}',${total_fee})`
          }
          await query(sql);
      // }
  }else {
      let totalOrder = await query(`select count(*) total from s_teacher_data_order where dataId = ${courseId} and isPay = 0 and userId = ${userId}`)
      // if (totalOrder[0].total === 0) {
          let end_time = await query(`select DATE_FORMAT(DATE_ADD(NOW(),INTERVAL 30 minute),'%Y-%m-%d %H:%i:%s') end_time`)
          if (!couponId) {
              sql = `insert into s_teacher_data_order (userId,dataId,merchOrderId,nonceStr,isPay,isDel,date,endTime,shouldPayMone) 
              values (${userId},${courseId},'${out_trade_no}','${nonce_str}',0,0,'${CommonService.getNowDate()}','${end_time[0].end_time}',${total_fee})
              `
          }else {
              sql = `insert into s_teacher_data_order (userId,dataId,merchOrderId,nonceStr,isPay,isDel,date,endTime,shouldPayMone,couponId) 
              values (${userId},${courseId},'${out_trade_no}','${nonce_str}',0,0,'${CommonService.getNowDate()}','${end_time[0].end_time}',${total_fee},${couponId})
              `
          }
      // }
      await query(sql);
  }
    // if (res.insertId) {
    //     t = res.insertId
    // }
    return t;
}

//存储小程序(阿波罗小程序)订单
const setCouponOrder = async (userId,courseTypeId,nonce_str,out_trade_no,total_fee) => {
  let t;
  const sql = 'INSERT INTO s_coupon_userorder (userId,courseTypeId,merchOrderId,nonceStr,isPay,isDel,date,isPast,shouldPayMoney) values ("'+
    userId+'","'+courseTypeId+'","'+out_trade_no+'","'+nonce_str+'",0,0,"'+CommonService.getNowDate()+'",0,"'+total_fee+'")';
  const res = await query(sql);
    if (res.insertId) {
      t = res.insertId;
    }
  return t;
}

//转化xml
const parseStringAsync = (xml) => {
    return new Promise((resolve, reject) => {
        Parser.parseString(xml, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

//支付成功后修改状态
const setOrderState = async (out_trade_no, cash_fee) => {
  console.log('wangshuaoojdijdoo')
    const cashFloat = Number(cash_fee)*0.01
    let t;
    let sql = 'select count(*) as cnt from s_teacher_userorder where merchOrderId = ? and isPay <> 3';
    let dataCount = await query(`select count(*) cnt from s_teacher_data_order where merchOrderId = '${out_trade_no}' and isPay <> 3`)
    let params = [out_trade_no]
    let res = await query(sql, params);
    if (res[0].cnt + dataCount[0].cnt > 0) {
      console.log('752wangshuaoojdijdoo')
        let newRes;
        if (res[0].cnt > 0) {
            let newSql = 'update s_teacher_userorder set isPay = 1, actualPayMoney = ? ,date = "'+CommonService.getNowDate()+'" where merchOrderId = ?';
            let newParams = [cashFloat,out_trade_no]
          console.log('567')
            newRes = await query(newSql,newParams);
        } else {
            newRes = await query(`update s_teacher_data_order set isPay = 1,actualPayMoney = ${cashFloat} ,date = '${CommonService.getNowDate()}' where merchOrderId = '${out_trade_no}'`)
        }
        if (parseInt(newRes.affectedRows) === 1) {
            t = 1;
        } else {
            t = 0;
        }
    } else {
        t = -1;
    }
    return t;
}


//支付成功后修改状态(阿波罗小程序)
const setCouponOrderState = async (out_trade_no, cash_fee) => {
    const cashFloat = Number(cash_fee)*0.01
    let t;
    let sql = 'select count(*) as cnt from s_coupon_userorder where merchOrderId = ?';
    let params = [out_trade_no]
    let res = await query(sql, params);
    if (res[0].cnt > 0) {
        let newSql = 'update s_coupon_userorder set isPay = 1, actualPayMoney = ?, date = "'+CommonService.getNowDate()+'" where merchOrderId = ?';
        let newParams = [cashFloat, out_trade_no]
        let newRes = await query(newSql,newParams);
        if (parseInt(newRes.affectedRows) === 1) {
            t = 1;
        } else {
            t = 0;
        }
    } else {
        t = -1;
    }
    return t;
}

//支付成功后通知用户消息
const NotifyMsg = async (openId,prepayId,outTradeNo,courseName,price,courseId) => {
  let tokenRes = await redisClient.get('access_token')
  let t;
  if(tokenRes) {
      let res = await Axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='+tokenRes, {
        template_id: 'HZTr3h5GNmF6Rif6fXGwf-MF01cYyUxlW8AlmvR0xCE',
        touser: openId,
        form_id: prepayId,
        page: "pages/indexDetail/indexDetail?courseId="+courseId,
        data: {
          keyword1: {
            value: price + '元'
          },
          keyword2: {
            value: courseName
          },
          keyword3: {
            value: outTradeNo
          },
          keyword4: {
            value: "已支付"
          },
          keyword5: {
            value: CommonService.getNowDateNormal()
          },
          keyword6: {
            value: "恭喜你！离证书又近了一步~现在添加客服微信（zhiye02）联系她吧~"
          }
        },
        emphasis_keyword: "keyword1.DATA"
      })
     console.log('通知',res.data)
    if(res.data.errcode === 0 && res.data.errmsg === 'ok') {
        t = 1;
    }else{
        t = 0;
    }
  }else {
      let tokenRes = await Axios.get('https://api.weixin.qq.com/cgi-bin/token', {
          params: {
            grant_type: 'client_credential',
            appid: Config.teacherAppid,
            secret: Config.teacherSecret,
          }
      })
      if(tokenRes.data.access_token) {
          redisClient.set('access_token', tokenRes.data.access_token, 7200)
      }
      let res = await Axios.post('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='+tokenRes.data.access_token, {
        template_id: 'HZTr3h5GNmF6Rif6fXGwf-MF01cYyUxlW8AlmvR0xCE',
        touser: openId,
        form_id: prepayId,
        data: {
          keyword1: {
            value: price + '元'
          },
          keyword2: {
            value: courseName
          },
          keyword3: {
            value: outTradeNo
          },
          keyword4: {
            value: "已支付"
          },
          keyword5: {
            value: CommonService.getNowDateNormal()
          },
          keyword6: {
            value: "亲爱的同学，请联系学程裴老师领取课程（微信、手机）：18734718381，祝您学习愉快！"
          }
        },
        emphasis_keyword: "keyword1.DATA"
      })
      if(res.data.errcode === 0 && res.data.errmsg === 'ok') {
        t = 1;
      }else{
        t = 0;
      }
  }
  return t;
}

const check = (timestamp, nonce, signature ,token) => {
  let currSign, tmp;
  tmp = [token, timestamp, nonce].sort().join("");
  currSign = crypto.createHash("sha1").update(tmp).digest("hex");
  return currSign === signature;
};

module.exports = {
    getNonceStr: getNonceStr,
    getSign: getSign,
    json2xml: json2xml,
    parseXml: parseXml,
    setOrder: setOrder,
    setCouponOrder: setCouponOrder,
    parseStringAsync: parseStringAsync,
    setOrderState: setOrderState,
    setCouponOrderState: setCouponOrderState,
    check: check,
    NotifyMsg: NotifyMsg,
};
