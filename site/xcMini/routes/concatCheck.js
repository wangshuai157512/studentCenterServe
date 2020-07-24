const router = require('koa-router')();
const concatCheckController = require('../controller/concatCheck');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/concat');

router.get('/checking',concatCheckController.checking)

module.exports = router
