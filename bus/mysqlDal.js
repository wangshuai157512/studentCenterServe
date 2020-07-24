const mysql = require("mysql");
const async = require("async");
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'study_center',
    port: 3306,
    timezone: "+08:00",
    charset : 'UTF8MB4_GENERAL_CI'
});
// var pool = mysql.createPool({
//     host: '172.16.4.217',
//     user: 'root',
//     password: 'chinaedu',
//     database: 'study_center',
//     port: 3306,
//     timezone: "+08:00",
//     charset: 'UTF8MB4_GENERAL_CI'
// });
const query = function(sql, params) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, conn) {
            if (err) {
                reject(err);
            } else {
                if (!params) {
                    conn.query(sql, function(qerr, result) {
                        //释放连接
                        conn.release();
                        if (qerr) {
                            reject(qerr);
                        } else {
                            //事件驱动回调
                            resolve(result);
                        }
                    });
                } else {
                    conn.query(sql, params, function(qerr, result) {
                        //释放连接
                        conn.release();
                        if (qerr) {
                            reject(qerr);
                        } else {
                            //事件驱动回调
                            resolve(result);
                        }
                    });
                }
            }
        });
    })
};
module.exports = query;
