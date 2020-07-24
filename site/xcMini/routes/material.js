const router = require('koa-router')();
const materialController = require('../controller/material');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/xc_material');

router.get('/getMaterial',materialController.getMaterial)
router.get('/getMyMaterial',materialController.getMyMaterial)
router.get('/getMaterialPackageDetail',materialController.getMaterialPackageDetail)

module.exports = router;

