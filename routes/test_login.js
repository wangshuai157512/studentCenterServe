const router = require('koa-router')()
const baseUrl = require('../service/baseUrl');

router.prefix(baseUrl.baseUrl+'/api/testLogin')

//报错测试
router.get('/get_test', async(ctx, next) => {
    let errorList = [];
    errList[0].hello();
    let data = [{name:'张三丰',age:12},{name:'admin',age:12}];
    ctx.body = {
        success:true,
    }
});
router.get('/get_test_test', async(ctx, next) => {
    let data = [{name:'张三丰',age:12},{name:'admin',age:12}];
    ctx.body = {
        success:true,
        code:123,
    }
});

module.exports = router