const router = require('koa-router')();
const courseController = require('../controller/course')
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/it_course');
router.get('/getCourseList' ,courseController.courseList)
router.get('/getCategoryList' ,courseController.categoryList)
router.get('/getBannerList', courseController.bannerList)
router.get('/courseDetail',courseController.courseDetail)
router.post('/shareCourse',courseController.shareCourse)
router.post('/getMycourseList' ,courseController.getMycourseList)
router.post('/lookNum',courseController.lookNum)
module.exports = router;
