const query = require('../../../bus/mysqlDal');

let controller = {
    /**
     * 热门项目
     * @param ctx
     * @returns {Promise<void>}
     */
    getHotClass : async ctx => {
        try {
            let hotList = await query(`select id,name,bgcImg from s_xc_class_category where isHot = 1 order by weight desc`)
            for (let i = 0; i < hotList.length; i++) {
                let hotItem = hotList[i]
                hotItem.tag = await query(`select id,name from s_xc_class_slogan where classId = ${hotItem.id}`)
            }
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

    /**
     * 其他项目
     * @param ctx
     * @returns {Promise<void>}
     */
    otherProject : async ctx => {
        try {
            let otherProjectList = await query(`select id,name,img from s_xc_project_category order by weight desc`)
            for (let i = 0; i < otherProjectList.length; i++) {
                let otherItem = otherProjectList[i]
                otherItem.classList = await query(`select id,name from s_xc_class_category where projectId = ${otherItem.id} order by weight desc`)
            }
            ctx.body = {
                code : 1,
                data : otherProjectList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 热门项目详情页
     * @param ctx
     * @returns {Promise<void>}
     */
    hotClassDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            //班型
            let hotClass = await query(`select id,name,videoUrl,videoImg,shareImg from s_xc_class_category where id = ${id}`)
            let hotClassItem = hotClass[0]
            let classTag = await query(`select name from s_xc_class_slogan where classId = ${hotClassItem.id}`)
            let courseList = await query(`select id,name,classHour,price from s_xc_course where classId = ${hotClassItem.id} order by weight desc`)
            for (let i = 0; i < courseList.length; i++) {
                let courseItem = courseList[i]
                let courseType = await query(`select ta.name
                from s_xc_course_type t
                left join
                s_xc_type_name ta
                on t.courseTypeId = ta.id
                where t.courseId = ${courseItem.id}
                `)
                let tagList = await query(`select sn.name
                from s_xc_course_tag s
                left join
                s_xc_tag_name sn
                on s.tagId = sn.id
                where s.courseId = ${courseItem.id} and sn.id is not null
                `)
                let sloganList = await query(`select sn.name
                from s_xc_course_slogan s
                left join
                s_xc_course_slogan_name sn
                on s.courseSloganId = sn.id
                where s.courseId = ${courseItem.id} and sn.id is not null
                `)
                courseItem.courseType = courseType[0]
                courseItem.tagList = tagList
                courseItem.sloganList = sloganList
            }
            hotClassItem.courseList = courseList
            hotClassItem.classTag = classTag
            ctx.body = {
                code : 1,
                data : hotClassItem
            }

        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },

    /**
     * 分类详情
     * @param ctx
     * @returns {Promise<void>}
     */
    projectDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            let projectList = await query(`select id,name,banner_img,shareImg from s_xc_project_category where id = ${id}`)
            let classList = await query(`select id,name,videoUrl,isHot,bgcImg from s_xc_class_category where projectId = ${id} order by weight desc`)
            for (let i = 0; i < classList.length; i++) {

                let classItem = classList[i]
                let courseList = await query(`select id,name,classHour,price from s_xc_course where classId = ${classItem.id} order by weight desc`)
                classItem.courseList = courseList

                for (let j = 0; j < courseList.length; j++) {
                    let courseItem = courseList[j]

                    let courseType = await query(`select ta.name
                    from s_xc_course_type t
                    left join
                    s_xc_type_name ta
                    on t.courseTypeId = ta.id
                    where t.courseId = ${courseItem.id} and ta.id is not null
                    `)

                    let tagList = await query(`select sn.name
                    from s_xc_course_tag s
                    left join
                    s_xc_tag_name sn
                    on s.tagId = sn.id
                    where s.courseId = ${courseItem.id} and sn.id is not null
                    `)

                    let sloganList = await query(`select sn.name
                    from s_xc_course_slogan s
                    left join
                    s_xc_course_slogan_name sn
                    on s.courseSloganId = sn.id
                    where s.courseId = ${courseItem.id} and sn.id is not null
                    `)

                    courseItem.courseType = courseType[0]
                    courseItem.tagList = tagList
                    courseItem.sloganList = sloganList
                }
            }
            let data = {
                ...projectList[0],
                classList
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

    // 获取对应班型资料
    getMaterialList : async ctx => {
        try {
            let {classId} = ctx.request.query
            let materialList = await query(`select a.id,a.materialName,a.materialUrl,a.materialBrief,a.classId from s_xc_material a where a.classId = ${classId}`)
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

    // 获取已解锁所有班型资料
    getAllSuuMaterialList : async ctx => {
        try {
            let {userId} = ctx.request.query
            let materialAllList = await query(`select m.*
            from s_xc_squad_user s 
            left join s_xc_squad d 
            on s.squadId = d.id 
            left join s_xc_material m 
            on m.classId = s.classId 
            where s.userId = ${userId} and d.squadState = 1`)
            ctx.body = {
                code : 1,
                data : materialAllList
            }
        }catch(e) {
            console.log(e)
            ctx.body = {
                code : 0,
                err : e
            }
        }
    }
}

module.exports = controller
