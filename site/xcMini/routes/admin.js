const router = require('koa-router')();
const adminController = require('../controller/admin');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/xc_admin');

/**
 * 分类
 */
router.post('/addProject',adminController.addProject)
router.get('/getProjectList',adminController.getProjectList)
router.post('/addClassCategory',adminController.addClassCategory)
router.post('/delProject',adminController.delProject)
router.post('/getProjectDetail',adminController.getProjectDetail)
router.post('/editProject',adminController.editProject)

/**
 * 用户
 * @type {*|void}
 */
router.get('/getUserList',adminController.getUserList)
router.get('/getFormUserList',adminController.getFormUserList)
router.post('/delUser',adminController.delUser)
router.post('/changeUserType',adminController.changeUserType)
router.post('/isEnter',adminController.isEnter)
router.post('/editTeacherName',adminController.editTeacherName)

/**
 * 渠道
 * @type {*|void}
 */
router.get('/getChannel',adminController.getChannel)
router.post('/addChannel',adminController.addChannel)
router.post('/delChannel',adminController.delChannel)

/**
 * 项目
 * @type {*|void}
 */
router.get('/getClassList',adminController.getClassList)
router.post('/addClassItem',adminController.addClassItem)
router.post('/delClass',adminController.delClass)
router.get('/getClassDetail',adminController.getClassDetail)
router.post('/editClass',adminController.editClass)

/**
 * 课程
 * @type {*|void}
 */
router.get('/getCourseTagList',adminController.getCourseTagList)
router.post('/addCourseTag',adminController.addCourseTag)
router.post('/delCourseTag',adminController.delCourseTag)

router.get('/getCourseType',adminController.getCourseType)
router.post('/addCourseType',adminController.addCourseType)
router.post('/delCourseType',adminController.delCourseType)

router.get('/getCourseSlogan',adminController.getCourseSlogan)
router.post('/addCourseSlogan',adminController.addCourseSlogan)
router.post('/delCourseSlogan',adminController.delCourseSlogan)

router.get('/getCourseList',adminController.getCourseList)
router.get('/getAllcategoryOrProject',adminController.getAllcategoryOrProject)
router.post('/addCourse',adminController.addCourse)
router.post('/delCourse',adminController.delCourse)
router.get('/getCourseDetail',adminController.getCourseDetail)
router.post('/editCourse',adminController.editCourse)

/**
 * 拼团
 * @type {*|void}
 */
router.get('/getSquadUser',adminController.getSquadUser)

/**
 * 资料包
 * @type {*|void}
 */
router.post('/addMaterial',adminController.addMaterial)
router.get('/getMaterial',adminController.getMaterial)
router.post('/editMaterial',adminController.editMaterial)
router.post('/delMaterial',adminController.delMaterial)
router.get('/getClass',adminController.getClass) // 班型列表



module.exports = router;

