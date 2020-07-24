const Axios = require('axios');
const redisClient = require('../bus/redisAdapter');
const query = require('../bus/mysqlDal');
const multer = require('koa-multer'); //加载koa-multer模块
const jwt = require('jsonwebtoken');
const util = require('util');
const verify = util.promisify(jwt.verify);
const Config = require('../utils/config.js');

Date.prototype.format = function(fmt) {
  const o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
     for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
         }
     }
    return fmt;
}

function randomNum(n){
    let t='';
    for(var i=0;i<n;i++){
        t += Math.floor(Math.random()*10);
    }
    return t;
}

//生成随机字符串
let getRandomString = (prefix) => {
  return (prefix || '') + new Date().format("yyyyMMddhhmmss") + randomNum(4);
}

let getNowDate = () => {
    return new Date().format("yyyy-MM-dd hh:mm:ss")
}

let getNowDateNormal = () => {
    return new Date().format("yyyy年MM月dd日 hh:mm:ss")
}

//文件(音乐)上传
//配置
const storage = multer.diskStorage({
    //文件保存路径
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/musics')
    },
    //修改文件名称
    filename: function(req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '-' + (Math.round(Math.random() * 89999 + 10000)).toString() + "." + fileFormat[fileFormat.length - 1]);
    }
})
const upload = multer({
    storage: storage
});

//文件(图片)上传
//配置
const storageImages = multer.diskStorage({
    //文件保存路径
    destination: function(req, file, cb) {
        cb(null, 'public/wx/uploads/images')
    },
    //修改文件名称
    filename: function(req, file, cb) {
        var fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + '-' + (Math.round(Math.random() * 89999 + 10000)).toString() + "." + fileFormat[fileFormat.length - 1]);
    }
})
const uploadImages = multer({
    storage: storageImages
});

//判断用户是否登录
const isLogin = async function(token) {
  const userId = await redisClient.get(token);
    if (userId != null) {
        redisClient.set(token, userId, 3600);
        return true;
    } else {
        return false;
    }
};

