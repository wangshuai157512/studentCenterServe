const router = require('koa-router')();
const channelController = require('../controller/channel');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/xc_channel');

router.post('/addUser',channelController.addUser)

module.exports = router
