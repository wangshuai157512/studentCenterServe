const router = require('koa-router')();
const squadCodeController = require('../controller/squad');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/squad');

router.post('/createSquad',squadCodeController.createSquad)
router.post('/getSquadStatus',squadCodeController.getSquadStatus)
router.post('/getSquadUser',squadCodeController.getSquadUser)
router.post('/addSquad',squadCodeController.addSquad)
router.get('/getMySquad',squadCodeController.getMySquad)
router.get('/getMySquadList',squadCodeController.getMySquadList)
router.get('/getSquadState',squadCodeController.getSquadStateApi)
router.post('/deleteSquad',squadCodeController.deleteSquad)

module.exports = router