//判断管理端人员token是否过期
const isTeacherLogin = async function(xToken) {
    if(xToken) {
        try {
            // 解密payload，获取用户名和ID
            let payload = await verify(xToken, Config.tokenSecret);
            if (payload.name && payload.name === 'admin'){
                return true;
            } else {
                return false;
            }
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}

//根据token获取用户
const getUserByToken = async function(token) {
  const user = await redisClient.get(token);
    return JSON.parse(user);
};

//存储小程序openid信息
const setOpenId = async function (openId) {
    let t = 0;
  const sql = "select count(*) as cnt from s_intergral_user where openId = ?";
  const params = [openId];
  const res = await query(sql,params);
    if (res[0].cnt > 0) {
        t = -1;
    } else {
      const newSql = 'INSERT INTO s_intergral_user (openId,share_num) values ("'+openId+'",0)';
      const newRes = await query(newSql)
        if (newRes.insertId) {
            t = 1;
        } else {
            t = 0;
        }
    }
    return t;
}

//存储小程序token等用户信息
const setUserInfo = async function (openId,nickName,avatarUrl) {
  let t = 0;
  const sql = "select count(*) as cnt from s_intergral_user where openId = ?";
  const params = [openId];
  const res = await query(sql,params);
    if (res[0].cnt > 0) {
      const newSql = 'update s_intergral_user set user = ?,avatarUrl = ? where openId = ?';
      const newParams = [nickName,avatarUrl,openId];
      const newRes = await query(newSql,newParams);
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

//存储小程序(教师资格证)openid信息
const setTeacherOpenId = async function (openId) {
  let t = 0;
  const sql = "select count(*) as cnt from s_teacher_user where openId = ?";
  const params = [openId];
  const res = await query(sql,params);
  console.log(res)
    if (res[0].cnt > 0) {
        t = -1;
    } else {
      const newSql = 'INSERT INTO s_teacher_user (openId,isShare,isShareCourse) values ("'+openId+'",0,0)';
      const newRes = await query(newSql)
        if (newRes.insertId) {
            t = 1;
        } else {
            t = 0;
        }
    }
    return t;
}

//存储小程序(教师资格证)token等用户信息
const setTeacherUserInfo = async function (openId,token,nickName,avatarUrl,recommenderToken,type,id) {
    let t = 0;
    const sql = "select count(*) as cnt from s_teacher_user where openId = ?";
    const params = [openId];
    const res = await query(sql,params);
    if (res[0].cnt > 0) {
      const newSql = 'update s_teacher_user set user = ?,avatarUrl = ?,token = ? where openId = ?';
      const newParams = [nickName,avatarUrl,token,openId];
      const newRes = await query(newSql,newParams);
        if (parseInt(newRes.affectedRows) === 1) {
            if(recommenderToken){
                // 修改推荐人状态
                if(parseInt(type) === 0){
                  let addSql = 'update s_teacher_user set isShare = 1 where token = ?';
                  let addParams = [recommenderToken];
                  let addRes = await query(addSql,addParams);
                }else{
                  let addSql = 'update s_teacher_user set isShareCourse = 1 where token = ?';
                  let addParams = [recommenderToken];
                  let addRes = await query(addSql,addParams);
                    if(parseInt(addRes.affectedRows) === 1) {
                        //分享面试课成功后增加分享记录
                        // var shareSelectSql = 'select * from s_teacher_user where openId = ' + openId;
                        // var shareSelectRes = await query(shareSelectSql);
                        // console.log(shareSelectRes[0].id)
                        // if(shareSelectRes && shareSelectRes[0].id){
                            //判断是否为第一次成功分享
                            const isFirstSql = 'select count(*) as cnt from s_teacher_shareorder where userId = ?';
                            const isFirstParams = [id];
                            const isFirstRes = await query(isFirstSql, isFirstParams);
                            if (isFirstRes[0].cnt > 0) {
                                // 不是第一次分享，增加分享次数
                              const addShareSql = 'update s_teacher_shareorder set shareNum = (shareNum+1) where userId = ?';
                              const addShareParams = [id];
                              const addShareRes = await query(addShareSql, addShareParams);
                            } else {
                                // 是第一次分享
                                // var shareId = shareSelectRes[0].id;
                              const shareSql = 'INSERT INTO s_teacher_shareorder (userId,shareNum,bill,state) values ("'+id+'",1,"'+getRandomString('LJBM')+'",0)';
                              const shareRes = await query(shareSql);
                            }
                    }
                }
            }
            t = 1;
        } else {
            t = 0;
        }
    } else {
        t = -1;
    }
    return t;
}

//存储小程序(阿波罗小程序)openid信息
const setCouponOpenId = async function (openId) {
  let t = 0;
  const sql = "select count(*) as cnt from s_coupon_user where openId = ?";
  const params = [openId];
  const res = await query(sql,params);
    if (res[0].cnt > 0) {
        t = -1;
    } else {
      const newSql = 'INSERT INTO s_coupon_user (openId, state) values ("'+openId+'",0)';
      const newRes = await query(newSql)
        if (newRes.insertId) {
            t = 1;
        } else {
            t = 0;
        }
    }
    return t;
}

//存储阿波罗小程序用户信息
const setCouponUserInfo = async function (openId,nickName,avatarUrl) {
  let t = 0;
  const sql = "select count(*) as cnt from s_coupon_user where openId = ?";
  const params = [openId];
  const res = await query(sql,params);
    if (res[0].cnt > 0) {
      const newSql = 'update s_coupon_user set nickName = ?,avatarUrl = ?,state = 2 where openId = ?';
      const newParams = [nickName,avatarUrl,openId];
      const newRes = await query(newSql,newParams);
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

//存储阿波罗小程序手机号
const setCouponPhone = async function (userId, phone, openId) {
  let t = 0;
  const res = await Axios.get(Config.apolloAuth, {
    params:{
      mobile: phone,
    }
  })
  const status = res.data.status;
  // const status = 1;
  if (Number(status) === 1) {
    // 属于学员
    let sql = "update s_coupon_user set phone = ?,state = 1,isStudent = 1 where openId = ?";
    let params = [phone, openId];
    let reser = await query(sql,params);
      if (parseInt(reser.affectedRows) === 1) {
        t = 1;
      } else {
        t = -1;
      }
  } else {
    // 不属于学员
    let sql = "update s_coupon_user set phone = ?,state = 1,isStudent = 0 where openId = ?";
    let params = [phone, openId];
    let reser = await query(sql,params);
    if (parseInt(reser.affectedRows) === 1) {
      t = 0;
    } else {
      t = -1;
    }
  }
  return t;
}

//教师资格证判断是否购买课程
const isPay = async (courseId,userId) => {
    let resData = await query(`SELECT COUNT(*) AS cnt
    FROM s_teacher_userorder
    WHERE userId = ${userId}
        AND courseId = ${courseId}
        AND isPay = 1
        AND isDel = 0`)
    if (resData[0].cnt === 0) {
        return false
    }
    return true
}
//教师资格证查询优惠券是否过期
const conponIsInvalid = async (user_id) => {
    let minuteTime = 60 * 24 * 7
    let dataTime = new Date().getTime()
    await query(`update s_teacher_user_coupon set state=2 
    where ${dataTime} > UNIX_TIMESTAMP(end_time)*1000
        and state=0
        and user_id=${user_id}`)
}

module.exports = {
    upload: upload,
    uploadImages: uploadImages,
    isLogin: isLogin,
    isTeacherLogin: isTeacherLogin,
    getUserByToken: getUserByToken,
    setOpenId: setOpenId,
    setUserInfo: setUserInfo,
    setTeacherOpenId: setTeacherOpenId,
    setTeacherUserInfo: setTeacherUserInfo,
    getRandomString: getRandomString,
    getNowDate: getNowDate,
    getNowDateNormal: getNowDateNormal,
    setCouponOpenId: setCouponOpenId,
    setCouponUserInfo: setCouponUserInfo,
    setCouponPhone: setCouponPhone,
    isPay,
    conponIsInvalid
};
