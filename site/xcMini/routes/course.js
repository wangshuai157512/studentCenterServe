const router = require('koa-router')();
const courseController = require('../controller/course');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/xc_course');

router.get('/getHotClass',courseController.getHotClass)
router.get('/getOtherProject',courseController.otherProject)
router.get('/hotClassDetail',courseController.hotClassDetail)
router.get('/projectDetail',courseController.projectDetail)
router.get('/getMaterialList',courseController.getMaterialList)
router.get('/getAllSuuMaterialList',courseController.getAllSuuMaterialList)

module.exports = router

