const router = require('koa-router')();
const userController = require('../controller/user');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/xc_user');

router.get('/getShareList',userController.getShareList)

module.exports = router
