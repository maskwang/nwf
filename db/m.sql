/*
SQLyog 企业版 - MySQL GUI v8.14 
MySQL - 5.5.16-log : Database - m
*********************************************************************
*/
/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`crm` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `crm`;

/*Table structure for table `crm_front_company` */

DROP TABLE IF EXISTS `crm_front_company`;

CREATE TABLE `crm_front_company` (
  `company_code` varchar(10) NOT NULL COMMENT '公司标示码，唯一',
  `company_name` varchar(50) NOT NULL COMMENT '公司名称',
  `url` varchar(50) NOT NULL COMMENT '公司主页',
  `logo` varchar(50) NOT NULL COMMENT '公司logo',
  PRIMARY KEY (`company_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*Table structure for table `crm_front_resource` */

DROP TABLE IF EXISTS `crm_front_resource`;

CREATE TABLE `crm_front_resource` (
  `resource_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '资源id',
  `parent_id` int(11) DEFAULT NULL COMMENT '资源父id',
  `resource_name` varchar(100) NOT NULL COMMENT '名称',
  `module` varchar(100) DEFAULT NULL COMMENT '访问控制module',
  `controller` varchar(100) DEFAULT NULL COMMENT '访问控制controller',
  `action` varchar(100) DEFAULT NULL COMMENT '访问控制action',
  `priority` int(2) DEFAULT '1' COMMENT '显示优先级',
  `is_show` tinyint(3) DEFAULT '1' COMMENT '是否左侧显示 1是 0否',
  `company_code` varchar(10) DEFAULT NULL COMMENT '公司标示',
  `icon` varchar(50) DEFAULT NULL COMMENT '管理图标',
  PRIMARY KEY (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC COMMENT='权限资源表';

/*Table structure for table `crm_front_role` */

DROP TABLE IF EXISTS `crm_front_role`;

CREATE TABLE `crm_front_role` (
  `role_code` varchar(10) NOT NULL DEFAULT '' COMMENT '角色code',
  `parent_role_code` varchar(10) NOT NULL DEFAULT '' COMMENT '父角色code',
  `role_name` varchar(100) NOT NULL COMMENT '角色名称',
  `role_weights` int(3) NOT NULL COMMENT '权重',
  `role_desc` mediumtext NOT NULL COMMENT '角色简介',
  `company_code` varchar(10) NOT NULL COMMENT 'all是所有，其他是别的公司的code',
  PRIMARY KEY (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='内部管理角色表';

/*Table structure for table `crm_front_role_permision` */

DROP TABLE IF EXISTS `crm_front_role_permision`;

CREATE TABLE `crm_front_role_permision` (
  `resource_id` int(11) NOT NULL DEFAULT '0' COMMENT '资源id',
  `role_code` varchar(10) NOT NULL COMMENT '角色code',
  PRIMARY KEY (`resource_id`,`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC COMMENT='角色权限关联表';

/*Table structure for table `crm_front_role_user` */

DROP TABLE IF EXISTS `crm_front_role_user`;

CREATE TABLE `crm_front_role_user` (
  `role_code` varchar(10) NOT NULL COMMENT '角色code',
  `user_id` int(11) NOT NULL DEFAULT '0' COMMENT '用户id',
  PRIMARY KEY (`user_id`,`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC COMMENT='角色用户关联表';

/*Table structure for table `crm_front_user` */

DROP TABLE IF EXISTS `crm_front_user`;

CREATE TABLE `crm_front_user` (
  `user_id` smallint(5) NOT NULL AUTO_INCREMENT COMMENT '自增ID号，管理员唯一的编号',
  `user_name` varchar(60) NOT NULL DEFAULT '' COMMENT '用户名',
  `email` varchar(60) DEFAULT NULL COMMENT '邮箱',
  `password` varchar(32) NOT NULL DEFAULT '' COMMENT '密码',
  `add_time` datetime DEFAULT NULL COMMENT '添加时间',
  `last_login` datetime DEFAULT NULL COMMENT '最后一次登录时间',
  `last_ip` varchar(15) DEFAULT '' COMMENT '最后一次登录ip',
  `real_name` varchar(50) DEFAULT NULL COMMENT '真实姓名',
  `company_code` varchar(10) DEFAULT NULL COMMENT '公司标示',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='内部用户表';

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
