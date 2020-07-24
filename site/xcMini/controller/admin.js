const Axios = require('axios');
const query = require('../../../bus/mysqlDal');
const Images = require('../../../service/articleService');

let controller = {
    /**
     * 添加分类
     * @param ctx
     * @returns {Promise<void>}
     */
    addProject : async ctx => {
        try {
            let { name,img,banner_img,shareImg,weight } = ctx.request.body
            let insertData = await query(`
            insert into s_xc_project_category(name,img,banner_img,shareImg,weight)
            values('${name}','${img?img:''}','${banner_img?banner_img:''}','${shareImg?shareImg:''}',${weight})`)
            console.log(insertData)
            if (insertData.affectedRows > 0)  {
                ctx.body = {
                    code : 1,
                    msg : '添加成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '添加失败'
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '添加失败',
                err : e
            }
        }
    },
    /**
     * 获取所有分类
     */
    getProjectList : async ctx => {
        let projectList = await query(`select id,name,img,banner_img from s_xc_project_category`)
        ctx.body = {
            code : 1,
            data : projectList
        }
    },

    /**
     * 删除分类
     * @param ctx
     * @returns {Promise<void>}
     */
    delProject : async ctx => {
        try {
            let { id } = ctx.request.body
            console.log(id)
            await query(`delete from s_xc_project_category where id = ${id}`)
            ctx.body = {
                code : 1
            }
        }catch (e) {
            ctx.body = {
                code : 0
            }
        }

    },

    /**
     * 获取分类详情
     * @param ctx
     * @returns {Promise<void>}
     */
    getProjectDetail : async ctx => {
        try {
            let { id } = ctx.request.body
            let categoryData = await query(`select id,name,img,banner_img,shareImg,weight from s_xc_project_category where id = ${id}`)
            ctx.body = {
                code : 1,
                data : categoryData[0]
            }
        }catch (e) {
            ctx.body = {
                code : 0
            }
        }
    },

    /**
     * edit
     * @param ctx
     * @returns {Promise<void>}
     */
    editProject : async ctx => {
        try {
            let { name,img,banner_img,weight,shareImg,projectId } = ctx.request.body
            let updateData = await query(`update s_xc_project_category set
            name = '${name}',
            img = '${img?img:''}',
            banner_img = '${banner_img?banner_img:''}',
            weight = ${weight},
            shareImg = '${shareImg}'
            where id = ${projectId}
            `)
            if (updateData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0
            }
        }
    },

    /**
     * 添加班型
     * @param ctx
     * @returns {Promise<void>}
     */
    addClassCategory : async ctx => {
        try {
            let { projectId,name,videoUrl,hotType } = ctx.request.body
            let insertData = await query(`insert into s_xc_class_category(projectId,name,videoUrl,isHot)
            values(${projectId},'${name}','${videoUrl}',${hotType})
            `)
            if (insertData.affectedRows > 0)  {
                ctx.body = {
                    code : 1,
                    msg : '添加成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '添加失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '添加失败',
                err : e
            }
        }
    },

    /**
     * 获取小程序用户列表
     * @param ctx
     * @returns {Promise<void>}
     */
    getUserList : async ctx => {
        try {
            let {phone, teacherName, isEnter,userType, page} =ctx.request.query
            page = page || 1
            let totalSql = `select count(*) c from s_xc_user where 1 = 1`
            let sql = `select a.id,a.nickname,a.avatarUrl,a.phone,a.teacherName,a.userType,a.isEnter,a.teacherCity,b.phone firstUserPhone,b.teacherName firstUserName,b.teacherCity firstUserCity
            from s_xc_user a 
            left join s_xc_user b 
            on a.shareUserId = b.id 
            where 1 = 1`
            if (phone) {
                sql += ` and a.phone = "${phone}"`
                totalSql += ` and phone = "${phone}"`
            }
            if (teacherName) {
                sql += ` and a.teacherName = "${teacherName}"`
                totalSql += ` and teacherName = "${teacherName}"`
            }
            if (isEnter) {
                sql += ` and a.isEnter = "${isEnter}"`
                totalSql += ` and isEnter = "${isEnter}"`
            }

            if (userType) {
                sql += ` and a.userType = "${userType}"`
                totalSql += ` and userType = "${userType}"`
            }

            sql += ` order by id desc limit ${(page-1)*20},20`

            let searcherDate = await query(sql)
            let total = await query(totalSql)
            // let userList = []
            // if (teacherName && teacherName !== 'undefined' && teacherName !== 'null') {
            //   for (let i = 0; i < searcherDate.length; i++) {
            //     var teacherItem = searcherDate[i]
            //     let shareUserList = await query(`select * from s_xc_user where shareUserId = ${teacherItem.id}`)
            //     console.log(shareUserList,"852")
            //     userList.push(teacherItem)
            //     for (let j = 0; j < shareUserList.length; j++) {
            //       let shareItem = shareUserList[j]
            //       shareItem = Object.assign({},shareItem,{
            //         firstUserCity : teacherItem.teacherCity,
            //         firstUserName : teacherItem.teacherName,
            //         firstUserPhone : teacherItem.phone
            //       })
            //       userList.push(shareItem)
            //     }
            //   }
            //   for (let t = 0; t < userList.length; t++) {
            //     let userListItem = userList[t]
            //     console.log(searcherDate.id)
            //     if(teacherItem.id !==userListItem.id) {
            //         searcherDate.push(userListItem)
            //     }
            //   }
            // }

          ctx.body = {
                code : 1,
                data : searcherDate,
                total : total[0].c
            }
        }catch (e) {
            console.log(e,'666')
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 修改用户分类
     * @param ctx
     * @returns {Promise<void>}
     */
    // 默认0,1学生，2老师
    changeUserType : async ctx => {
        try {
            let {userId,userType} = ctx.request.body
            let updateData = await query(`update s_xc_user set userType = ${userType} where id = ${userId}`)
            if (updateData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '状态修改成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '状态修改失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    // 修改公服录入状态 // 0未录入，1录入
    isEnter : async ctx => {
        try {
            let {userId,isEnter} = ctx.request.body
            let updateData = await query(`update s_xc_user set isEnter = ${isEnter} where id = ${userId}`)
            if (updateData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '状态修改成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '状态修改失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 编辑老师姓名
     * @param ctx
     * @returns {Promise<void>}
     */
    editTeacherName : async ctx => {
        try {
            let {userId,teacherName} = ctx.request.body
            console.log(teacherName)
            let newName = await query(`update s_xc_user set teacherName = "${teacherName}" where id = ${userId}`)
            console.log(newName)
            if(newName.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '教师姓名修改成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '教师姓名修改失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },



    /**
     * 获取表单用户列表
     * @param ctx
     * @returns {Promise<void>}
     */
    getFormUserList : async ctx => {
        try {
            let { page , startTime , endTime, channelId } = ctx.request.query
            let getSql = `select u.id,u.name,u.phone,u.marks,u.other,DATE_FORMAT(u.create_time,'%Y-%m-%d %H:%i:%s') createTime,c.channel_name,s.teacherName
            from s_xc_form_user u
            left join s_xc_channel c
            on u.channel = c.id
            left join s_xc_user s
            on u.shareUserId = s.id
            where 1 = 1`
            let getSqlTotal = `select count(*) total from s_xc_form_user where 1 = 1`
            if ((startTime && endTime) && (startTime !== 'null' && endTime !== 'null')) {
                startTime = `${startTime} 00:00:00`
                endTime = `${endTime} 23:59:59`
                getSql += ` and u.create_time Between '${startTime}' and '${endTime}'`
                getSqlTotal += ` and create_time Between '${startTime}' and '${endTime}'`
            }
            if(channelId) {
                getSql += ` and u.channel = ${channelId}`
                getSqlTotal += ` and channel = ${channelId}`
            }
            if (page && page !== 'null') {
                getSql += ` order by u.create_time desc limit ${(page-1)*20},20`
            }
            let userData = await query(getSql)
            let userTotal = await query(getSqlTotal)
            ctx.body = {
                code : 1,
                data : userData,
                total : userTotal[0].total
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                msg : '获取失败'
            }
        }
    },

    /**
     * 删除表单用户
     * @param ctx
     * @returns {Promise<void>}
     */
    delUser : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_xc_form_user where id = ${id}`)
            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '删除成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '删除失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '删除失败',
                err : e
            }
        }
    },

    /**
     * 获取渠道
     * @param ctx
     * @returns {Promise<void>}
     */
    getChannel : async ctx => {
        try {
            let data = await query(`select id,channel_name from s_xc_channel`)
            ctx.body = {
                code : 1,
                data
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '获取失败',
                err : e
            }
        }
    },

    /**
     * 添加渠道
     * @param ctx
     * @returns {Promise<void>}
     */
    addChannel : async ctx => {
        try {
            let name = ctx.request.body.name
            let insertData = await query(`insert into s_xc_channel(channel_name) values('${name}')`)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '添加成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '添加失败'
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '添加失败',
                err : e
            }
        }
    },

    /**
     * 删除渠道
     * @param ctx
     * @returns {Promise<void>}
     */
    delChannel : async ctx => {
        try {
            let id = ctx.request.body.id
            let delData = await query(`delete from s_xc_channel where id = ${id}`)

            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '删除成功'
                }
            } else {
                ctx.body = {
                    code : 0,
                    msg : '删除失败'
                }
            }

        }catch (e) {
            ctx.body = {
                code : 0,
                msg : '删除失败',
                err : e
            }
        }
    },

    /**
     * 获取项目
     */
    getClassList : async ctx => {
        try {
            let { page } = ctx.request.query
            let totalNum = await query(`select count(*) c from s_xc_class_category`)
            let sql = `select c.id,c.projectId,c.name,c.videoUrl,c.isHot,c.bgcImg,p.name projectName
            from s_xc_class_category c
            left join s_xc_project_category p
            on c.projectId = p.id`

            if (page) {
                sql += ` limit ${(page-1)*20},20`
            }

            let classList = await query(sql)

            ctx.body = {
                code : 1,
                data : classList,
                total : totalNum[0].c
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 添加项目
     * @param ctx
     * @returns {Promise<void>}
     */
    addClassItem : async ctx => {
        try {
            let { name,categoryId,isHot,videoUrl,weight,slogan,bgcImg,videoImg,shareImg,materialImg,materialIntroduction,materialName,materialTag,materialTypeTag } = ctx.request.body
            let insertData = await query(`insert into s_xc_class_category(projectId,name,videoUrl,isHot,bgcImg,videoImg,shareImg,weight,materialImg,materialIntroduction,materialName,materialTag,materialTypeTag) 
            values(${categoryId},'${name}','${videoUrl?videoUrl:''}',${isHot},'${bgcImg?bgcImg:''}','${videoImg?videoImg:''}','${shareImg?shareImg:''}',${weight},'${materialImg?materialImg:''}','${materialIntroduction?materialIntroduction:''}','${materialName?materialName:''}','${materialTag?materialTag:''}','${materialTypeTag?materialTypeTag:''}')
            `)
            let classId = insertData.insertId
            if (insertData.affectedRows >= 1) {
                if (slogan.length > 0) {
                    for (let i = 0; i < slogan.length; i++) {
                        await query(`insert into s_xc_class_slogan(classId,name) values(${classId},'${slogan[i].name}')`)
                    }
                }
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * delClass
     * @param ctx
     * @returns {Promise<void>}
     */
    delClass : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_xc_class_category where id = ${id}`)
            if (delData.affectedRows === 1) {
                await query(`delete from s_xc_class_slogan where classId = ${id}`)
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 获取项目详情
     */
    getClassDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            let classDetail = await query(`select c.name,c.id,c.bgcImg,c.videoUrl,c.isHot,c.videoImg,c.shareImg,c.weight,p.name projectName,p.id,c.materialName,c.materialIntroduction,c.materialTag,c.materialTypeTag,c.materialImg,c.projectId
            from s_xc_class_category c
            left join s_xc_project_category p
            on c.projectId = p.id
            where c.id = ${id}
            `)
            let slogan = await query(`select name,id from s_xc_class_slogan where classId = ${id}`)
            let data = {
                ...classDetail[0],
                sloganList : slogan
            }
            ctx.body = {
                code : 1,
                data
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 修改项目
     * @param ctx
     * @returns {Promise<void>}
     */
    editClass : async ctx => {
        try {
            let { name,categoryId,classId,isHot,videoUrl,weight,bgcImg,videoImg,shareImg,slogan,materialImg,materialIntroduction,materialName,materialTag,materialTypeTag } = ctx.request.body
            let insertSlogan = slogan.filter(item => !item.id),
                delSlogan = []
                allSlogan = await query(`select * from s_xc_class_slogan where classId = ${classId}`)

            for (let i = 0; i < allSlogan.length; i++) {
                let isDel = true
                for (let j = 0; j < slogan.length; j++) {
                    if (allSlogan[i].id === slogan[j].id) {
                          isDel = false
                    }
                }
                if (isDel) {
                    delSlogan.push(allSlogan[i].id)
                }
            }

            for (let i = 0; i < insertSlogan.length; i++) {
                await query(`insert into s_xc_class_slogan(classId,name) values(${classId},'${insertSlogan[i].name}')`)
            }
            for (let i = 0; i < delSlogan.length; i++) {
                await query(`delete from s_xc_class_slogan where id = ${delSlogan[i]}`)
            }

            let updateData = await query(`update s_xc_class_category set 
            projectId = ${categoryId},
            name = '${name}',
            videoUrl = '${videoUrl}',
            isHot = ${isHot},
            weight = ${weight},
            bgcImg = '${bgcImg}',
            videoImg = '${videoImg}',
            shareImg = '${shareImg}',
            materialImg = '${materialImg?materialImg:''}',
            materialIntroduction = '${materialIntroduction?materialIntroduction:''}',
            materialName = '${materialName?materialName:''}',
            materialTag = '${materialTag?materialTag:''}',
            materialTypeTag = '${materialTypeTag?materialTypeTag:''}'
            where id = ${classId}
            `)

            if (updateData.affectedRows === 1) {
                ctx.body = {
                    code : 1
                }
            }  else {
                ctx.body = {
                    code : 0
                }
            }

        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 获取课程标签
     * @param ctx
     * @returns {Promise<void>}
     */
    getCourseTagList : async ctx => {
        try {
            let tagList = await query(`select id,name from s_xc_tag_name`)
            ctx.body = {
                code : 1,
                data : tagList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 添加课程标签
     * @param ctx
     * @returns {Promise<void>}
     */
    addCourseTag : async ctx => {
        try {
            let { name } = ctx.request.body
            let insertData = await query(`insert into s_xc_tag_name(name) values('${name}')`)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 删除课程标签
     * @param ctx
     * @returns {Promise<void>}
     */
    delCourseTag : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_xc_tag_name where id = ${id}`)
            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 获取课程类型
     * @param ctx
     * @returns {Promise<void>}
     */
    getCourseType : async ctx => {
        try {
            let tagList = await query(`select id,name from s_xc_type_name`)
            ctx.body = {
                code : 1,
                data : tagList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 添加课程类型
     * @param ctx
     * @returns {Promise<void>}
     */
    addCourseType : async ctx => {
        try {
            let { name } = ctx.request.body
            let insertData = await query(`insert into s_xc_type_name(name) values('${name}')`)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },


    /**
     * 删除课程标签
     * @param ctx
     * @returns {Promise<void>}
     */
    delCourseType : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_xc_type_name where id = ${id}`)
            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },


    /**
     * 获取课程亮点
     * @param ctx
     * @returns {Promise<void>}
     */
    getCourseSlogan : async ctx => {
        try {
            let tagList = await query(`select id,name from s_xc_course_slogan_name`)
            ctx.body = {
                code : 1,
                data : tagList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },


    /**
     * 添加课程亮点
     * @param ctx
     * @returns {Promise<void>}
     */
    addCourseSlogan : async ctx => {
        try {
            let { name } = ctx.request.body
            let insertData = await query(`insert into s_xc_course_slogan_name(name) values('${name}')`)
            if (insertData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },


    /**
     * 删除项目亮点
     * @param ctx
     * @returns {Promise<void>}
     */
    delCourseSlogan : async ctx => {
        try {
            let { id } = ctx.request.body
            let delData = await query(`delete from s_xc_course_slogan_name where id = ${id}`)
            if (delData.affectedRows >= 1) {
                ctx.body = {
                    code : 1
                }
            } else {
                ctx.body = {
                    code : 0
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 获取课程列表
     * @param ctx
     * @returns {Promise<void>}
     */
    getCourseList : async ctx => {
        try {
            let { page } = ctx.request.query
            let totalNum = await query(`select count(*) c from s_xc_course`)
            let courseList = await query(`select c.id,c.classId,c.name,c.classHour,c.price,ca.name projectName,pc.name className
            from s_xc_course c
            left join s_xc_class_category ca
            on c.classId = ca.id
            left join s_xc_project_category pc
            on ca.projectId = pc.id
            limit ${(page-1)*20},20
            `)
            ctx.body = {
                code : 1,
                data : courseList,
                total : totalNum[0].c
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 获取分类和项目
     * @param ctx
     * @returns {Promise<void>}
     */
    getAllcategoryOrProject : async ctx => {
        let categoryList = await query(`select id,name from s_xc_project_category`)
        for (let i = 0; i < categoryList.length; i++) {
            let projectItem = categoryList[i]
            let classList = await query(`select id,name from s_xc_class_category where projectId = ${projectItem.id}`)
            projectItem.children = classList
        }
        ctx.body = {
            code : 1,
            data : categoryList
        }
    },

    /**
     * 添加课程
     * @param ctx
     * @returns {Promise<void>}
     */
    addCourse : async ctx => {
        try {
            let { name,courseType,courseTag,courseSlogan,price,classId,hour,weight } = ctx.request.body
            let insertData = await query(`insert into s_xc_course(name,classId,classHour,price,weight)
            values('${name}',${classId},'${hour}',${price},${weight})
            `)
            let courseId = insertData.insertId
            if (courseType) {
                await query(`insert into s_xc_course_type(courseId,courseTypeId) values(${courseId},${courseType})`)
            }
            for (let i = 0; i < courseTag.length; i++) {
                await query(`insert into s_xc_course_tag(courseId,tagId) values(${courseId},${courseTag[i]})`)
            }
            for (let i = 0; i < courseSlogan.length; i++) {
                await query(`insert into s_xc_course_slogan(courseId,courseSloganId) values(${courseId},${courseSlogan[i]})`)
            }
            ctx.body = {
                code : 1
            }
        }catch (e) {
            ctx.body = {
                code : 0
            }
        }
    },

    /**
     * 删除课程
     * @param ctx
     * @returns {Promise<void>}
     */
    delCourse : async ctx => {
        try {
            let { id } = ctx.request.body
            await query(`delete from s_xc_course where id = ${id}`)
            await query(`delete from s_xc_course_type where courseId = ${id}`)
            await query(`delete from s_xc_course_slogan where courseId = ${id}`)
            await query(`delete from s_xc_course_tag where courseId = ${id}`)
            ctx.body = {
                code : 1
            }
        }catch (e) {
            ctx.body = {
                code : 0
            }
        }
    },

    /**
     * 获取课程详情
     * @param ctx
     * @returns {Promise<void>}
     */
    getCourseDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            let courseList = await query(`select id,name,classId,classHour,price,weight from s_xc_course where id = ${id}`)
            let courseItem = courseList[0]
            let courseType = await query(`select ct.id,ct.name
            from s_xc_course_type t
            left join 
            s_xc_type_name ct
            on t.courseTypeId = ct.id
            where t.courseId = ${courseItem.id}
            `)
            let courseSlogan = await query(`select sn.id,sn.name
            from s_xc_course_slogan s
            left join 
            s_xc_course_slogan_name sn
            on s.courseSloganId = sn.id
            where s.courseId = ${courseItem.id}
            `)
            let courseTag = await query(`select tn.id,tn.name
            from s_xc_course_tag t
            left join
            s_xc_tag_name tn
            on t.tagId = tn.id
            where t.courseId = ${courseItem.id}    
            `)
            let parents = await query(`select cc.id classId,cc.name className,pc.id projectId,pc.name projectName
            from s_xc_class_category cc
            left join s_xc_project_category pc
            on cc.projectId = pc.id
            where cc.id = ${courseItem.classId}
            `)
            ctx.body = {
                code : 1,
                data : {
                    ...courseItem,
                    courseType : courseType[0],
                    courseSlogan,
                    courseTag,
                    parents : parents[0]
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0
            }
        }
    },

    /**
     * 编辑课程
     * @param ctx
     * @returns {Promise<void>}
     */
    editCourse : async ctx => {
        try {
            let { name, courseType, courseTag, courseSlogan, price, classId , hour , id , weight} = ctx.request.body

            await query(`update s_xc_course set
            name = '${name}',classId = ${classId},classHour='${hour}',
            price=${price},weight=${weight}
            where id = ${id}
            `)

            let allTag = await query(`select t.id,ta.name,ta.id tagId
            from s_xc_course_tag t
            left join s_xc_tag_name ta
            on t.tagId = ta.id
            where t.courseId = ${id}
            `)

            let allSlogan = await query(`select s.id,sn.name,sn.id sloganId
            from s_xc_course_slogan s
            left join s_xc_course_slogan_name sn
            on s.courseSloganId = sn.id
            where s.courseId = ${id}
            `)

            let allCourseType = await query(`select * from s_xc_course_type where courseId = ${id}`)

            let delTag = [],insertTag = [],delSlogan = [],insertSlogan = []

            for (let i = 0; i < courseTag.length; i++) {
                let tagId = courseTag[i]
                let isInsert = true
                for (let j = 0; j < allTag.length; j++) {
                    if (allTag[j].tagId === tagId) {
                        isInsert = false
                    }
                }
                if (isInsert) {
                    insertTag.push(tagId)
                }
            }

            for (let i = 0; i < allTag.length; i++) {
                if (courseTag.indexOf(allTag[i].tagId) === -1) {
                    delTag.push(allTag[i].id)
                }
            }


            for (let i = 0; i < delTag.length; i++) {
                await query(`delete from s_xc_course_tag where id = ${delTag[i]}`)
            }

            for (let i = 0; i < insertTag.length; i++) {
                await query(`insert into s_xc_course_tag(courseId,tagId) values(${id},${insertTag[i]})`)
            }


            for (let i = 0; i < courseSlogan.length; i++) {
                let sloganId = courseSlogan[i]
                let isInsert = true
                for (let j = 0; j < allSlogan.length; j++) {
                    if (allSlogan[j].sloganId === sloganId) {
                        isInsert = false
                    }
                }
                if (isInsert) {
                    insertSlogan.push(sloganId)
                }
            }

            for (let i = 0; i < allSlogan.length; i++) {
                if (courseSlogan.indexOf(allSlogan[i].sloganId) === -1) {
                    delSlogan.push(allSlogan[i].id)
                }
            }

            for (let i = 0; i < insertSlogan.length; i++) {
                await query(`insert into s_xc_course_slogan(courseId,courseSloganId) values(${id},${insertSlogan[i]})`)
            }

            for (let i = 0; i < delSlogan.length; i++) {
                await query(`delete from s_xc_course_slogan where id = ${delSlogan[i]}`)
            }

            if (allCourseType.length > 0) {
                if (courseType) {
                    await query(`update s_xc_course_type set courseTypeId = ${courseType} where courseId = ${id}`)
                } else {
                    await query(`delete from s_xc_course_type where courseId = ${id}`)
                }
            }  else {
                if (courseType) {
                    await query(`insert into s_xc_course_type(courseId,courseTypeId) values(${id},${courseType})`)
                }
            }

            ctx.body = {
                code : 1
            }

        }catch (e) {
            ctx.body = {
                code : 0
            }
        }
    },

    // 拼团列表
    getSquadUser : async ctx => {
        try {
            let {phone,classId,squadType,page} = ctx.request.query
            page = page || 1
            let totalSql = `select count(*) c 
            from s_xc_squad_user su 
            left join s_xc_user u 
            on su.userId = u.id 
            left join s_xc_squad sq
            on su.squadId = sq.id
            where 1 = 1`
            let sql = `select sq.id squadId,sq.squadState,su.id,u.nickname,u.avatarUrl,u.phone,sc.name className,sc.id classId,DATE_FORMAT(su.createTime,'%Y-%m-%d %H:%i:%s') addCreateTime,DATE_FORMAT(sq.createTime,'%Y-%m-%d %H:%i:%s') createSquadTime
            from s_xc_squad_user su
            left join s_xc_squad sq
            on su.squadId = sq.id
            left join s_xc_user u
            on su.userId = u.id
            left join s_xc_class_category sc
            on su.classId = sc.id
            where 1 = 1`
            if (classId && classId !=='null') {
                sql += ` and su.classId = ${classId}`
                totalSql += ` and su.classId = ${classId}`
            }
            if (phone && phone !=='null') {
                sql += ` and u.phone = "${phone}"`
                totalSql += ` and u.phone = "${phone}"`
            }
            if (squadType) {
                sql += ` and sq.squadState = ${squadType}`
                totalSql += ` and sq.squadState = ${squadType}`
            }
            sql += ` order by su.id desc limit ${(page-1)*20},20`

            let squadDate = await query(sql)
            let total = await query(totalSql)
            for(var i=0; i<squadDate.length;i++ ) {
                let squadUserList = await query(`select b.id,b.nickname,b.avatarUrl,b.phone
                from s_xc_squad_user a
                left join s_xc_user b
                on a.userId = b.id
                where a.squadId = ${squadDate[i].squadId}`)
                squadDate[i].squadUserList = squadUserList
            }
            ctx.body = {
                code : 1,
                data : squadDate,
                total : total[0].c
            }

        }catch(e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    // 增加资料列表
    addMaterial : async ctx => {
        try {
            let {name,materialUrl,classId,brief} = ctx.request.body
            console.log(materialUrl,666)
            let addDate = await query(`insert into s_xc_material(materialName,materialUrl,materialBrief,classId) values('${name}','${materialUrl}','${brief}',${classId})`)
            console.log(addDate)
            if(addDate.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    msg : '添加资料成功'
                }
            }else {
                ctx.body = {
                    code : 0,
                    msg : '添加资料失败'
                }
            }
        }catch(e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    // 获取资料列表
    getMaterial : async ctx => {
        try {
            let materialList = await query(`select a.id,a.materialName,a.materialUrl,a.materialBrief,a.classId,b.name 
                                            from s_xc_material a 
                                            left join s_xc_class_category b 
                                            on a.classId = b.id`)
            ctx.body = {
                code : 1,
                data : materialList
            }
        }catch(e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    // 修改资料包
    editMaterial : async ctx => {
        try {
            let {id,name,classId,brief,tag} = ctx.request.body
            let editDate = await query(`update s_xc_material set materialName = '${name}',materialBrief = '${brief}',classId = ${classId} where id = ${id}`)
            if(editDate.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    mes : '编辑资料成功'
                }
            }else {
                ctx.body = {
                    code : 0,
                    msg : '编辑资料失败'
                }
            }
        }catch(e) {
            ctx.body = {
                code : 0,
                err :e
            }
        }
    },

    // 删除资料包
    delMaterial : async ctx => {
        try {
            let {id} = ctx.request.body
            let delDate = await query(`delete from s_xc_material where id = ${id}`)
            if(delDate.affectedRows >= 1) {
                ctx.body = {
                    code : 1,
                    mes : '删除资料成功'
                }
            }else {
                ctx.body = {
                    code : 0,
                    msg : '删除资料失败'
                }
            }
        }catch(e) {
            ctx.body = {
                code : 0,
                err : e
            }

        }
    },

    //获取班型
    getClass : async ctx => {
        try {
            let hotList = await query(`select id,name from s_xc_class_category`)
            ctx.body = {
                code : 1,
                data : hotList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
}


module.exports = controller

