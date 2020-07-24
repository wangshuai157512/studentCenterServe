// initSysParams.js
const query = require('./mysqlDal');
const mysql = require('mysql');
const redisClient = require('./redisAdapter');

function dateToMs (date) {
    let result = new Date(date).getTime();
    return result;
}
          

const initInterval = async function() {
	// =============[initInterval start]=================
	const data = new Date().getTime();
	const sql = 'select * from s_coupon_coupontype';
	const res = await query(sql);
	if(res && res.length > 0) {
		for(var i = 0;i<res.length;i++){
			if (dateToMs(res[i].endTime) <= data) {
				// 优惠券已过期
				const newSql = 'update s_coupon_coupontype set overTime = 1 where id =' + res[i].id;
				const newRes = await query(newSql);
			} else {
				// 优惠券均未过期
			}
		}
	}
	// =============[initInterval end]=================
};

const initOrderInterval = async function() {
	// =============[initOrderInterval start]=================
	const data = new Date().getTime();
	const sql = 'select * from s_coupon_userorder';
	const res = await query(sql);
	if(res && res.length > 0) {
		for(var i = 0;i<res.length;i++){
			// 设置订单的过期期限为一天
			if (dateToMs(res[i].date) + 24*60*60*1000 <= data) {
				// 订单已过期
				const newSql = 'update s_coupon_userorder set isPast = 1 where isPay = 0 and id =' + res[i].id;
				const newRes = await query(newSql);
			} else {
				// 优惠券均未过期
			}
		}
	}
	// =============[initOrderInterval end]=================
};

setInterval(()=>{
	initInterval();
	initOrderInterval();
},1000*60);