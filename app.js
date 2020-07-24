'use strict';
const Koa = require('koa')
const router = require('koa-router')();
const cors = require('koa2-cors');
const jwt = require('koa-jwt'); //jwt 用户认证模块

const fundebug=require("fundebug-nodejs");
fundebug.apikey="866037980bce0c254f3005a07488866f8e19a661bea09753b2a24811498923d7";

fundebug.notify("Test", "Hello Fundebug!")

const render = require('koa-art-template');
const path = require('path');
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const koaStatic = require('koa-static');
const initSysParams = require('./bus/initSysParams');
const task = require('./service/timingTask')
const koaBody = require('koa-body');

const xls = require('koa-router-xls'),
    formParser = require('koa-router-form-parser');

const app_login = require('./routes/app_login');
const app_article = require('./routes/app_article');
const app_question = require('./routes/app_question');
const app_course = require('./routes/app_course');
const app_shopping = require('./routes/app_shopping');
const app_teacherCourse = require('./routes/app_teacherCourse');
const app_couponCourse = require('./routes/app_couponCourse');
const app_couponOrder = require('./routes/app_couponOrder');
const app_couponShop = require('./routes/app_couponShop');
const app_coupon = require('./routes/app_coupon');
const app_order = require('./routes/app_order');
const app_share = require('./routes/app_share');
const test_login = require('./routes/test_login');
const app_topic = require('./routes/app_topic')
const app_banner = require('./routes/app_banner')
const app_server = require('./routes/app_server')

//it小程序
const it_login = require('./site/itedu/routes/login')
//学习中心公众号
const study_center = require('./site/studycenter/router')

const Config = require('./utils/config.js');
//IT教育公开课-路由
const routerItedu = require('./site/itedu/routes');
//非学历路由
const feixueliRouter = require('./site/feixueli/routes')
//学程小程序
const xcRouter = require('./site/xcMini/routes')

// error handler
onerror(app)
app.use(cors());
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 10 * 1024 * 1024, // 修改文件大小限制，默认位2M
    }
}));
// middlewares
// app.use(bodyparser({
//     enableTypes: ['json', 'form', 'text']
// }))



app.on("error", fundebug.KoaErrorHandler);

app.use(json())
app.use(logger())

//定时任务
task.updateCouponState()
task.updateOrderState()
task.updateAccessToken()
task.updateSquadState()
render(app, {
    root: path.join(__dirname, 'views'),
    extname: '.art',
    debug: process.env.NODE_ENV !== 'production'
});

app.use(koaStatic('./public'));

// logger
app.use(async(ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

app.use(formParser());
app.use(xls());

// app.use(initValidateCode());
// routes
routerItedu(app);
study_center(app);
feixueliRouter(app);
xcRouter(app);

app.use(test_login.routes(), test_login.allowedMethods());
app.use(app_article.routes(), app_article.allowedMethods());
app.use(app_login.routes(), app_login.allowedMethods());
app.use(app_question.routes(), app_question.allowedMethods());
app.use(app_course.routes(), app_course.allowedMethods());
app.use(app_shopping.routes(), app_shopping.allowedMethods());
app.use(app_teacherCourse.routes(), app_teacherCourse.allowedMethods());
app.use(app_couponCourse.routes(), app_couponCourse.allowedMethods());
app.use(app_couponOrder.routes(), app_couponOrder.allowedMethods());
app.use(app_couponShop.routes(), app_couponShop.allowedMethods());
app.use(app_coupon.routes(), app_coupon.allowedMethods());
app.use(app_order.routes(), app_order.allowedMethods());
app.use(app_share.routes(), app_share.allowedMethods());
app.use(app_topic.routes(), app_topic.allowedMethods());
app.use(app_banner.routes(), app_banner.allowedMethods());
app.use(app_server.routes(), app_server.allowedMethods());

//it小程序
app.use(it_login.routes(), it_login.allowedMethods());

app.use(jwt({
    secret: Config.tokenSecret
}).unless({
    path: [/\/api\/app_login/], //登录不需要jwt验证
    path: [/\/api\/app_couponCourse/],
    path: [/\/api\/app_couponOrder/],
    path: [/\/api\/app_couponShop/],
    path: [/\/api\/app_coupon/]
}));



module.exports = app
