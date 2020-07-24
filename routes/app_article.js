const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Images = require('../service/articleService');
const common = require('../service/commonService');
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/app_article')
// 查询接口
router.post('/get', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        const sql = 'select * from s_base_article where isDel = 0 limit '+((params.page-1)*(params.limit))+','+params.limit+'';
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_base_article where isDel = 0";
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
        const articleId = ctx.request.body.articleId;
        const sql = 'update s_base_article set isDel = 1 where id = ' + articleId;
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
        const article = ctx.request.body;
        const sql = 'INSERT INTO s_base_article (title,article,author,audioUrl,time,isShow,isDel) values ("'+article.title+'","'+Article.articleReplace(article.article)+'","'+article.name+'","'+Images.audioUrlReplace(article.url)+'","'+article.time+'",1,0)';
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
        const sql = 'select * from s_base_article where id = ' + id;
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
          const sql = 'update s_base_article set title = "'+body.title+'",article = "'+Article.articleReplace(body.article)+'",author = "'+body.name+'",time = "'+body.time+'",audioUrl = "'+Article.audioUrlReplace(body.url)+'",isDel = 0 where id = ' + body.id;
          const res = await query(sql);
            if (parseInt(res.affectedRows) === 1) {
                ctx.body = {
                    success: true
                }
            }
        }else{
            const sql = 'update s_base_article set title = "'+body.title+'",article = "'+Article.articleReplace(body.article)+'",author = "'+body.name+'",time = "'+body.time+'",isDel = 0 where id = ' + body.id;
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

// 导入音乐
router.post('/uploadMusic', common.upload.array('file'), async(ctx, next) => {
    const params = ctx.request.body
    if(ctx.req.files[0].path){
        ctx.body = {
            success: true,
            path:ctx.req.files[0].path
        }
    }else{
        ctx.body = {
            success: false,
            err: '系统异常！'
        }
    }

})

module.exports = router
