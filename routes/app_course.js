const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Article = require('../service/articleService');
const common = require('../service/commonService');
const baseUrl = require('../service/baseUrl');
const path = require('path')
const fs = require('fs')

router.prefix(baseUrl.baseUrl+'/api/app_course')
// 查询接口
router.post('/get', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql = 'select * from s_base_course where isDel = 0 limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
          const newSql = "select count(*) as cnt from s_base_course where isDel = 0";
          const newRes = await query(newSql);
            ctx.body = {
                success: true,
                article: res,
                total:newRes[0].cnt
            }
        } else {
            ctx.body = {
                success: false,
                err: 'err'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 删除
router.post('/del', async(ctx, next) => {
    try {
        const courseId = ctx.request.body.courseId;
        const sql = 'update s_base_course set isDel = 1 where id = ' + courseId;
        const res = await query(sql);
        if (parseInt(res.affectedRows) === 1) {
            ctx.body = {
                success: true
            } 
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 新增
router.post('/add', async(ctx, next) => {
    try {
        const course = ctx.request.body;
        console.log(course)
        const sql = 'INSERT INTO s_base_course (courseName,introduce,author,imgUrl,time,isDel) values ("'+course.title+'","'+course.introduce+'","'+course.name+'","'+Article.audioUrlReplace(course.url)+'","'+course.time+'",0)';
        console.log(sql)
        const res = await query(sql);
        if (res.insertId) {
            ctx.body = {
                success: true
            } 
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 查看
router.post('/look', async(ctx, next) => {
    try {
        const id = ctx.request.body.id;
        const sql = 'select * from s_base_course where id = ' + id;
        const res = await query(sql);
        if (res && res.length > 0) {
            ctx.body = {
                success: true,
                article: res
            }
        } else {
            ctx.body = {
                success: false,
                err: 'err'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 编辑
router.post('/edit', async(ctx, next) => {
    try {
        const body = ctx.request.body;
        if(body.url){
            const sql = 'update s_base_course set courseName = "'+body.title+'",introduce = "'+body.introduce+'",author = "'+body.name+'",time = "'+body.time+'",imgUrl = "'+Article.audioUrlReplace(body.url)+'" where id = ' + body.id;
            const res = await query(sql);
            if (parseInt(res.affectedRows) === 1) {
                ctx.body = {
                    success: true
                } 
            }
        }else{
            const sql = 'update s_base_course set courseName = "'+body.title+'",introduce = "'+body.introduce+'",author = "'+body.name+'",time = "'+body.time+'" where id = ' + body.id;
            const res = await query(sql);
            if (parseInt(res.affectedRows) === 1) {
                ctx.body = {
                    success: true
                } 
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

// 导入图片
router.post('/uploadImg',async(ctx, next) => {
    // const params = ctx.request
    // console.log(params)
    // if(params){
    //     ctx.body = {
    //         success: true,
    //         path:params
    //     }
    // }else{
    //     ctx.body = {
    //         success: false,
    //         err: '系统异常！'
    //     }
    // }
    try {
        let savePath;
        let file = ctx.request.files.file
        let time = new Date().getTime()
        let name = file.name.split('.')[1]
        let fileName = `${time}.${name}`
        if (name === 'jpg' || name === 'png' || name === 'gif' || name === 'jpeg') {
            console.log('图片')
            savePath = path.join(__dirname,'../../../public/wx/img/'+fileName)
            console.log(111)
            
        }else {
            console.log('文件')
            savePath = path.join(__dirname,'../../../public/wx/file/'+fileName)
        }
        console.log(file.path)
        console.log(savePath)
        let res = await saveFile(file.path,savePath)
        console.log(res)
        if (res.success) {
            ctx.body = {
                code : 1,
                data : {
                    path : res.path
                }
            }
        } else {
            ctx.body = {
                code : 0,
                err : res.err
            }
        }
    }catch (e) {
        ctx.body = {
            code : 0,
            err : e
        }
    }

   

    function saveFile(filepath,filename) {
        return new Promise((resolve, reject)=>{
            console.log(198)
            console.log(filepath)
            let render = fs.createReadStream(filepath);
            // 创建写入流
            let upStream = fs.createWriteStream(filename);
            render.pipe(upStream);
            upStream.on('finish', () => {
                resolve({
                    success : true,
                    path : filename.split('public')[1]
                })
            });
            upStream.on('error', (err) => {
                console.log(78)
                reject({
                    success : false,
                    err : err
                })
            });
        })
    }
})

module.exports = router