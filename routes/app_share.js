const router = require('koa-router')()
const query = require('../bus/mysqlDal');
const Common = require('../service/commonService.js');
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/app_share')
// 查询接口
router.post('/get', async(ctx, next) => {
    try {
        const params = ctx.request.body;
        // 根据有无id判断在哪段展示：有id->小程序展示；无id->pc端查看
        const sql = (!params.id && typeof (params.id) !== 'number') ?
            'select a.id, a.userId, a.shareNum, a.bill, a.state, b.user, b.avatarUrl from s_teacher_shareorder a, s_teacher_user b where a.userId = b.id limit '+((params.page-1)*(params.limit))+','+params.limit+''
            : 
            'select a.id, a.userId, a.shareNum, a.bill, a.state, b.user, b.avatarUrl from s_teacher_shareorder a, s_teacher_user b where a.userId = b.id and a.userId = '+params.id;
        const res = await query(sql);
        if (res) {
            const newSql = "select count(*) as cnt from s_teacher_shareorder";
            const newRes = await query(newSql);
            ctx.body = {
                success: true,
                shareOrder: res,
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

// 客服人员标记红包状态
router.post('/sign', async(ctx, next) => {
    try {
        const token = ctx.header['x-token'];
        const isTeacherLogin = await Common.isTeacherLogin(token);
        if(isTeacherLogin){
            const body = ctx.request.body;
            const sql = 'update s_teacher_shareorder set state = 1 where id = ' + body.id;
            const res = await query(sql);
            if (parseInt(res.affectedRows) === 1) {
                ctx.body = {
                    success: true
                } 
            }
        } else {
            ctx.body = {
                success: false,
                code: 50014,
                err: '身份信息已过期,请重新登录！'
            }
        }
    } catch (err) {
        ctx.body = {
            success: false,
            err: err.message
        }
    }
})

module.exports = router