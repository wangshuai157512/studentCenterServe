const router = require('koa-router')();
const baseUrl = require('../../../service/baseUrl');
const login = require('../controller/login')
router.prefix(baseUrl.baseUrl+'/api/study_center_login');

router.post('/getUserInfo',login.getUserInfo)

module.exports = router
