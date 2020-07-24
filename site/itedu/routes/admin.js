const router = require('koa-router')();
const itAdmin = require('../controller/admin');
const baseUrl = require('../../../service/baseUrl');
router.prefix(baseUrl.baseUrl+'/api/it_admin');

//获取用户列表
router.get('/userList', itAdmin.getUserList)
//删除用户
router.post('/delUser',itAdmin.delUser)
//获取课程列表
router.get('/courseList',itAdmin.getCourseList)
//添加分类
router.post('/addCategory',itAdmin.addCategory)
//获取分类
router.get('/getCategory',itAdmin.getCategory)
//修改分类
router.post('/updateCategory',itAdmin.updateCategory)
//删除分类
router.post('/delCategory',itAdmin.delCategory)
//课程详情
router.get('/getCourseDetail',itAdmin.getCourseDetail)
//修改课程
router.post('/updateCourse',itAdmin.updateCourse)
//添加课程
router.post('/addCourse',itAdmin.addCourse)
//删除课程
router.post('/delCourse',itAdmin.delCourse)
//分享明细
router.get('/getShare',itAdmin.getShareList)
//课程评论
router.get('/getComments',itAdmin.getComments)
//编辑评论
router.post('/editComment',itAdmin.editComment)
//添加课程章节
router.post('/addCourseChapter',itAdmin.addCourseChapter)
//添加章节下的子章节
router.post('/addCourseChildChapter',itAdmin.addCourseChildChapter)
//删除课程章节
router.post('/delCourseChapter',itAdmin.delCourseChapter)
//删除章节下的子章节
router.post('/delChildChapter',itAdmin.delChildChapter)
//获取所有章节
router.post('/getChapter',itAdmin.getChapter)
//获取所有子章节
router.post('/getChildChapter',itAdmin.getChildChapter)
//获取所有课程
router.get('/getCourse',itAdmin.getCourse)
//修改章节
router.post('/updateChapter',itAdmin.updateChapter)
//修改子节
router.post('/updateChildChapter',itAdmin.updateChildChapter)
//获取小程序审核按钮控制
router.post('/getIsShowContent',itAdmin.getIsShowContent)
//修改小程序审核内容显示隐藏
router.post('/setIsShowContent',itAdmin.setIsShowContent)
//获取导出分享数据
router.get('/getExportShareList',itAdmin.getExportShareList)
//获取导出用户看过的课程
router.get('/getExportLookCourseList',itAdmin.getExportLookCourseList)
//添加轮播图
router.post('/addBanner',itAdmin.addBanner)
//控制轮播图显示与隐藏
router.post('/bannerShowOrhide',itAdmin.bannerShowOrhide)
//删除轮播图
router.post('/delBanner',itAdmin.delBanner)
//编辑轮播图
router.post('/editBanner',itAdmin.editBanner)
//获取轮播图
router.get('/getBanner',itAdmin.getBanner)
//获取轮播图详情
router.get('/getBannerDetail',itAdmin.getBannerDetail)
//user表的课程插入到新表
router.post('/setMyCourse',itAdmin.setMyCourse)

module.exports = router;
