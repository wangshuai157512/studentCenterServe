const router = require('koa-router')();
const admin = require('../controller/admin')
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/youxuepei_admin');

router.get('/getUserList',admin.getUserList)
router.get('/getFormUserList',admin.getFormUserList)
router.post('/delUser',admin.delUser)
router.get('/getChannel',admin.getChannel)
router.post('/addChannel',admin.addChannel)
router.post('/delChannel',admin.delChannel)

module.exports = router
