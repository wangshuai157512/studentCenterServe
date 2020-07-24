const query = require('../../../bus/mysqlDal');
const config = require('../../../utils/config')
const dateTime = require('../../../utils/dateTime')
const axios = require('axios')

let controller = {
    getMaterial : async ctx => {
        try {
            let materialList = await query(`select c.materialImg,c.materialName,c.materialIntroduction,c.materialTag,c.id
            from s_xc_class_category c
            where c.materialName is not null or c.materialName <> ''
            order by weight desc
            `)
            for (let i = 0; i < materialList.length; i++) {
                if (!materialList[i].materialTag) {
                    materialList[i].tag = []
                } else {
                    materialList[i].tag = materialList[i].materialTag.split(',')
                }
            }
            ctx.body = {
                code : 1,
                data : materialList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getMyMaterial : async ctx => {
        try {
            let { userId } = ctx.request.query
            let myMaterialList = await query(`select su.classId,sc.materialName,sc.materialImg,sc.materialIntroduction,sc.materialTag
            from s_xc_squad_user su
            left join s_xc_squad sq
            on su.squadId = sq.id
            left join s_xc_class_category sc
            on su.classId = sc.id
            where su.userId = ${userId}
            and sq.squadState = 1
            `)
            for (let i = 0; i < myMaterialList.length; i++) {
                let materialTag = myMaterialList[i].materialTag
                if (!materialTag) {
                    myMaterialList[i].materialTag = []
                } else {
                    myMaterialList[i].materialTag = materialTag.split(',')
                }
            }
            ctx.body = {
                code : 1,
                data : myMaterialList
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    },
    getMaterialPackageDetail : async ctx => {
        try {
            let { id } = ctx.request.query
            let materialDetail = await query(`select materialName,materialTypeTag from s_xc_class_category where id = ${id}`)
            if (materialDetail[0].materialTypeTag) {
                materialDetail[0].tag = materialDetail[0].materialTypeTag.split(',')
            } else {
                materialDetail[0].tag = []
            }
            ctx.body = {
                code : 1,
                data : materialDetail
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }
    }
}

module.exports = controller
