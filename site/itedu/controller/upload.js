const query = require('../../../bus/mysqlDal');
const path = require('path')
const fs = require('fs')
const controller = {
    upload : async ctx => {
        try {
            let savePath;
            let file = ctx.request.files.file
            let time = new Date().getTime()
            let name = file.name.split('.')[1]
            let fileName = `${time}.${name}`
            if (name === 'jpg' || name === 'png' || name === 'gif' || name === 'jpeg') {
                console.log('图片')
                savePath = path.join(__dirname,'../../../public/wx/img/'+fileName)
            }else {
                console.log('文件')
                savePath = path.join(__dirname,'../../../public/wx/file/'+fileName)
            }
            let res = await controller.saveFile(file.path,savePath)
            if (res.success) {
                ctx.body = {
                    code : 1,
                    data : {
                        path : res.path
                    }
                }
            } else {
                ctx.body = {
                    code : 0,
                    err : res.err
                }
            }
        }catch (e) {
            ctx.body = {
                code : 0,
                err : e
            }
        }


    },
    saveFile : (filepath,filename) => {
        return new Promise((resolve, reject)=>{
            console.log(filepath)
            let render = fs.createReadStream(filepath);
            // 创建写入流
            let upStream = fs.createWriteStream(filename);
            render.pipe(upStream);
            upStream.on('finish', () => {
                resolve({
                    success : true,
                    path : filename.split('public')[1]
                })
            });
            upStream.on('error', (err) => {
                reject({
                    success : false,
                    err : err
                })
            });
        })
    }
}

module.exports = controller
