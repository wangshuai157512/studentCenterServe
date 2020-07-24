const router = require('koa-router')();
const upload = require('../controller/upload');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/upload');

router.post('/uploadFile',upload.upload)

module.exports = router;
