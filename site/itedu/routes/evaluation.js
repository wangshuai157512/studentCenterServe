const router = require('koa-router')();
const evaluationController = require('../controller/evaluation');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/it_evaluation');

router.post('/get',evaluationController.get);
router.post('/add',evaluationController.add);
router.post('/getAll',evaluationController.getAll);
router.post('/del',evaluationController.del);
router.post('/updateAudit',evaluationController.updateAudit);

module.exports = router;
