const router = require('koa-router')();
const baseUrl = require('../../../service/baseUrl');
const check = require('../controller/check')
router.prefix(baseUrl.baseUrl+'/api/study_center');
router.get('/',check.checkToken)

module.exports = router
