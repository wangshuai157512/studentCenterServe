const router = require('koa-router')();
const channelController = require('../controller/teacher');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/xc_teacher');

router.post('/addTeacherName',channelController.addTeacherName)
router.post('/getTeacherName',channelController.getTeacherName)

module.exports = router
