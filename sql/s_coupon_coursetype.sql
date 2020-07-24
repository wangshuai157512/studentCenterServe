/*
 Navicat Premium Data Transfer

 Source Server         : 本地
 Source Server Type    : MySQL
 Source Server Version : 80012
 Source Host           : localhost:3306
 Source Schema         : study_center

 Target Server Type    : MySQL
 Target Server Version : 80012
 File Encoding         : 65001

 Date: 09/10/2019 17:16:50
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for s_coupon_coursetype
-- ----------------------------
DROP TABLE IF EXISTS `s_coupon_coursetype`;
CREATE TABLE `s_coupon_coursetype` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '课程id',
  `courseType` varchar(255) DEFAULT '' COMMENT '课程名称',
  `isEnable` int(11) DEFAULT NULL COMMENT '是否启用',
  `oldPrice` decimal(10,2) DEFAULT NULL COMMENT '课程包价格（原价）',
  `imgUrl` varchar(255) DEFAULT NULL COMMENT '封面',
  `title` varchar(255) DEFAULT NULL,
  `introduce` varchar(255) DEFAULT NULL,
  `courseList` varchar(255) DEFAULT NULL COMMENT '包含的课程',
  `bannerUrl` varchar(255) DEFAULT NULL COMMENT 'banner图片cdn地址',
  `imgState` int(11) DEFAULT NULL COMMENT '优惠券背景图片展示：1：浅色，2：深色',
  `sort` int(11) DEFAULT NULL COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of s_coupon_coursetype
-- ----------------------------
BEGIN;
INSERT INTO `s_coupon_coursetype` VALUES (1, '即买即学', 1, 101.00, 'https://xxzx.chinaedu.net/wx/apollo/img_basic.png', '成人高考公共基础辅导课（高起专）', '章节知识点精讲，全面覆盖成考考点，高分答题技巧，基础差也不怕', '1,2,3,', 'https://xxzx.chinaedu.net/wx/apollo/banner_basic_height.jpg', 1, 2);
INSERT INTO `s_coupon_coursetype` VALUES (2, '直播课', 1, 199.00, 'https://xxzx.chinaedu.net/wx/apollo/img_live.png', '2019年成人教育考前辅导（高起专）', '各科真题答案解析，点播阶梯思路，熟悉出题方向，强化知识点', '4,8,9', 'https://xxzx.chinaedu.net/wx/apollo/banner_live.png', 1, 4);
INSERT INTO `s_coupon_coursetype` VALUES (3, '录播课+直播+答疑', 0, 899.00, 'https://xxzx.chinaedu.net/wx/apollo/img_basic_live.png', '2019年成人教育考前优惠大礼包', '超精讲模式，效果升级，知识清单+题 确保一次吃透所学考点', '1,2,3,4,', 'https://xxzx.chinaedu.net/wx/apollo/banner_basic_live.png', 2, 5);
INSERT INTO `s_coupon_coursetype` VALUES (4, '即买即学', 1, 101.00, 'https://xxzx.chinaedu.net/wx/apollo/img_basic_zhuan.png', '成人高考公共基础辅导课（专升本）', '章节知识点精讲，全面覆盖成考考点，高分答题技巧，基础差也不怕', '1,5,3,6,', 'https://xxzx.chinaedu.net/wx/apollo/banner_basic_zhuan.jpg', 2, 1);
INSERT INTO `s_coupon_coursetype` VALUES (5, '直播课', 1, 166.00, 'https://xxzx.chinaedu.net/wx/apollo/img_live.png', '2019年成人教育考前辅导（专升本）', '各科真题答案解析，点播阶梯思路，熟悉出题方向，强化知识点', '7,10', 'https://xxzx.chinaedu.net/wx/apollo/banner_live.png', 1, 3);
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
