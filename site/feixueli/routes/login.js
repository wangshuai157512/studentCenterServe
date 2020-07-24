const router = require('koa-router')();
const loginController = require('../controller/login');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/youxuepei_auth');

router.post('/authUserInfo',loginController.authUserInfo)
router.post('/login',loginController.login)
router.post('/authPhone',loginController.authPhone)

module.exports = router
