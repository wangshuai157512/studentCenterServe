const router = require('koa-router')();
const formData = require('../controller/formData')
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/youxuepei_formdata');

router.post('/setData',formData.setData)

module.exports = router
