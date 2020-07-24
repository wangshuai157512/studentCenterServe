const router = require('koa-router')();
const createCodeController = require('../controller/createCode');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/QRC_code');

router.post('/createCode',createCodeController.createCode)
router.post('/createTeacherCode',createCodeController.createTeacherCode)

module.exports = router
