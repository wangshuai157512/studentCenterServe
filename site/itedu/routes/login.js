const router = require('koa-router')();
const loginController = require('../controller/login');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/it_login');

router.post('/iteduLogin',loginController.iteduLogin);
router.post('/iteduLoginAuth',loginController.iteduLoginAuth);
router.post('/iteduAuthPhone',loginController.iteduAuthPhone);
router.post('/iteduIsShowContent',loginController.iteduIsShowContent);

module.exports = router;
