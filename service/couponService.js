const Axios = require('axios');
const redisClient = require('../bus/redisAdapter');
const query = require('../bus/mysqlDal');
const multer = require('koa-multer'); //加载koa-multer模块
const jwt = require('jsonwebtoken');
const util = require('util');
const verify = util.promisify(jwt.verify);
const Config = require('../utils/config.js');

//children节点
const getChildrenList = async function(item) {
  const courseList = item;
  for(var i = 0;i<item.length;i++){
    courseList[i].courseNameList = item[i].courseList.split(',');
    courseList[i].courseNameList.pop();
    for(var j = 0;j<courseList[i].courseNameList.length;j++){
      const sql = 'select s_coupon_course.sign,s_coupon_course.id from s_coupon_course where id = ' + courseList[i].courseNameList[j];
      const res = await query(sql);
      courseList[i].courseNameList[j] = {courseId:res[0].id,courseSign:res[0].sign};
    }
  }
  return courseList;
};


//移除课程包课程，修改courseList
const editChildrenList = function (courseList, courseId) {
  let newCourseList = '';
  const list = courseList.split(',');
  const index = list.indexOf(String(courseId));
  if(index > -1){
    // 存在
    list.pop();
    list.splice(index, 1);
    if(list.length > 0) {
      for(var i = 0;i<list.length;i++){
        newCourseList += list[i] + ',';
      }
    }
  }
  return newCourseList;
}


// 新增课程包，增加关联表
const addCourse = async function (courseTypeId, courseId) {
  let t = 0;
  const sql = `INSERT INTO s_coupon_course_coursetype (courseId, courseTypeId)
  values (${courseId}, ${courseTypeId})`;
  const res = await query(sql);
  if(res.affectedRows) {
    t = 1;
  }else{
    t = -1;
  }
  return t;
}

//获取不属于工服人员是否支付过课程
const getLookMsg = async function(userId, courseTypeId) {
  let couponData = {};
  const sql = 'select a.isPay from s_coupon_userorder a where a.userId = "'+userId+'" and a.courseTypeId = "'+courseTypeId+'" and a.isPay = 1';
  const res = await query(sql);
  if(res && res.length > 0) {
    // 用户已完成支付
    couponData = {
      isPay: 1,
    }
  } else if(res && res.length == 0){
    // 用户未下单或未支付
    const newSql = 'select b.oldPrice from s_coupon_coursetype b where b.id = ' + courseTypeId;
    const newRes = await query(newSql);
    couponData = {
      isPay: 0,
      actualPrice: newRes[0].oldPrice,
      oldPrice: newRes[0].oldPrice,
    }
  }
  return couponData;
}


module.exports = {
    getChildrenList: getChildrenList,
    editChildrenList: editChildrenList,
    getLookMsg: getLookMsg,
    addCourse: addCourse,
};