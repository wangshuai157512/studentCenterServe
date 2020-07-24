const tokenSecret = 'my_token'; //管理端token匹配信息（token前缀）
// const apolloUrl = 'http://duyu.51xcjyw.com'; //阿波罗nginx反向代理域名
// const apolloUrl = 'https://www.pmhuai.top/abc'; //阿波罗nginx反向代理域名
const apolloUrl = 'https://xxzx.chinaedu.net'; //阿波罗nginx反向代理域名

// 提升专本科
const appid = 'wxe4079c36af2e314f'
const secret = 'eca50bb30837830c9244525d198fdec7'

// 弘成学习中心微服务
const serverAppid = 'wx5766328e8cf6a21a';
const serverSecret = '4dcb20c7b85d24591d01197ad9997e4c';

//教师资格证
const teacherAppid = 'wx8f81a74fc666a1f2';
const teacherSecret = 'e2ccbe8a25e975b78960563028105d71';
const mchid = '1528607431'; //微信支付 mch id (微信商户号获取)
const key = 'xuechengjiaoyu91110101352943133Q'; //微信支付秘钥 (微信商户号获取)
const spbill_create_ip = '39.105.167.78';//终端ip

// 阿波罗小程序
const apolloAppid = 'wx6fe5480f6aed7f09';
const apolloSecret = '79ce198a837d8f11d9e88f3082076ab6';
const apolloMchid = '1528607431'; //微信支付 mch id (微信商户号获取)
const apolloKey = 'xuechengjiaoyu91110101352943133Q'; //微信支付秘钥 (微信商户号获取)
const apollo_spbill_create_ip = '39.105.167.78';//终端ip

// 阿波罗转工服接口
const apolloAuth = apolloUrl + '/coupon/Apollo/mina/verification_student';
const apolloSend = apolloUrl + '/coupon/Apollo/mina/produce';

//it小程序
const itAppId = 'wxcc881bfe7cf28123'
const itSecret = '653adcbea701825e738f81009c9a61f0'

//非学历小程序
const feixueliAppid = 'wx20b9590a40d60b50'
const feixueliAppSecret = 'baffcbf09c417d8f55788bf0a2c93d4f'

//职业培训课小程序 // 消息推送url配置/api/concat/checking
const zypxkAppid = 'wxfcdd2444f6c95908'
const zypxkAppSecret = 'c339b8e9dff907eaaca789875eadb6e2'
const zypxkToken = 'qilimuge'
const zypxKMesKey = '98S1Q18KyAAOoq6ffjh4nGs81bmPAiSY4Fk1byNn4MG'

module.exports = {
    tokenSecret: tokenSecret,
    appid: appid,
    secret: secret,
    serverAppid: serverAppid,
    serverSecret: serverSecret,
    teacherAppid: teacherAppid,
    teacherSecret: teacherSecret,
    mchid: mchid,
    key: key,
    spbill_create_ip: spbill_create_ip,
    apolloAppid: apolloAppid,
    apolloSecret: apolloSecret,
    apolloMchid: apolloMchid,
    apolloKey: apolloKey,
    apollo_spbill_create_ip: apollo_spbill_create_ip,
    apolloAuth: apolloAuth,
    apolloSend: apolloSend,
    itAppId,
    itSecret,
    feixueliAppid,
    feixueliAppSecret,
    zypxkAppid,
    zypxkAppSecret,
    zypxkToken,
    zypxKMesKey
}
