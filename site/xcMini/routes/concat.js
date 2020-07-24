const router = require('koa-router')();
const concatController = require('../controller/concat');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/concat');

router.post('/checking',concatController.checking)

module.exports = router
