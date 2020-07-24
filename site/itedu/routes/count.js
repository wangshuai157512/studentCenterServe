const router = require('koa-router')();
const countController = require('../controller/count');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/it_count');

router.post('/getUserInfo',countController.getUserInfo);
router.post('/setDays',countController.setDays);
router.post('/setDuration',countController.setDuration);
router.post('/setCourseNum',countController.setCourseNum);
router.post('/setMycourse',countController.setMycourse);

module.exports = router;
