(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-337a"],{"4GN1":function(e,t,a){},KS3p:function(e,t,a){"use strict";var o=a("4GN1");a.n(o).a},pTAR:function(e,t,a){"use strict";a.r(t);var o=a("P2sY"),s=a.n(o),r=a("yr2c"),i=a("Mz3J"),n=a("XJYT"),l={components:{Pagination:i.a},filters:{statusFilter:function(e){return{published:"success",draft:"gray",deleted:"danger"}[e]}},data:function(){return{list:[],total:0,listLoading:!0,listQuery:{page:1,limit:10},search:"",isShowDel:!1,dialogFormVisible:!1,courseOptions:[],temp:{status:""},courseTypeId:null,dialog:!1,course:{courseType:"",title:"",introduce:"",oldPrice:"",imgUrl:"",bannerUrl:"",imgState:"",isEnable:"",courseList:""},enableOption:[{id:0,isEnable:"不开启"},{id:1,isEnable:"开启"}],typeDialogTitle:"新增"}},created:function(){this.fetchData(),this.fetchCourse()},methods:{fetchData:function(){var e=this;this.listLoading=!0,Object(r.m)(this.listQuery).then(function(t){t.success?(e.list=t.coursePackList,e.total=t.total,setTimeout(function(){e.listLoading=!1},1500)):e.listLoading=!1})},fetchCourse:function(){var e=this;this.listLoading=!0,Object(r.l)(this.listQuery).then(function(t){t.success?(e.courseOptions=t.courseList,e.total=t.total,setTimeout(function(){e.listLoading=!1},1500)):e.listLoading=!1})},del:function(e){this.$confirm("确认要删除该咨询？","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){}).catch(function(){})},look:function(e){this.$router.push({path:"/detail",query:{id:e}})},edit:function(e){this.$router.push({path:"/vocational/courseAdd",query:{id:e}})},enable:function(e){var t=this,a={pid:e,isEnable:1};Object(r.k)(a).then(function(e){e.success&&(t.$message({type:"success",message:"启用成功!"}),t.fetchData())})},stop:function(e){var t=this,a={pid:e,isEnable:0};Object(r.k)(a).then(function(e){e.success&&(t.$message({type:"success",message:"停用成功!"}),t.fetchData())})},deleteCourse:function(e,t){var a=this;this.$confirm("确认要移除该课程？","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then(function(){var o={courseId:e,courseTypeId:t};Object(r.r)(o).then(function(e){e.success?(a.$message({type:"success",message:"移除成功!"}),a.$data.isShowDel=!1,a.fetchData()):n.Message.error(e.err)})}).catch(function(){})},addCourse:function(e){this.$data.courseTypeId=e,this.$data.dialogFormVisible=!0},sure:function(){var e=this;if(""===this.$data.temp.status)n.Message.error("未选择任何课程");else{var t={courseId:this.$data.temp.status,courseTypeId:this.$data.courseTypeId};Object(r.s)(t).then(function(t){t.success?(e.$message({type:"success",message:"添加课程成功!"}),e.$data.dialogFormVisible=!1,e.fetchData()):n.Message.error(t.err)})}},sureAdd:function(){var e=this.$data.course,t=e.courseType,a=e.title,o=e.introduce,s=e.oldPrice,r=e.imgUrl,i=e.bannerUrl,l=e.imgState,u=e.isEnable,c=e.courseList;if(""===t)n.Message.error("包类型未填写");else if(""===a)n.Message.error("包名称未填写");else if(""===o)n.Message.error("包介绍未填写");else if(""===s)n.Message.error("包价格未填写");else if(""===r)n.Message.error("缩略图地址未填写");else if(""===i)n.Message.error("banner图地址未填写");else if(""===l)n.Message.error("图片状态未填写");else if(""===u)n.Message.error("请选择是否开启课程包");else if(""===c)n.Message.error("请选择一门包含的课程");else{var d={courseType:t,title:a,introduce:o,oldPrice:s,imgUrl:r,bannerUrl:i,imgState:l,isEnable:u,courseList:c};"新增"===this.$data.typeDialogTitle?this.requestAdd(d):this.requestEdit(d)}},requestAdd:function(e){var t=this;Object(r.b)(e).then(function(e){e.success?e.success?(t.$message({type:"success",message:"新增课程包成功!"}),t.$data.dialog=!1,t.fetchData(),t.resetData()):n.Message.error("新增失败"):t.listLoading=!1})},requestEdit:function(e){var t=this;s()(e,{id:this.$data.course.id}),Object(r.h)(e).then(function(e){e.success&&(t.$message({type:"success",message:"编辑成功!"}),t.$data.dialog=!1,t.fetchData(),t.resetData())})},resetData:function(){var e=this.$data.course;e.courseType,e.title,e.introduce,e.oldPrice,e.imgUrl,e.bannerUrl,e.imgState,e.isEnable,e.courseList},getValue:function(e){this.$data.temp.status=e},getEnable:function(e){this.$data.course.isEnable=e},getChildren:function(e){this.$data.course.courseList=e},addCourseType:function(){this.$data.typeDialogTitle,this.$data.dialog=!0},editRow:function(e){var t=this,a={id:e};Object(r.p)(a).then(function(e){t.$data.course=e.res,t.$data.dialog=!0,t.$data.typeDialogTitle="编辑"})}}},u=(a("KS3p"),a("KHd+")),c=Object(u.a)(l,function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"app-container"},[a("div",{staticClass:"inputBox"},[a("el-input",{staticClass:"input",attrs:{placeholder:"请输入课程名称查询"},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}}),e._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:e.addCourseType}},[e._v("新增")]),e._v(" "),!1===e.isShowDel?a("el-button",{attrs:{type:"warning"},on:{click:function(t){e.isShowDel=!0}}},[e._v("关联")]):!0===e.isShowDel?a("el-button",{attrs:{type:"warning"},on:{click:function(t){e.isShowDel=!1}}},[e._v("取消")]):e._e()],1),e._v(" "),a("el-dialog",{attrs:{visible:e.dialogFormVisible,title:"关联课程"},on:{"update:visible":function(t){e.dialogFormVisible=t}}},[a("el-form",{ref:"dataForm",staticStyle:{width:"400px","margin-left":"50px"},attrs:{"label-position":"left","label-width":"70px"}},[a("el-form-item",{attrs:{label:"课程标签",prop:"title"}},[a("el-select",{staticClass:"filter-item",attrs:{placeholder:"Please select"},on:{change:e.getValue},model:{value:e.temp.status,callback:function(t){e.$set(e.temp,"status",t)},expression:"temp.status"}},e._l(e.courseOptions,function(e){return a("el-option",{key:e.id,attrs:{label:e.sign,value:e.id}})}))],1)],1),e._v(" "),a("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(t){e.dialogFormVisible=!1}}},[e._v("取消")]),e._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:e.sure}},[e._v("确定")])],1)],1),e._v(" "),a("el-dialog",{attrs:{visible:e.dialog,title:e.typeDialogTitle},on:{"update:visible":function(t){e.dialog=t}}},[a("el-form",{ref:"dataForm",staticStyle:{width:"400px","margin-left":"50px"},attrs:{"label-position":"left","label-width":"70px"}},[a("el-form-item",{attrs:{label:"包类型",prop:"title"}},[a("el-input",{model:{value:e.course.courseType,callback:function(t){e.$set(e.course,"courseType",t)},expression:"course.courseType"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"包名称",prop:"title"}},[a("el-input",{model:{value:e.course.title,callback:function(t){e.$set(e.course,"title",t)},expression:"course.title"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"包简介",prop:"title"}},[a("el-input",{model:{value:e.course.introduce,callback:function(t){e.$set(e.course,"introduce",t)},expression:"course.introduce"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"包原价",prop:"title"}},[a("el-input",{model:{value:e.course.oldPrice,callback:function(t){e.$set(e.course,"oldPrice",t)},expression:"course.oldPrice"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"缩略图",prop:"title"}},[a("el-input",{model:{value:e.course.imgUrl,callback:function(t){e.$set(e.course,"imgUrl",t)},expression:"course.imgUrl"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"banner图",prop:"title"}},[a("el-input",{model:{value:e.course.bannerUrl,callback:function(t){e.$set(e.course,"bannerUrl",t)},expression:"course.bannerUrl"}})],1),e._v(" "),a("el-form-item",{attrs:{label:"图片状态",prop:"title"}},[a("el-input",{attrs:{type:"number"},model:{value:e.course.imgState,callback:function(t){e.$set(e.course,"imgState",t)},expression:"course.imgState"}})],1),e._v(" "),a("p",{staticStyle:{color:"red"}},[e._v("*注意：（0-对应coupon-price-bgc1.png；1-对应coupon-price-bgc2.png，前端定义）")]),e._v(" "),a("el-form-item",{attrs:{label:"是否开启",prop:"title"}},[a("el-select",{staticClass:"filter-item",attrs:{placeholder:"Please select"},on:{change:e.getEnable},model:{value:e.course.isEnable,callback:function(t){e.$set(e.course,"isEnable",t)},expression:"course.isEnable"}},e._l(e.enableOption,function(e){return a("el-option",{key:e.id,attrs:{label:e.isEnable,value:e.id}})}))],1),e._v(" "),a("el-form-item",{attrs:{label:"包含课程",prop:"title"}},[a("el-select",{staticClass:"filter-item",attrs:{disabled:"编辑"===e.typeDialogTitle,placeholder:"Please select"},on:{change:e.getChildren},model:{value:e.course.courseList,callback:function(t){e.$set(e.course,"courseList",t)},expression:"course.courseList"}},e._l(e.courseOptions,function(e){return a("el-option",{key:e.id,attrs:{label:e.sign,value:e.id}})}))],1)],1),e._v(" "),a("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(t){e.dialog=!1}}},[e._v("取消")]),e._v(" "),a("el-button",{attrs:{type:"primary"},on:{click:e.sureAdd}},[e._v("确定")])],1)],1),e._v(" "),a("el-table",{directives:[{name:"loading",rawName:"v-loading",value:e.listLoading,expression:"listLoading"}],attrs:{data:e.list.filter(function(t){return!e.search||t.title.toLowerCase().includes(e.search.toLowerCase())}),"element-loading-text":"Loading",border:"",fit:"","highlight-current-row":""}},[a("el-table-column",{attrs:{align:"center",label:"ID",width:"95"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v("\n        "+e._s(t.$index)+"\n      ")]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"课程包名称"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v("\n        "+e._s(t.row.courseType)+"\n      ")]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"是否启用"},scopedSlots:e._u([{key:"default",fn:function(t){return[0===t.row.isEnable?a("p",[e._v("未启用")]):1===t.row.isEnable?a("p",[e._v("已启用")]):e._e()]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"课程包原价"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v("\n        "+e._s(t.row.oldPrice)+"\n      ")]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"课程包简介"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v("\n        "+e._s(t.row.introduce)+"\n      ")]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"课程包标题"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._v("\n        "+e._s(t.row.title)+"\n      ")]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"缩略图"},scopedSlots:e._u([{key:"default",fn:function(e){return[a("img",{staticClass:"img_url",attrs:{src:e.row.imgUrl,alt:""}})]}}])}),e._v(" "),a("el-table-column",{attrs:{label:"包含课程标签"},scopedSlots:e._u([{key:"default",fn:function(t){return[e._l(t.row.courseNameList,function(o,s){return a("p",{key:s},[e._v(e._s(o.courseSign)),e.isShowDel?a("i",{staticClass:"el-icon-remove",on:{click:function(a){e.deleteCourse(o.courseId,t.row.id)}}}):e._e()])}),e._v(" "),a("i",{staticClass:"el-icon-circle-plus",on:{click:function(a){e.addCourse(t.row.id)}}})]}}])}),e._v(" "),a("el-table-column",{attrs:{align:"center",prop:"created_at",label:"操作",width:"240"},scopedSlots:e._u([{key:"default",fn:function(t){return[0===t.row.isEnable?a("el-button",{attrs:{size:"mini",type:"success"},on:{click:function(a){e.enable(t.row.id)}}},[e._v("启用")]):1===t.row.isEnable?a("el-button",{attrs:{size:"mini",type:"danger"},on:{click:function(a){e.stop(t.row.id)}}},[e._v("停用")]):e._e(),e._v(" "),a("el-button",{attrs:{size:"mini",type:"primary"},on:{click:function(a){e.editRow(t.row.id)}}},[e._v("编辑")])]}}])})],1),e._v(" "),a("pagination",{directives:[{name:"show",rawName:"v-show",value:e.total>0,expression:"total>0"}],attrs:{total:e.total,page:e.listQuery.page,limit:e.listQuery.limit},on:{"update:page":function(t){e.$set(e.listQuery,"page",t)},"update:limit":function(t){e.$set(e.listQuery,"limit",t)},pagination:e.fetchData}})],1)},[],!1,null,null,null);c.options.__file="index.vue";t.default=c.exports},yr2c:function(e,t,a){"use strict";a.d(t,"o",function(){return r}),a.d(t,"t",function(){return i}),a.d(t,"c",function(){return n}),a.d(t,"f",function(){return l}),a.d(t,"q",function(){return u}),a.d(t,"d",function(){return c}),a.d(t,"i",function(){return d}),a.d(t,"v",function(){return p}),a.d(t,"j",function(){return f}),a.d(t,"e",function(){return m}),a.d(t,"u",function(){return b}),a.d(t,"m",function(){return h}),a.d(t,"k",function(){return g}),a.d(t,"l",function(){return v}),a.d(t,"r",function(){return _}),a.d(t,"s",function(){return y}),a.d(t,"a",function(){return C}),a.d(t,"b",function(){return w}),a.d(t,"p",function(){return k}),a.d(t,"h",function(){return $}),a.d(t,"g",function(){return U}),a.d(t,"n",function(){return O});var o=a("t3Un"),s=a("Aeqt");function r(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/get",method:"post",data:e})}function i(){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/selectTagCourse",method:"get"})}function n(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/addTagCourse",method:"post",data:e})}function l(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/deleteTagCourse",method:"post",data:e})}function u(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/look",method:"post",data:{id:e}})}function c(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/add",method:"post",data:e})}function d(e,t){return t.id=e,Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/edit",method:"post",data:t})}function p(e){return console.log(s.a),Object(o.a)({url:s.a.BaseUrl+"/api/upload/uploadFile",method:"post",data:e})}function f(e,t){return t.id=e,Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/editUploadphoto",method:"post",data:t})}function m(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/del",method:"post",data:{id:e}})}function b(e,t){return Object(o.a)({url:s.a.BaseUrl+"/api/app_teacherCourse/showTeacherCourse",method:"post",data:{id:e,isShow:t}})}function h(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/get",method:"post",data:e})}function g(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/enable",method:"post",data:e})}function v(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/allDetail",method:"post",data:e})}function _(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/outCourse",method:"post",data:e})}function y(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/relaseCourse",method:"post",data:e})}function C(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/addCourse",method:"post",data:e})}function w(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/add",method:"post",data:e})}function k(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/getbar",method:"post",data:e})}function $(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/edit",method:"post",data:e})}function U(e){return Object(o.a)({url:s.a.BaseUrl+"/api/app_couponCourse/editCourse",method:"post",data:e})}function O(e){return Object(o.a)({url:s.a.BaseUrl+"/api/it_admin/courseList?page="+e.page,method:"get",data:e})}}}]);