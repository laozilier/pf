/*
 Navicat MySQL Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50732
 Source Host           : localhost:3306
 Source Schema         : chess

 Target Server Type    : MySQL
 Target Server Version : 50732
 File Encoding         : 65001

 Date: 27/10/2023 19:43:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_accounts
-- ----------------------------
DROP TABLE IF EXISTS `t_accounts`;
CREATE TABLE `t_accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户Id',
  `nickname` varchar(255) NOT NULL DEFAULT '' COMMENT '昵称',
  `account` varchar(255) NOT NULL DEFAULT '' COMMENT '账号',
  `pwd` varchar(255) NOT NULL DEFAULT '' COMMENT '用户密码',
  `permission` int(11) NOT NULL DEFAULT '0' COMMENT '用户权限',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `account` (`account`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for t_club
-- ----------------------------
DROP TABLE IF EXISTS `t_club`;
CREATE TABLE `t_club` (
  `id` int(10) unsigned NOT NULL COMMENT '主键id',
  `name` varchar(255) CHARACTER SET utf8mb4 NOT NULL DEFAULT '' COMMENT '俱乐部名字，base64码',
  `creator` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '创建者uid',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `status` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0.正常 1.被冻结(合并俱乐部时，会被冻结)  默认为0',
  `join_type` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0.加入俱乐部需要审核  1.加入俱乐部不需要审核    默认0',
  `mcount` int(11) NOT NULL DEFAULT '0' COMMENT '俱乐部人数',
  `lastInning` bigint(15) NOT NULL DEFAULT '0' COMMENT '上一个0点的局数',
  `inning` bigint(15) NOT NULL DEFAULT '0' COMMENT '俱乐部局数',
  `tax` bigint(20) NOT NULL DEFAULT '0' COMMENT '俱乐部税收，俱乐部创建开始累积税收',
  `lastTax` bigint(20) NOT NULL DEFAULT '0' COMMENT '上一个0点的税收',
  `profit` bigint(20) NOT NULL DEFAULT '0' COMMENT '利润',
  `lastProfit` bigint(20) NOT NULL DEFAULT '0' COMMENT '上一个0点利润',
  `rechargePoundage` bigint(20) NOT NULL DEFAULT '0' COMMENT '充值手续费',
  `uwWithdrawPoundage` bigint(20) NOT NULL DEFAULT '0' COMMENT '玩家提现手续费',
  `creatorProfit` bigint(20) NOT NULL DEFAULT '0' COMMENT '群主利润',
  `dwWithdrawPoundage` bigint(20) NOT NULL DEFAULT '0' COMMENT '代理提现手续费',
  `recharge` bigint(20) NOT NULL DEFAULT '0' COMMENT '玩家总充值',
  `withdrawal` bigint(20) NOT NULL DEFAULT '0' COMMENT '玩家总提现',
  `dealerRecharge` bigint(20) NOT NULL DEFAULT '0' COMMENT '代理总充值',
  `dealerWithdrawal` bigint(20) NOT NULL DEFAULT '0' COMMENT '玩家总提现',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC COMMENT='俱乐部表';

-- ----------------------------
-- Records of t_club
-- ----------------------------
BEGIN;
INSERT INTO `t_club` VALUES (5382004, 'AAA', 553422, '2022-07-19 16:00:20', 0, 0, 4, 1, 2, 1600, 1000, 1600, 1000, 0, 0, 0, 0, 150000000, 0, 0, 0);
INSERT INTO `t_club` VALUES (8672779, 'LOL', 944738, '2023-10-14 00:49:30', 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 80000000, 0, 0, 0);
COMMIT;

-- ----------------------------
-- Table structure for t_club_member
-- ----------------------------
DROP TABLE IF EXISTS `t_club_member`;
CREATE TABLE `t_club_member` (
  `cid` int(10) unsigned NOT NULL COMMENT '群主id',
  `uid` int(10) unsigned NOT NULL COMMENT '玩家uid',
  `type` int(10) NOT NULL DEFAULT '0' COMMENT '群组权限，\r\n0.无权限 \r\n1管理员(股东), 2群主',
  `blacklist` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '是否黑名单成员，0不是  1是',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  UNIQUE KEY `guid` (`cid`,`uid`) USING BTREE,
  KEY `uid` (`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC COMMENT='成员表';

-- ----------------------------
-- Records of t_club_member
-- ----------------------------
BEGIN;
INSERT INTO `t_club_member` VALUES (5382004, 452614, 0, 0, '2022-07-29 15:44:13');
INSERT INTO `t_club_member` VALUES (5382004, 553422, 2, 0, '2022-07-19 16:00:20');
INSERT INTO `t_club_member` VALUES (5382004, 719999, 0, 0, '2023-10-17 22:27:17');
INSERT INTO `t_club_member` VALUES (5382004, 740175, 0, 0, '2022-07-19 16:02:15');
INSERT INTO `t_club_member` VALUES (8672779, 944738, 2, 0, '2023-10-14 00:49:30');
COMMIT;

-- ----------------------------
-- Table structure for t_club_rooms
-- ----------------------------
DROP TABLE IF EXISTS `t_club_rooms`;
CREATE TABLE `t_club_rooms` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '包间id',
  `cid` int(10) NOT NULL COMMENT '俱乐部id',
  `name` varchar(128) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '包间名字',
  `content` json NOT NULL COMMENT '游戏规则',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建日期',
  `weight` bigint(20) NOT NULL COMMENT '房间权重，用来排序',
  `max` int(10) NOT NULL DEFAULT '0' COMMENT '这个包间最大可开多少，0无限制',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `q_id` (`id`,`cid`) USING BTREE,
  KEY `cid` (`cid`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC COMMENT='俱乐部包间';

-- ----------------------------
-- Records of t_club_rooms
-- ----------------------------
BEGIN;
INSERT INTO `t_club_rooms` VALUES (1, 5382004, '', '{\"gameName\": \"zp_chz\", \"game_rule\": {\"ante\": 10000, \"fanxing\": 1, \"piaofen\": 0, \"wangNum\": 4, \"gameRules\": [true, true], \"stopCheatings\": false}, \"room_rule\": {\"halfway\": true, \"playerMax\": 0, \"inningLimit\": 0, \"startNumber\": 2}}', '2022-07-21 16:50:24', 1658393424, 0);
INSERT INTO `t_club_rooms` VALUES (2, 8672779, '', '{\"gameName\": \"niuniu_mpqz\", \"game_rule\": {\"wh\": false, \"ante\": 1000, \"bets\": 0, \"isSn\": true, \"isHln\": true, \"isJpn\": true, \"isQdn\": false, \"isThn\": true, \"isThs\": true, \"isWhn\": true, \"isWxn\": true, \"isZdn\": true, \"cuopai\": true, \"tuizhu\": 1, \"isLaizi\": false, \"multiple\": 3, \"anteDouble\": false, \"multipleRule\": 0}, \"room_rule\": {\"halfway\": true, \"playerMax\": 0, \"inningLimit\": 0, \"startNumber\": 2}}', '2023-10-14 00:50:13', 1697215813, 0);
INSERT INTO `t_club_rooms` VALUES (3, 8672779, '', '{\"gameName\": \"niuniu_guodi\", \"game_rule\": {\"wh\": false, \"ante\": 100000, \"bets\": 0, \"isSn\": true, \"isHln\": true, \"isJpn\": false, \"isQdn\": false, \"isThn\": true, \"isThs\": false, \"isWhn\": true, \"isWxn\": true, \"isZdn\": true, \"cuopai\": true, \"isLaizi\": false, \"mpHolds\": false, \"maxCount\": 1, \"multiple\": 1, \"maxBankMul\": 10, \"minBankMul\": 0, \"shouInning\": 3, \"multipleRule\": 0}, \"room_rule\": {\"halfway\": true, \"playerMax\": 0, \"inningLimit\": 0, \"startNumber\": 2}}', '2023-10-14 00:50:19', 1697215819, 0);
INSERT INTO `t_club_rooms` VALUES (4, 5382004, '', '{\"gameName\": \"niuniu_mpqz\", \"game_rule\": {\"wh\": false, \"ante\": 1000, \"bets\": 0, \"isSn\": true, \"isHln\": true, \"isJpn\": true, \"isQdn\": false, \"isThn\": true, \"isThs\": true, \"isWhn\": true, \"isWxn\": true, \"isZdn\": true, \"cuopai\": true, \"tuizhu\": 1, \"isLaizi\": false, \"multiple\": 3, \"anteDouble\": false, \"multipleRule\": 0}, \"room_rule\": {\"halfway\": true, \"playerMax\": 0, \"inningLimit\": 0, \"startNumber\": 2}}', '2023-10-14 00:53:48', 1697216028, 0);
COMMIT;

-- ----------------------------
-- Table structure for t_complaint
-- ----------------------------
DROP TABLE IF EXISTS `t_complaint`;
CREATE TABLE `t_complaint` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '投诉原因0.充值不到账  1.无法充值  2.其它原因',
  `uid` int(10) NOT NULL DEFAULT '0' COMMENT '投诉人uid',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '投诉备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='投诉信息表';

-- ----------------------------
-- Table structure for t_config
-- ----------------------------
DROP TABLE IF EXISTS `t_config`;
CREATE TABLE `t_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `key` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '属性名',
  `value` decimal(19,4) NOT NULL DEFAULT '0.0000' COMMENT '值',
  `content` varchar(255) NOT NULL DEFAULT '' COMMENT '字符串的值',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `keyname` (`key`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_config
-- ----------------------------
BEGIN;
INSERT INTO `t_config` VALUES (1, 'withdraw_poundage', 0.0200, '', '提现收续费');
INSERT INTO `t_config` VALUES (2, 'min_withdraw', 10.0000, '', '最小提现金额');
INSERT INTO `t_config` VALUES (3, 'max_withdraw', 10000.0000, '', '最大提现金额');
INSERT INTO `t_config` VALUES (4, 'inning', 50.0000, '', '多少局减一局');
INSERT INTO `t_config` VALUES (5, 'parent_ratio', 0.0000, '[0.2,0.1,0.1,0.05]', '父级返佣比例');
INSERT INTO `t_config` VALUES (6, 'withdraw_domain', 0.0000, 'http://www.baidu.com/getWXUserInfo', '绑定提现微信域名');
INSERT INTO `t_config` VALUES (7, 'dealer_backstage', 0.0000, 'http://8.129.6.200:4000/login', '代理后台');
INSERT INTO `t_config` VALUES (8, 'min_givescore', 10000.0000, '', '最小赠送分数');
INSERT INTO `t_config` VALUES (10, 'ratios', 0.0000, '[0,0.3,0.33,0.36,0.4,0.6,0.8]', '返佣列表');
INSERT INTO `t_config` VALUES (11, 'dealer_withdraw_poundage', 0.0200, '', '代理提现手续费');
INSERT INTO `t_config` VALUES (12, 'not_create_user', 0.0000, '', '1=不能创建新用户,1=能创建');
INSERT INTO `t_config` VALUES (13, 'invite_url', 0.0000, 'http://103.46.12.38/download.html', '邀请地址');
INSERT INTO `t_config` VALUES (14, 'clasp', 6.0000, '', '暗扣（每多少局扣一笔）');
INSERT INTO `t_config` VALUES (15, 'kefu_url', 0.0000, '', '客服地址');
COMMIT;

-- ----------------------------
-- Table structure for t_givescore
-- ----------------------------
DROP TABLE IF EXISTS `t_givescore`;
CREATE TABLE `t_givescore` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `give_uid` int(8) NOT NULL COMMENT '赠送方UID',
  `accept_uid` int(8) NOT NULL COMMENT '接受方UID',
  `score` bigint(20) NOT NULL COMMENT '分数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `guid` (`give_uid`) USING BTREE,
  KEY `auid` (`accept_uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for t_history
-- ----------------------------
DROP TABLE IF EXISTS `t_history`;
CREATE TABLE `t_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `cid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '俱乐部id',
  `prid` varchar(10) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '俱乐部包间id',
  `room_history_id` int(11) unsigned NOT NULL COMMENT '房间历史记录的主键id号',
  `game_name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '游戏名字',
  `uids` json NOT NULL COMMENT '玩家数组',
  `scores` json NOT NULL COMMENT '这一局玩家的分数',
  `actual_scores` json NOT NULL COMMENT '最后的真实分数，可能输家分数不足，或者赢家所带分数不足',
  `big_winner` json NOT NULL COMMENT '这一小局大赢家，数组格式',
  `inning` int(10) unsigned NOT NULL DEFAULT '1' COMMENT '这是第几局',
  `tax` int(11) NOT NULL DEFAULT '0' COMMENT '税收',
  `playback` json NOT NULL COMMENT '游戏过程数据',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `final_scores` json NOT NULL COMMENT '最终分数',
  `userinfo` json DEFAULT NULL COMMENT '用户的基本信息，名字，头像，性别',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `inning` (`room_history_id`,`inning`) USING BTREE,
  KEY `cid` (`cid`) USING BTREE COMMENT '俱乐部主键',
  FULLTEXT KEY `game_name` (`game_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_history
-- ----------------------------
BEGIN;
INSERT INTO `t_history` VALUES (1, 5382004, '4', 2, 'niuniu_mpqz', '[740175, 553422]', '[16000, -16000]', '{\"740175\": 16000}', '[740175]', 1, 600, '{\"laizi\": -1, \"553422\": {\"dec\": true, \"rob\": 4, \"holds\": [42, 32, 24, 35, 14], \"score\": -16000, \"value\": 0}, \"740175\": {\"bet\": 2000, \"rob\": 4, \"holds\": [23, 34, 50, 8, 9], \"score\": 16000, \"value\": 8}, \"multipleRule\": 0}', '2023-10-14 00:54:59', '[{\"uid\": 553422, \"score\": 49983700}, {\"uid\": 740175, \"score\": 50175200}]', '{\"553422\": {\"sex\": 0, \"name\": \"5ri45a6i\", \"headimg\": \"\"}, \"740175\": {\"sex\": 0, \"name\": \"5ri45a6i\", \"headimg\": \"\"}}');
COMMIT;

-- ----------------------------
-- Table structure for t_history_relation
-- ----------------------------
DROP TABLE IF EXISTS `t_history_relation`;
CREATE TABLE `t_history_relation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `hid` bigint(20) DEFAULT NULL COMMENT 't_history表中主键',
  `uid` int(8) DEFAULT NULL COMMENT '用户ID',
  `htime` bigint(32) DEFAULT NULL COMMENT '插入的时间戳',
  `cid` int(10) DEFAULT '0' COMMENT '俱乐部id',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `uid` (`uid`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_history_relation
-- ----------------------------
BEGIN;
INSERT INTO `t_history_relation` VALUES (1, 1, 740175, 1697216099, 5382004);
INSERT INTO `t_history_relation` VALUES (2, 1, 553422, 1697216099, 5382004);
COMMIT;

-- ----------------------------
-- Table structure for t_logs
-- ----------------------------
DROP TABLE IF EXISTS `t_logs`;
CREATE TABLE `t_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(10) NOT NULL DEFAULT '0' COMMENT '用户uid',
  `other_uid` int(10) NOT NULL DEFAULT '0' COMMENT '其它他玩家uid',
  `type` int(10) NOT NULL DEFAULT '0' COMMENT '操作类型 0=设置分润，',
  `remark` varchar(1024) NOT NULL COMMENT '操作日志，',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_logs
-- ----------------------------
BEGIN;
INSERT INTO `t_logs` VALUES (1, 553422, 553422, 0, '553422修改玩家553422返佣为0.8');
COMMIT;

-- ----------------------------
-- Table structure for t_notice
-- ----------------------------
DROP TABLE IF EXISTS `t_notice`;
CREATE TABLE `t_notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `msg` text NOT NULL COMMENT '消息内容',
  `create_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态 1=当前显示公告，其它值都将忽略',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '类型，保留字段',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='公告信息';

-- ----------------------------
-- Records of t_notice
-- ----------------------------
BEGIN;
INSERT INTO `t_notice` VALUES (3, '       游戏上线了，好玩的来啦！', '2020-10-21 12:23:30', 1, 0);
COMMIT;

-- ----------------------------
-- Table structure for t_orders
-- ----------------------------
DROP TABLE IF EXISTS `t_orders`;
CREATE TABLE `t_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `uid` int(11) NOT NULL DEFAULT '0' COMMENT '玩家uid',
  `operator_uid` int(11) NOT NULL DEFAULT '0' COMMENT '操作uid',
  `transaction_id` varchar(64) NOT NULL DEFAULT '' COMMENT '交易单号,支付系统订单号',
  `order_sn` varchar(40) NOT NULL DEFAULT '' COMMENT '订单号',
  `goods_id` int(10) NOT NULL DEFAULT '0' COMMENT '商品编号',
  `agent_id` varchar(32) NOT NULL DEFAULT '' COMMENT '商户号   888是手动充值  999代理兑换',
  `pay_status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '订单状态 0 待支付 1已支付',
  `pay_channel` int(10) NOT NULL DEFAULT '0' COMMENT '支付通道 //0微信H5, 1支付宝H5, 2快捷支付, 3银联扫码, 4支付宝扫码  30人工充值  40代理积分兑换',
  `pay_type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '支付类型 1充值 2赠送',
  `buy_number` int(11) NOT NULL DEFAULT '0' COMMENT '购买数量',
  `fruits_number` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '水果数量',
  `pay_money` decimal(15,4) unsigned NOT NULL DEFAULT '0.0000' COMMENT '支付价格',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `pay_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '支付时间',
  `goods_name` varchar(40) NOT NULL DEFAULT '' COMMENT '商品名字',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `poundage` int(10) NOT NULL DEFAULT '0' COMMENT '充值手续费',
  `cid` int(10) NOT NULL DEFAULT '0' COMMENT '俱乐部ID',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `order_sn` (`order_sn`) USING BTREE COMMENT '订单号唯一',
  KEY `operator_id` (`uid`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='订单列表';

-- ----------------------------
-- Records of t_orders
-- ----------------------------
BEGIN;
INSERT INTO `t_orders` VALUES (1, 740175, 553422, '', '3020220729154335410576', 0, 'manual_recharge', 1, 30, 0, 50000000, 0, 5000.0000, '2022-07-29 15:43:35', '2022-07-29 15:43:35', '', '', 0, 5382004);
INSERT INTO `t_orders` VALUES (2, 452614, 553422, '', '3020220729154433513968', 0, 'manual_recharge', 1, 30, 0, 50000000, 0, 5000.0000, '2022-07-29 15:44:33', '2022-07-29 15:44:33', '', '', 0, 5382004);
INSERT INTO `t_orders` VALUES (3, 944738, 944738, '', '302023101405103286018', 0, 'manual_recharge', 1, 30, 0, 80000000, 0, 8000.0000, '2023-10-14 00:51:03', '2023-10-14 00:51:03', '', '', 0, 8672779);
INSERT INTO `t_orders` VALUES (4, 553422, 553422, '', '302023101405420133830', 0, 'manual_recharge', 1, 30, 0, 50000000, 0, 5000.0000, '2023-10-14 00:54:20', '2023-10-14 00:54:20', '', '', 0, 5382004);
COMMIT;

-- ----------------------------
-- Table structure for t_payment_code
-- ----------------------------
DROP TABLE IF EXISTS `t_payment_code`;
CREATE TABLE `t_payment_code` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uid` int(10) NOT NULL DEFAULT '0',
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '微信或支付宝绑定的实名',
  `paymenturl` varchar(255) NOT NULL COMMENT '收款码',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后一次上传时间',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `uid` (`uid`) USING BTREE,
  KEY `payment` (`paymenturl`(191)) USING BTREE,
  KEY `uid_payment` (`uid`,`paymenturl`(191)) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for t_permission
-- ----------------------------
DROP TABLE IF EXISTS `t_permission`;
CREATE TABLE `t_permission` (
  `uid` int(10) NOT NULL COMMENT '权限设置',
  `withdraw` tinyint(1) NOT NULL DEFAULT '0' COMMENT '提现审核权限',
  `recharge` tinyint(1) NOT NULL DEFAULT '0' COMMENT '增加分数权限(加分减分是一个权限)，可以给任意玩家增加分数',
  `dismissRoom` tinyint(1) NOT NULL DEFAULT '0' COMMENT '解散房间权限',
  `manager` tinyint(1) NOT NULL DEFAULT '0' COMMENT '管理员权限',
  `dealer` tinyint(1) NOT NULL DEFAULT '0' COMMENT '开代理权限',
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_permission
-- ----------------------------
BEGIN;
INSERT INTO `t_permission` VALUES (553422, 1, 1, 1, 1, 1);
COMMIT;

-- ----------------------------
-- Table structure for t_profit
-- ----------------------------
DROP TABLE IF EXISTS `t_profit`;
CREATE TABLE `t_profit` (
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '玩家uid',
  `profit` bigint(19) unsigned NOT NULL DEFAULT '0' COMMENT '当前利润',
  `today_profit` bigint(19) unsigned NOT NULL DEFAULT '0' COMMENT '今日收益',
  `total_profit` bigint(19) unsigned NOT NULL DEFAULT '0' COMMENT '总收益',
  `freeze_profit` bigint(19) NOT NULL DEFAULT '0' COMMENT '冻结收益',
  `withdraw_profit` bigint(19) unsigned NOT NULL DEFAULT '0' COMMENT '提现收益',
  `poundage` bigint(19) unsigned NOT NULL DEFAULT '0' COMMENT '提现收续费',
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_profit
-- ----------------------------
BEGIN;
INSERT INTO `t_profit` VALUES (350687, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (452614, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (553422, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (666671, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (719999, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (740175, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (781698, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (944738, 0, 0, 0, 0, 0, 0);
INSERT INTO `t_profit` VALUES (960889, 0, 0, 0, 0, 0, 0);
COMMIT;

-- ----------------------------
-- Table structure for t_prop
-- ----------------------------
DROP TABLE IF EXISTS `t_prop`;
CREATE TABLE `t_prop` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '道具id',
  `name` varchar(128) NOT NULL DEFAULT '' COMMENT '道具名字',
  `count` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '道具数量金币数量',
  `price` decimal(10,2) unsigned NOT NULL DEFAULT '0.00' COMMENT '道具价格人民币',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '道具状态0.正常 1.冻结',
  `type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '道具类型，0=微信，1=支付宝，2=快捷支付，3=银联扫码',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='道具表';

-- ----------------------------
-- Table structure for t_room_history
-- ----------------------------
DROP TABLE IF EXISTS `t_room_history`;
CREATE TABLE `t_room_history` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
  `uuid` varchar(20) NOT NULL COMMENT '房间uuid',
  `cid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '俱乐部id ,如果不为0，则此房间由俱乐部创建',
  `rid` int(8) NOT NULL COMMENT '房间号',
  `game_name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '游戏名字',
  `game_rule` json NOT NULL COMMENT '游戏规则',
  `room_rule` json NOT NULL COMMENT '房间层规则',
  `creator` int(11) unsigned NOT NULL COMMENT '创建者uid',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `inning_limit` int(2) unsigned NOT NULL COMMENT '进入房间必须玩多少局才能退出',
  `halfway` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '是否中途加入',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uuid` (`uuid`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_room_history
-- ----------------------------
BEGIN;
INSERT INTO `t_room_history` VALUES (1, '1659080678999549422', 5382004, 549422, 'zp_chz', '{\"ante\": 10000, \"fanxing\": 1, \"piaofen\": 0, \"wangNum\": 4, \"gameRules\": [true, true]}', '{\"halfway\": true, \"playerMax\": 0, \"inningLimit\": 0, \"startNumber\": 2}', 452614, '2022-07-29 15:44:39', 0, 1);
INSERT INTO `t_room_history` VALUES (2, '1697216071420489618', 5382004, 489618, 'niuniu_mpqz', '{\"wh\": false, \"ante\": 1000, \"bets\": 0, \"isSn\": true, \"isHln\": true, \"isJpn\": true, \"isQdn\": false, \"isThn\": true, \"isThs\": true, \"isWhn\": true, \"isWxn\": true, \"isZdn\": true, \"cuopai\": true, \"tuizhu\": 1, \"isLaizi\": false, \"multiple\": 3, \"anteDouble\": false, \"multipleRule\": 0}', '{\"halfway\": true, \"playerMax\": 0, \"inningLimit\": 0, \"startNumber\": 2}', 740175, '2023-10-14 00:54:31', 0, 1);
COMMIT;

-- ----------------------------
-- Table structure for t_sp_log_sp_game_witescore
-- ----------------------------
DROP TABLE IF EXISTS `t_sp_log_sp_game_witescore`;
CREATE TABLE `t_sp_log_sp_game_witescore` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `roomid` varchar(20) NOT NULL DEFAULT '' COMMENT '房间号',
  `inning` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '局数',
  `data` json NOT NULL COMMENT '加减分数据',
  `tax` int(10) NOT NULL DEFAULT '0' COMMENT '税收',
  `insertdate` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for t_statistics
-- ----------------------------
DROP TABLE IF EXISTS `t_statistics`;
CREATE TABLE `t_statistics` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `days` int(11) DEFAULT '0' COMMENT '天数',
  `tax` bigint(20) DEFAULT '0' COMMENT '总税收',
  `inning` bigint(20) DEFAULT '0' COMMENT '总局数',
  `recharge` bigint(20) DEFAULT '0' COMMENT '总充值',
  `rechargePoundage` bigint(20) DEFAULT '0' COMMENT '充值收续费',
  `profitRecharge` bigint(20) DEFAULT '0' COMMENT '代理返佣充到游戏中',
  `withdraw` bigint(20) DEFAULT '0' COMMENT '总提现',
  `uwPoundage` bigint(20) DEFAULT '0' COMMENT '玩家提现收续费',
  `dwPoundage` bigint(20) DEFAULT '0' COMMENT '代理提现收续费',
  `dealerProfit` bigint(20) DEFAULT '0' COMMENT '代理利润',
  `playerScore` bigint(20) DEFAULT '0' COMMENT '玩家分数',
  `dealerScore` bigint(20) DEFAULT '0' COMMENT '代理分数',
  `totalUsers` int(11) DEFAULT '0' COMMENT '总用户数',
  `activeUsers` int(11) DEFAULT '0' COMMENT '活跃用户数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `creatorProfit` bigint(20) NOT NULL COMMENT '群主利润',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_statistics
-- ----------------------------
BEGIN;
INSERT INTO `t_statistics` VALUES (1, 738851, 1000, 0, 100000000, 0, 0, 0, 0, 0, 0, 99999000, 0, 7, 0, '2022-11-28 00:00:00', 0);
INSERT INTO `t_statistics` VALUES (2, 738993, 1000, 0, 100000000, 0, 0, 0, 0, 0, 0, 99999000, 0, 7, 0, '2023-04-19 00:00:00', 0);
COMMIT;

-- ----------------------------
-- Table structure for t_users
-- ----------------------------
DROP TABLE IF EXISTS `t_users`;
CREATE TABLE `t_users` (
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '用户id',
  `account` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '用户账号',
  `name` varchar(256) NOT NULL DEFAULT '' COMMENT '用户名字',
  `sex` int(1) unsigned NOT NULL DEFAULT '0' COMMENT '用户性别，1男 2女',
  `headimg` varchar(256) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '用户头像url',
  `invite_code` int(8) NOT NULL DEFAULT '0' COMMENT '用户绑定的邀请码',
  `ppid` int(8) NOT NULL DEFAULT '0' COMMENT '上上级id',
  `bind_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '绑定的时间',
  `login_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最近一次登录时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `location` varchar(256) CHARACTER SET utf8 NOT NULL COMMENT '用户地址',
  `remarks` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '玩家备注',
  `last_inning` int(10) NOT NULL DEFAULT '0' COMMENT '上一个零点时候的局数',
  `total_inning` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '玩的总局数',
  `login_ip` varchar(32) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '用户最后一次登录ip',
  `team_count` int(10) NOT NULL DEFAULT '0' COMMENT '团队总人数',
  `profit_ratio` decimal(3,2) NOT NULL DEFAULT '0.00' COMMENT '分成等级',
  `lucky` int(10) NOT NULL DEFAULT '0' COMMENT '玩家幸运值',
  `robot` int(10) NOT NULL DEFAULT '0',
  `mobile` varchar(32) NOT NULL DEFAULT '' COMMENT '手机号',
  `sealUp` tinyint(2) NOT NULL DEFAULT '0' COMMENT '是否封号0=正常，1=被封号',
  PRIMARY KEY (`uid`) USING BTREE,
  UNIQUE KEY `acount` (`account`) USING BTREE COMMENT '用户账号',
  KEY `pid` (`invite_code`) USING BTREE,
  KEY `ppid` (`ppid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='用户表';

-- ----------------------------
-- Records of t_users
-- ----------------------------
BEGIN;
INSERT INTO `t_users` VALUES (350687, 'guest_top3', '5ri45a6i', 0, '', 666671, 960889, '2022-07-19 15:55:16', '2022-07-19 15:55:16', '2022-07-19 15:55:16', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (452614, 'guest_test2', '5ri45a6i', 0, '', 740175, 553422, '2022-07-29 15:44:13', '2022-07-29 15:43:59', '2022-07-29 15:43:59', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (553422, 'guest_club', '5ri45a6i', 0, '', 350687, 666671, '2022-07-19 15:56:27', '2022-07-19 15:56:07', '2022-07-19 15:56:07', '{}', '', 0, 0, '', 0, 0.80, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (666671, 'guest_top2', '5ri45a6i', 0, '', 960889, 0, '2022-07-19 15:54:11', '2022-07-19 15:54:11', '2022-07-19 15:54:11', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (719999, 'mobile_18569071924', '55So5oi3MTkyNA==', 0, '', 553422, 350687, '2023-10-17 22:27:17', '2023-10-17 22:27:17', '2023-10-17 22:27:17', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (740175, 'guest_test1', '5ri45a6i', 0, '', 553422, 350687, '2022-07-19 16:02:15', '2022-07-19 16:02:11', '2022-07-19 16:02:11', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (944738, 'guest_1656662897234', '5ri45a6i', 0, '', 0, 0, '2022-07-21 15:14:24', '2022-07-21 15:14:24', '2022-07-21 15:14:24', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
INSERT INTO `t_users` VALUES (960889, 'guest_top1', '5ri45a6i', 0, '', 0, 0, '2022-07-19 15:51:14', '2022-07-19 15:51:14', '2022-07-19 15:51:14', '{}', '', 0, 0, '', 0, 0.00, 0, 0, '', 0);
COMMIT;

-- ----------------------------
-- Table structure for t_version
-- ----------------------------
DROP TABLE IF EXISTS `t_version`;
CREATE TABLE `t_version` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `os` varchar(255) NOT NULL COMMENT '系统',
  `version` varchar(255) NOT NULL COMMENT '最新版本号',
  `update` int(1) NOT NULL COMMENT '1 = 强制 0 = 非强制',
  `downloadUrl` varchar(255) NOT NULL COMMENT '下载地址',
  `build` int(11) NOT NULL COMMENT '最新build版本号',
  `type` int(1) NOT NULL COMMENT '0 = 热更版本， 1 = 安装包版本',
  `status` int(1) NOT NULL COMMENT '0 = 正常 1 = 过期',
  `remark` text NOT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_version
-- ----------------------------
BEGIN;
INSERT INTO `t_version` VALUES (3, 'IOS', '1.0.0', 0, 'http://103.46.12.38/download.html', 10001, 1, 0, '初始版本');
INSERT INTO `t_version` VALUES (4, 'Android', '1.0.0', 0, 'http://103.46.12.38/download.html', 10001, 1, 0, '初始版本');
COMMIT;

-- ----------------------------
-- Table structure for t_wallet
-- ----------------------------
DROP TABLE IF EXISTS `t_wallet`;
CREATE TABLE `t_wallet` (
  `uid` int(10) unsigned NOT NULL COMMENT 'uid',
  `score` bigint(15) NOT NULL DEFAULT '0' COMMENT '用户分数',
  `recharge` bigint(15) NOT NULL DEFAULT '0' COMMENT '总充值',
  `withdrawal` bigint(15) unsigned NOT NULL DEFAULT '0' COMMENT '总提现',
  `game_turnover` bigint(15) NOT NULL DEFAULT '0' COMMENT '游戏流水',
  `tax` bigint(15) unsigned NOT NULL DEFAULT '0' COMMENT '税收',
  `poundage` decimal(17,2) NOT NULL DEFAULT '0.00' COMMENT '提现手续费',
  `profit` bigint(15) NOT NULL DEFAULT '0' COMMENT '利润提到游戏中',
  `give` bigint(15) NOT NULL DEFAULT '0' COMMENT '总赠送记录',
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Records of t_wallet
-- ----------------------------
BEGIN;
INSERT INTO `t_wallet` VALUES (350687, 0, 0, 0, 0, 0, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (452614, 49839500, 50000000, 0, -160000, 500, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (553422, 49983700, 50000000, 0, -16000, 300, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (666671, 0, 0, 0, 0, 0, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (719999, 0, 0, 0, 0, 0, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (740175, 50175200, 50000000, 0, 176000, 800, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (944738, 80000000, 80000000, 0, 0, 0, 0.00, 0, 0);
INSERT INTO `t_wallet` VALUES (960889, 0, 0, 0, 0, 0, 0.00, 0, 0);
COMMIT;

-- ----------------------------
-- Table structure for t_wechat
-- ----------------------------
DROP TABLE IF EXISTS `t_wechat`;
CREATE TABLE `t_wechat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(8) NOT NULL DEFAULT '0',
  `nickname` varchar(64) NOT NULL DEFAULT '',
  `realname` varchar(255) NOT NULL COMMENT '真实姓名',
  `headimg` varchar(512) NOT NULL,
  `openid` char(64) NOT NULL COMMENT 'openid',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `status` int(8) NOT NULL DEFAULT '0' COMMENT '0，1默认微信',
  `isdel` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0未删除 1已删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `wxopenid` (`openid`,`uid`) USING BTREE,
  KEY `uid` (`uid`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for t_withdraw_dealer
-- ----------------------------
DROP TABLE IF EXISTS `t_withdraw_dealer`;
CREATE TABLE `t_withdraw_dealer` (
  `id` int(10) NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `cid` int(10) NOT NULL DEFAULT '0' COMMENT '俱乐部id',
  `uid` int(6) NOT NULL DEFAULT '0' COMMENT '提现代理id',
  `score` bigint(19) NOT NULL DEFAULT '0' COMMENT '提现金额',
  `order_sn` varchar(32) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '本地订单号',
  `poundage` int(10) NOT NULL DEFAULT '0' COMMENT '手续费',
  `payment_no` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '交易单号',
  `partner_trade_no` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '单号',
  `openid` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT 'openid',
  `status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '订单状态 0 正在提现 1提现成功 2交易关闭 3退款',
  `remark` varchar(255) NOT NULL DEFAULT '' COMMENT '备注',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `operation_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '到账时间,处理时间',
  `surplus_score` bigint(19) NOT NULL DEFAULT '0' COMMENT '剩余利润',
  `type` tinyint(3) NOT NULL DEFAULT '0' COMMENT '提现类型，0=正常提现，1=管理员扣分，2=兑换成游戏积分',
  `admin` int(10) NOT NULL DEFAULT '0' COMMENT '管理员uid',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `order_sn` (`order_sn`) USING BTREE COMMENT '本地订单号唯一'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC;

-- ----------------------------
-- Table structure for t_withdraw_order
-- ----------------------------
DROP TABLE IF EXISTS `t_withdraw_order`;
CREATE TABLE `t_withdraw_order` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
  `cid` int(10) NOT NULL DEFAULT '0' COMMENT '俱乐部id',
  `uid` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '下分玩家',
  `score` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '分数',
  `order_sn` varchar(32) CHARACTER SET utf8 NOT NULL DEFAULT '',
  `poundage` int(11) NOT NULL DEFAULT '0' COMMENT '手续费',
  `payment_no` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '微信付款单号',
  `partner_trade_no` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '单号',
  `openid` varchar(64) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT 'openid',
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0' COMMENT '状态：0.未提现  1.已提现  2.已拒绝 3退款',
  `remark` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '' COMMENT '提现备注，如：拒绝原因',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '订单创建时间',
  `operation_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '订单操作时间',
  `surplus_score` bigint(20) NOT NULL DEFAULT '0' COMMENT '提现后剩余分数',
  `type` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '提现类型，0=正常提现，1=管理员扣分',
  `admin` int(10) NOT NULL DEFAULT '0' COMMENT '管理员uid',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `ordersn` (`order_sn`) USING BTREE,
  KEY `uid` (`uid`) USING BTREE,
  KEY `status` (`status`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='下分订单表';

-- ----------------------------
-- Function structure for f_generate_uid
-- ----------------------------
DROP FUNCTION IF EXISTS `f_generate_uid`;
delimiter ;;
CREATE FUNCTION `chess`.`f_generate_uid`()
 RETURNS int(11)
BEGIN
	#********************** 程序说明开始 **********************
	# 生成用户uid
	# 返回生成的uid
	#**********************程序说明结束 **********************
	
	#**********************定义变量开始 **********************
	DECLARE v_uid INT DEFAULT 0;
	DECLARE v_count INT DEFAULT 0;
	DECLARE v_while_i INT DEFAULT 0;
	#**********************定义变量结束 **********************
	
	WHILE (v_uid = 0) DO
		SET v_uid = FLOOR(RAND() * (999998 - 100000) + 100000);
		SELECT count(*) INTO v_count FROM t_users WHERE uid = v_uid;
		
		IF (v_count = 0 
		    AND v_uid != 123456 
				AND v_uid != 234567 
				AND v_uid != 111111 
				AND v_uid != 222222 
				AND v_uid != 333333 
				AND v_uid != 444444
				AND v_uid != 555555
				AND v_uid != 666666
				AND v_uid != 777777
				AND v_uid != 888888
				AND v_uid != 999999) THEN
			RETURN v_uid;
		ELSE
		  SET v_uid = 0;
		END IF;
		
		# 最多循环10次，如果10次都无法循环到uid则跳出函数
		SET v_while_i = v_while_i+1;
		IF (v_while_i = 10) THEN 
		  RETURN 10010;
		END IF;
	END WHILE;
	RETURN v_uid;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_is_club_role
-- ----------------------------
DROP FUNCTION IF EXISTS `f_is_club_role`;
delimiter ;;
CREATE FUNCTION `chess`.`f_is_club_role`(`p_cid` int,`p_uid` int)
 RETURNS int(11)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 判断用户在俱乐部中的角色
	# 传入参数：
	#    p_cid          俱乐部id
	#    p_uid          玩家id
	# 返回结果大于0，在同一个俱乐部
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	DECLARE var_type INT DEFAULT -1;
	#**********************定义变量结束 **********************
	
	SELECT type INTO var_type FROM t_club_member WHERE cid = p_cid AND uid = p_uid;
	RETURN var_type;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_managerment_get_userinfo_json
-- ----------------------------
DROP FUNCTION IF EXISTS `f_managerment_get_userinfo_json`;
delimiter ;;
CREATE FUNCTION `chess`.`f_managerment_get_userinfo_json`(PARA_uid int)
 RETURNS varchar(4000) CHARSET utf8
begin   
	#传入一个UID数组，返回json格式的用户数据
	
	DECLARE VAR_uid INT default 0;
	DECLARE VAR_name VARCHAR(64) DEFAULT '';
	DECLARE VAR_headimg VARCHAR(256) DEFAULT '';
	DECLARE VAR_invite_code INT(8) DEFAULT 0;
	DECLARE VAR_receipt_code VARCHAR(255) DEFAULT '';
	DECLARE VAR_total_score INT(11) DEFAULT 0;
	DECLARE VAR_score INT(11) DEFAULT 0;
	declare RETURN_JSON VARCHAR(4000) DEFAULT '';
	#获取数据
	select 
		`uid`,
		`name`,
		`headimg`,
		`invite_code`,
		`receipt_code`,
		`total_score`,
		`score`
	into 	
		VAR_uid,
		VAR_name,
		VAR_headimg ,
		VAR_invite_code,
		VAR_receipt_code,
		VAR_total_score,
		VAR_score
	from `yfchess`.`t_users` where `uid`=PARA_uid;
	
	
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"uid":',VAR_uid,',');
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"name":"',VAR_name,'",');
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"headimg":"',VAR_headimg,'",');
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"invite_code":',VAR_invite_code,',');
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"receipt_code":"',VAR_receipt_code,'",');
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"total_score":',VAR_total_score,',');
	SET RETURN_JSON=CONCAT(RETURN_JSON,'"score":',VAR_score);
	set RETURN_JSON=concat('{',RETURN_JSON,'}');
	
	RETURN RETURN_JSON;
	
    END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_managerment_uids2headname
-- ----------------------------
DROP FUNCTION IF EXISTS `f_managerment_uids2headname`;
delimiter ;;
CREATE FUNCTION `chess`.`f_managerment_uids2headname`(uids json)
 RETURNS varchar(4000) CHARSET utf8
begin   
	#传入一个UID数组，返回一个数组携带对应用户的头像和名字
	
	DECLARE VAR_iUidLength INT DEFAULT 0;		#传入JSON结构体的长度
	DECLARE VAR_i INT DEFAULT 0;			#循环体内变量I
	DECLARE VAR_uid BIGINT DEFAULT 0;		#要操作的用户ID
	DECLARE VAR_headimg varchar(256);		#
	DECLARE VAR_name VARCHAR(128);			#
	declare RETURN_JSON VARCHAR(4000) default '';
	
	
	
	#获取传入JSON长度
	SELECT json_length(uids) INTO VAR_iUidLength; #获取对象长度
	IF(VAR_iUidLength=0) THEN 
		RETURN '{}';
	END IF;
	
	
	#循环处理
	SET VAR_i=0;
	
	WHILE VAR_i< VAR_iUidLength DO
			#获取UID
			SELECT 
			JSON_EXTRACT(jsonResult,CONCAT('$[',VAR_i,']'))
			INTO
			VAR_uid
			FROM 
			(SELECT uids AS jsonResult ) AS t;  #将传入的JSON作为虚表T 的jsonResult 列
			
			#根据UID查询headimg ,name
			select `headimg`,`name` into VAR_headimg,VAR_name from `yfchess`.`t_users` where uid=VAR_uid;
			
			#插入数据到返回结构
			set RETURN_JSON=concat(RETURN_JSON,'"',VAR_uid,'":{"name":"',VAR_name,'","headimg":"',VAR_headimg,'"},');
			
		SET VAR_i=VAR_i+1; 
		END WHILE;
	
	#去除最后一个‘，’并加上{}
	set RETURN_JSON=left(RETURN_JSON, length(RETURN_JSON)-1);
	set RETURN_JSON=concat('{',RETURN_JSON,'}');
	
	RETURN RETURN_JSON;
	
    END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_root_uid
-- ----------------------------
DROP FUNCTION IF EXISTS `f_root_uid`;
delimiter ;;
CREATE FUNCTION `chess`.`f_root_uid`(`p_uid` INT)
 RETURNS int(11)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回此uid的根节点
	# 传入参数：
	#    p_uid          uid
	# 返回所有上级代理，json格式
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	DECLARE v_pid INT;	      #运算过程中的当前用户ID
	DECLARE v_uid INT DEFAULT -1;	      #是否继续 （大于0继续）
	DECLARE i INT DEFAULT 0;	#防止意外最大操作50次
	DECLARE v_result INT DEFAULT 0;
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	SET v_uid = p_uid;      #第一个操作对象为传入的用户
	
	#查询出来的UID复制给iLoop，如果用户存在v_uid必定>0
	SELECT uid,invite_code INTO v_uid,v_pid  FROM `t_users` WHERE uid = v_uid;
	
	
	WHILE (v_uid > 0 && i < 50 ) DO
		
		SET v_uid=-1;  #查询到不存在的用户退出
		SET i=i+1;     #防止意外最大操作50次
		
		SELECT uid,invite_code INTO v_uid,v_pid FROM `t_users` WHERE uid = v_pid;
		
		IF(v_uid > 0) THEN
			SET v_result = v_uid;
		END IF;
	END WHILE;
	
	RETURN v_result;
    END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_same_club
-- ----------------------------
DROP FUNCTION IF EXISTS `f_same_club`;
delimiter ;;
CREATE FUNCTION `chess`.`f_same_club`(`p_luid` int,`p_ruid` int)
 RETURNS int(11)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 判断两个用户是否在同一个俱乐部
	# 传入参数：
	#    p_luid          账号
	#    p_ruid          账号
	# 返回结果大于0，在同一个俱乐部
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE var_count INT DEFAULT 0;
	#**********************定义变量结束 **********************
	
	
	IF(p_luid = p_ruid) THEN
		RETURN 1;
	END IF;
	
	SELECT count(1) INTO var_count from (SELECT cid from t_club_member WHERE uid = p_luid) AS m JOIN (SELECT cid from t_club_member WHERE uid = p_ruid) AS m2 ON m.cid = m2.cid;
	
	RETURN var_count;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_user_exists
-- ----------------------------
DROP FUNCTION IF EXISTS `f_user_exists`;
delimiter ;;
CREATE FUNCTION `chess`.`f_user_exists`(`p_account` varchar(256))
 RETURNS int(11)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 判断用户是否存在
	# 传入参数：
	#    p_account          账号
	# 返回创建用户的uid
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_uid INT DEFAULT 0;
	#**********************定义变量结束 **********************
	
	
	
	
	SELECT uid INTO v_uid FROM t_users WHERE account = p_account;
	RETURN v_uid;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_user_mult_parents
-- ----------------------------
DROP FUNCTION IF EXISTS `f_user_mult_parents`;
delimiter ;;
CREATE FUNCTION `chess`.`f_user_mult_parents`(`p_uids` json)
 RETURNS json
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 获取用户所有上级代理
	# 传入参数：
	#    p_uids          uid数组[123456, 123456]
	# 返回所有上级代理，json格式
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_length INT DEFAULT JSON_LENGTH(p_uids);
	DECLARE var_i INT DEFAULT 0;
	DECLARE var_uid INT DEFAULT 0;
	DECLARE var_keys VARCHAR(64) DEFAULT '';
	DECLARE var_parents json DEFAULT '[]';
	DECLARE var_result JSON DEFAULT "{}";
	#**********************定义变量结束 **********************
	
	
	
	
	#**********************执行逻辑开始 **********************
	WHILE (var_i < var_length) DO
		SET var_uid = JSON_EXTRACT(p_uids, CONCAT('$[', var_i, ']'));
		SET var_keys = CONCAT('$."', var_uid, '"');
		SET var_parents = f_user_single_parents(var_uid);
		
		
		SET var_result = JSON_SET(var_result, var_keys, var_parents);
		
		
		SET var_i = var_i + 1;
	END WHILE;
	RETURN var_result;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_user_parents
-- ----------------------------
DROP FUNCTION IF EXISTS `f_user_parents`;
delimiter ;;
CREATE FUNCTION `chess`.`f_user_parents`(`p_uid` INT)
 RETURNS json
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 获取用户所有上级代理，包含账户基本信息
	# 传入参数：
	#    p_uid          uid
	# 返回所有上级代理，json格式
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	DECLARE v_pid INT;	      #运算过程中的当前用户ID
	DECLARE v_uid INT DEFAULT -1;	      #是否继续 （大于0继续）
	DECLARE i INT DEFAULT 0;	#防止意外最大操作50次
	DECLARE json_index INT DEFAULT 0;
	DECLARE v_result JSON DEFAULT "[]";
	
	DECLARE v_headimg VARCHAR(512) DEFAULT '';
	DECLARE v_name    VARCHAR(128) DEFAULT '';
	DECLARE v_sex     INT          DEFAULT 0;
	DECLARE v_ratio     DECIMAL(5, 4)          DEFAULT 0.00;
	#**********************定义变量结束 **********************
	#**********************执行逻辑开始 **********************
	SET v_uid = p_uid;      #第一个操作对象为传入的用户
	
	#查询出来的UID复制给iLoop，如果用户存在v_uid必定>0
	SELECT uid,invite_code,headimg,`name`,sex INTO v_uid,v_pid,v_headimg,v_name, v_sex  FROM `t_users` WHERE uid = v_uid;
	
	
	WHILE (v_uid > 0 && i < 50 ) DO
		
		SET v_uid=-1;  #查询到不存在的用户退出
		SET i=i+1;     #防止意外最大操作50次
		
		SELECT uid,invite_code,headimg,`name`,sex, profit_ratio INTO v_uid,v_pid,v_headimg,v_name, v_sex, v_ratio FROM `t_users` WHERE uid = v_pid;
		
		IF(v_uid > 0) THEN
			SET v_result = JSON_INSERT(v_result, CONCAT('$[', json_index, ']'), 
				JSON_OBJECT("uid", v_uid, "name", v_name, "headimg", v_headimg, "sex", v_sex, "profitRatio", v_ratio));
			SET json_index = json_index + 1;
		END IF;
	END WHILE;
	
	RETURN v_result;
    END
;;
delimiter ;

-- ----------------------------
-- Function structure for f_user_single_parents
-- ----------------------------
DROP FUNCTION IF EXISTS `f_user_single_parents`;
delimiter ;;
CREATE FUNCTION `chess`.`f_user_single_parents`(`p_uid` int)
 RETURNS json
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 获取用户所有上级代理
	# 传入参数：
	#    p_uid          uid
	# 返回所有上级代理，json格式
	#**********************程序说明结束 **********************
	
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE v_pid INT;	      #运算过程中的当前用户ID
	DECLARE v_uid INT DEFAULT -1;	      #是否继续 （大于0继续）
	DECLARE v_ratio FLOAT(6, 4) DEFAULT 0;  # 分润比例
	DECLARE i INT DEFAULT 0;	#防止意外最大操作50次
	DECLARE json_index INT DEFAULT 0;
	DECLARE v_result JSON DEFAULT "[]";
	
	DECLARE v_root_uid INT DEFAULT -1;  # 根节点
	DECLARE v_is_root INT DEFAULT 0;    # 是否根节点
	#**********************定义变量结束 **********************
	
	
	
	
	
	#**********************执行逻辑开始 **********************
	SET v_uid = p_uid;      #第一个操作对象为传入的用户
	
	#查询出来的UID复制给iLoop，如果用户存在v_uid必定>0
	SELECT uid,invite_code,profit_ratio INTO v_uid,v_pid,v_ratio  FROM `t_users` WHERE uid = v_uid;
	
	
	WHILE (v_uid > 0 && i < 50 ) DO
		
		IF (v_ratio > 0) THEN
			SET v_result = JSON_INSERT(v_result, CONCAT('$[', json_index, ']'), JSON_ARRAY(v_uid, ROUND(v_ratio, 2)));
			SET json_index = json_index + 1;
			set v_is_root = 1;
		ELSE 
			SET v_root_uid = v_uid;
			set v_is_root = 0;
		END IF;
		
		
		SET v_uid=-1;  #查询到不存在的用户退出
		SET i=i+1;     #防止意外最大操作50次
		
		
		SELECT uid,invite_code,profit_ratio INTO v_uid,v_pid,v_ratio FROM `t_users` WHERE uid = v_pid;
		
		# 树根节点必为100 分润
		IF (v_uid <= 0) THEN 
			IF(v_is_root = 1) THEN
				SET v_result = JSON_REPLACE(v_result, CONCAT('$[', json_index - v_is_root, '][1]'), ROUND(1, 2));
			ELSE 
				SET v_result = JSON_INSERT(v_result, CONCAT('$[', json_index, ']'), JSON_ARRAY(v_root_uid, ROUND(1, 2)));
			END IF;
		END IF;
	END WHILE;
	
	RETURN v_result;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_change_permission
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_change_permission`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_change_permission`(IN `p_uid` int, 
	IN `p_withdraw_value` TINYINT, 
	IN `p_recharge_value` TINYINT,
	IN `p_dismissRoom_value` TINYINT,
	IN `p_manager_value` TINYINT,
	IN `p_dealer_value` TINYINT)
MAIN:BEGIN
  DECLARE v_count INT; 
	SELECT COUNT(1) INTO v_count FROM t_permission WHERE uid = p_uid;
	IF v_count > 0 THEN
			UPDATE t_permission 
			SET 
			withdraw = p_withdraw_value, 
			recharge = p_recharge_value, 
			dismissRoom = p_dismissRoom_value, 
			manager = p_manager_value, 
			dealer = p_dealer_value  
			WHERE  uid = p_uid LIMIT 1;
	ELSE
			INSERT INTO t_permission 
			SET 
			uid = p_uid, 
			withdraw = p_withdraw_value, 
			recharge = p_recharge_value, 
			dismissRoom = p_dismissRoom_value, 
			manager = p_manager_value, 
			dealer = p_dealer_value;
	END IF;
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_club_delete
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_club_delete`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_club_delete`(IN VAR_uid BIGINT,
	IN VAR_cid BIGINT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户删除俱乐部时调用
	#传入参数：用户ID，俱乐部ID
	#返回结果：1行2列 code[返回码],msg[返回消息]  code为0时代表数据库处理逻辑成功，否则客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	
	
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#判断该用户是否存在
	IF NOT EXISTS(SELECT 1 FROM `yfchess`.`t_users` WHERE uid=VAR_uid) THEN
		SELECT 5004 AS `code`, '用户不存在' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	#删除俱乐部
	DELETE FROM `yfchess`.`t_club` WHERE id=VAR_cid;
	
	#删除俱乐部成员
	DELETE FROM `yfchess`.`t_club_member` WHERE cid=VAR_cid;
	
	#删除俱乐部房间
	DELETE FROM `yfchess`.`t_club_rooms` WHERE cid=VAR_cid;	
	
	#输出消息
	SELECT 200 AS `code`, '删除成功！' AS `msg`;
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_delete_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_delete_user`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_delete_user`(IN `p_uid` int)
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_users SET account = CONCAT(account, '_', uid) WHERE  uid = p_uid LIMIT 1;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_profit_list
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_profit_list`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_profit_list`(IN p_page INT,
	IN p_pagesize INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 管理员查看profit列表
	# 传入参数：
  #    p_page          			页码
	#    p_pagesize           每页数量
	# 返回结果：结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	#分页相关
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	
	# 计算一共有多少条
	SELECT count(1) INTO v_count FROM t_profit WHERE total_profit > 0;
	SELECT 
		p.uid, 
		p.total_profit,
		p.today_profit,
		p.profit,
		p.withdraw_profit,
		u.lucky,
		u.`name`,
		u.sex,
		u.headimg,
		p_page AS page, 
		v_count AS count, 
		CEILING(v_count/p_pagesize) AS totalPage 
		FROM 
		t_profit AS p
		INNER JOIN
		t_users as u
		WHERE 
		p.total_profit > 0 AND u.uid = p.uid
		ORDER BY 
		p.total_profit DESC  
		LIMIT v_limit_start, p_pagesize;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_query_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_query_user`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_query_user`(IN p_uid INT(6))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 搜索用户信息
	# 传入参数：
	#    p_uid          用户uid
	# 返回用户信息
	#**********************程序说明结束 **********************
 
	#********************* 逻辑运行开始 **********************
IF p_uid > 99999 THEN
	SELECT 
	u.uid, 
	u.`name`,
	u.sex, 
	u.headimg, 
	u.profit_ratio, 
	u.invite_code, 
	u.total_inning, 
	u.lucky,
	u.robot,
	w.score,
	w.game_turnover,
	u.create_time,
	f_user_parents(p_uid) AS parents 
	FROM 
	t_users u 
	JOIN 
	t_wallet w 
	ON 
	u.uid = w.uid 
	WHERE u.uid = p_uid;
ELSE
	SELECT 
	u.uid, 
	u.`name`,
	u.sex, 
	u.headimg, 
	u.profit_ratio, 
	u.invite_code, 
	u.total_inning, 
	u.lucky,
	u.robot,
	w.score,
	w.game_turnover,
	u.create_time,
	f_user_parents(u.uid) AS parents 
	FROM 
	t_users u 
	JOIN 
	t_wallet w 
	ON 
	u.uid = w.uid 
	WHERE w.score < 0
	ORDER BY u.create_time DESC LIMIT 1;
END IF;

	 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_reset_user_inning
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_reset_user_inning`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_reset_user_inning`()
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_users SET total_inning = 0, last_inning = 0;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_re_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_re_user`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_re_user`(IN `p_uid` int)
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_users SET account = REPLACE(account, CONCAT('_', uid), '') WHERE  uid = p_uid LIMIT 1;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_set_notice
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_set_notice`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_set_notice`(IN `p_msg` LONGTEXT)
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_notice SET msg = p_msg WHERE `status` = 1;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_set_user_lucky
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_set_user_lucky`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_set_user_lucky`(IN `p_uid` INT(10), IN `p_lucky` INT(10))
MAIN:BEGIN
	#更改幸运值
	UPDATE t_users SET `lucky` = p_lucky WHERE  `uid` = p_uid LIMIT 1;
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_set_user_robot
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_set_user_robot`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_set_user_robot`(IN `p_uid` INT(10), IN `p_robot` INT(10))
MAIN:BEGIN
	#更改幸运值
	UPDATE t_users SET `robot` = p_robot WHERE  `uid` = p_uid LIMIT 1;
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_total_scores
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_total_scores`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_total_scores`(IN p_sort INT,
	IN p_page INT,
	IN p_pagesize INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 管理员查看用户充值记录
	# 传入参数：
	#    p_sort               排序
  #    p_page          			页码
	#    p_pagesize           每页数量
	# 返回结果：结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	#分页相关
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	
	# 计算一共有多少条
	SELECT count(1) INTO v_count FROM t_wallet;

	IF p_sort = 2 THEN
		SELECT 
		w.uid, 
		w.game_turnover,
		w.score,
		u.lucky,
		u.`name`,
		u.sex,
		u.headimg,
		u.total_inning,
		p_page AS page, 
		v_count AS count, 
		CEILING(v_count/p_pagesize) AS totalPage 
		FROM 
		t_wallet AS w
		INNER JOIN
		t_users as u
		WHERE 
		u.uid = w.uid AND w.score < 0
		ORDER BY 
		w.score DESC  
		LIMIT v_limit_start, p_pagesize;
	ELSEIF p_sort = 1 THEN
		SELECT 
		w.uid, 
		w.game_turnover,
		w.score,
		u.lucky,
		u.`name`,
		u.sex,
		u.headimg,
		u.total_inning,
		p_page AS page, 
		v_count AS count, 
		CEILING(v_count/p_pagesize) AS totalPage 
		FROM 
		t_wallet AS w
		INNER JOIN
		t_users as u
		WHERE 
		u.uid = w.uid
		ORDER BY 
		w.game_turnover DESC  
		LIMIT v_limit_start, p_pagesize;
	ELSE
		SELECT 
		w.uid, 
		w.game_turnover,
		w.score,
		u.lucky,
		u.`name`,
		u.sex,
		u.headimg,
		u.total_inning,
		p_page AS page, 
		v_count AS count, 
		CEILING(v_count/p_pagesize) AS totalPage 
		FROM 
		t_wallet AS w
		INNER JOIN
		t_users as u
		WHERE 
		u.uid = w.uid
		ORDER BY 
		w.game_turnover ASC  
		LIMIT v_limit_start, p_pagesize;
	END IF;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_update_config
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_update_config`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_update_config`(IN `p_key` VARCHAR(255), IN `p_value` FLOAT, IN `p_content` VARCHAR(255))
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_config SET `content` = p_content, `value` = p_value WHERE `key` = p_key;
	IF p_key = 'invite_url' THEN
		UPDATE t_version SET downloadUrl = p_content;
	END IF;
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_update_user_account
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_update_user_account`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_update_user_account`(IN `p_uid` INT, in `p_account` VARCHAR(64))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 更改用户账号
	# 传入参数：
	#    p_uid          用户uid
	#    p_account      更改账号
	# 返回用户信息
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	#分页相关
	DECLARE v_count INT DEFAULT  0;      # 总记录数
	#**********************定义变量结束 **********************	
	SELECT COUNT(1) INTO v_count FROM t_users WHERE account = p_account;
	IF v_count > 0 THEN
			SELECT 80001 AS `code`, '账号已存在' AS `msg`;
			LEAVE MAIN;
	END IF;
	UPDATE t_users SET account = p_account WHERE  uid = p_uid LIMIT 1;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_update_user_inning
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_update_user_inning`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_update_user_inning`(IN `p_uid` INT(10), IN `p_inning` INT(10))
MAIN:BEGIN
	#更改幸运值
	UPDATE t_users SET total_inning = p_inning WHERE  `uid` = p_uid LIMIT 1;
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_update_user_name_headimg
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_update_user_name_headimg`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_update_user_name_headimg`(IN `p_uid` INT, IN `p_name` VARCHAR(256), IN `p_headimg` VARCHAR(256))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 更改用户名字和头像
	# 传入参数：
	#    p_uid          用户uid
	#    p_name      		名字
	#    p_headimg      头像地址
	# 返回用户信息
	#**********************程序说明结束 **********************
	UPDATE t_users SET `name` = p_name, `headimg` = p_headimg WHERE  uid = p_uid LIMIT 1;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_user_addscore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_user_addscore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_user_addscore`(IN `p_uid` int, IN `p_admin_uid` INT, IN `p_score` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部管理员给玩家充值
	# 传入参数：
	#    p_uid         用户ID
	#    p_admin_uid   充值管理员
	#    p_score       充值道具ID
	# 返回结果：code， msg  200成功，其它错误
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_order_sn     VARCHAR(32)   DEFAULT '';        #本地订单号
	#**********************定义变量结束 **********************
	
	
	
	#****************** 变量赋值 ***************************
	# 生成订单号
	SET var_order_sn = CONCAT('30', DATE_FORMAT(NOW(),'%Y%m%d%k%i%s'), CAST(FLOOR(RAND() * 899999 + 100000) AS UNSIGNED));
	
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 5004 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	# 开始事务
	START TRANSACTION;
		# 插入订单
		INSERT INTO t_orders SET 
			order_sn = var_order_sn,
			uid = p_uid,
			operator_uid = p_admin_uid,
			agent_id = 'manual_recharge',
			pay_channel = 30,
			buy_number = p_score,
			pay_money = (p_score/10000),
			goods_name = "",
			remark = "";  
		
		UPDATE t_wallet SET score = score + p_score, recharge = recharge + p_score WHERE uid = p_uid LIMIT 1;
		
		IF (ROW_COUNT() = 0) THEN
			ROLLBACK;
			SELECT 5005 AS `code`, "上分失败" AS `msg`;
			LEAVE MAIN;
		END IF;
		
		UPDATE t_orders SET pay_status = 1 WHERE order_sn = var_order_sn;
	COMMIT;
	
	SELECT 200 AS `code`, (SELECT score FROM t_wallet WHERE uid = p_uid) AS score;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_user_decreasescore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_user_decreasescore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_user_decreasescore`(IN `p_uid` int, IN `p_admin_uid` INT, IN `p_score` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部管理员给玩家扣分
	# 传入参数：
	#    p_uid         用户ID
	#    p_admin_uid   管理员
	#    p_score       扣除分数
	# 返回结果：code， msg  200成功，其它错误
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_order_sn     VARCHAR(32)   DEFAULT CONCAT('002', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), FLOOR((1000000 + RAND() * 9000000)));        #本地订单号
	DECLARE v_surplus_score BIGINT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1 _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	#****************** 变量赋值 ***************************
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 5004 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	# 开始事务
	START TRANSACTION;
		#删除玩家的分数
		UPDATE 
			t_wallet 
		SET 
			score = score - p_score, 
			withdrawal = withdrawal + p_score 
		WHERE 
			uid = `p_uid` and score >= p_score LIMIT 1;
		
		# 查出剩余分数
		SELECT score INTO v_surplus_score FROM t_wallet WHERE uid = p_uid;
		
		IF (ROW_COUNT() > 0) THEN
			#插入提现订单
			INSERT INTO t_withdraw_order 
			SET 
				uid = p_uid, 
				score=p_score, 
				poundage = 0, 
				order_sn = var_order_sn, 
				`status` = 1,
				surplus_score = v_surplus_score,
				type = 1;
			
			#发生错误，则返回错误代码与错误信息
			IF (_ERROR != 0) THEN
				ROLLBACK;
				SELECT _ERROR AS `code`, _SQLSTATE AS `sqlstate`, _ERROR_MSG AS `msg`;
				LEAVE MAIN; 
			END IF;
			# 如果成功，则返回成功后的分数
			SELECT 200 AS `code`, p_uid AS uid, LAST_INSERT_ID() AS insertId, v_surplus_score AS score;
		ELSE
			SELECT 10035 AS `code`, p_uid AS uid, (SELECT score FROM t_wallet WHERE uid = p_uid) AS score;
			ROLLBACK;
			LEAVE MAIN;
		END IF;
	COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_admin_user_sealUp
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_admin_user_sealUp`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_admin_user_sealUp`(IN `p_uid` int, IN `p_sealUp` TINYINT)
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_users SET sealUp = p_sealUp WHERE  uid = p_uid LIMIT 1;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_bind_wechat
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_bind_wechat`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_bind_wechat`(IN `p_uid` int(11), 
	IN `p_name` VARCHAR(64),
	IN `p_openid` VARCHAR(64))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 绑定微信出款号
	# 传入参数：
	#    p_uid            玩家UID
	#    p_name           微信实名
	#    p_openid         微信openid
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_score INT DEFAULT 0;
	DECLARE var_uid INT DEFAULT 0;
	DECLARE var_count INT DEFAULT 0;
	
	#过程变量（容错）
	DECLARE _ERROR INTEGER DEFAULT 0;    
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET _ERROR=1; 
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	
	#执行事务
	START TRANSACTION;
		SELECT count(*) INTO var_count FROM t_wechat WHERE openid = p_openid AND uid = p_uid;
		IF (var_count = 0) THEN
			# 如果不存在，则先把其它绑定的微信设置为备用，然后插入新微信
			UPDATE t_wechat SET status = 0 WHERE uid = p_uid;
			INSERT INTO t_wechat(uid,name,openid,status) VALUES(p_uid, p_name, p_openid, 1);
		ELSE
			# 如果存在，则更新状态
			UPDATE t_wechat SET status = 0 WHERE uid = p_uid;
			UPDATE t_wechat SET status = 1, isdel = 0 WHERE openid = p_openid;
		END IF;
		
		#判断错误
		IF(_ERROR=1) THEN
			#回滚事务
			ROLLBACK;
			
			#输出信息
			SELECT 1001 AS `code`, '绑定代理失败' AS `msg`;
			LEAVE MAIN;
		END IF;
  COMMIT;
	
	#输出信息
	SELECT 200 AS `code`, '绑定成功！' AS `msg`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_buy_completed
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_buy_completed`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_buy_completed`(IN `p_ordersn` VARCHAR(125), 
	IN `p_pay_ordersn` VARCHAR(125))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 玩家购买道具成功
	# 传入参数：
	#    p_ordersn         本地订单号
	#    p_pay_ordersn      支付平台订单号
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_score INT DEFAULT 0;
	DECLARE var_uid INT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1
        _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	# 给变量赋值
	SELECT buy_number, uid INTO var_score,var_uid FROM t_orders WHERE order_sn = p_ordersn AND pay_status=0;
	
	#判断是否找到订单
	IF(var_score = 0) THEN
		SELECT '5023' code, '没有找到订单' msg;
		LEAVE MAIN;
	END IF;
	#执行事务
	START TRANSACTION;
		# 修改订单信息
		UPDATe t_orders SET transaction_id = p_pay_ordersn, pay_time = NOW(), pay_status = pay_status + 1 WHERE order_sn = p_ordersn AND pay_status = 0;
		# 增加玩家积分
		UPDATE t_wallet SET score = score + var_score, recharge = recharge + var_score  WHERE uid = var_uid;
		
		#判断错误
		IF(_ERROR=1) THEN
			#回滚事务
			ROLLBACK;
			
			#输出信息
			SELECT _ERROR AS `code`, _ERROR_MSG AS `msg`;
			LEAVE MAIN;
		END IF;
	COMMIT;
	
	#输出信息
	SELECT 200 AS `code`, '操作成功！' AS `msg`, var_score AS score, var_uid AS uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_blacklist
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_blacklist`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_blacklist`(IN p_cid INT,
	IN p_uid INT,
	IN p_admin_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 玩家加入的所有俱乐部
	# 传入参数：
	#    p_cid          俱乐部信息
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#DECLARE v_is_admin BIGINT DEFAULT  0;              # 总记录数
	#**********************定义变量结束 **********************
	
	
	#********************* 逻辑运行开始 **********************
	
	IF (f_is_club_role(p_cid, p_admin_uid) > 0) THEN
		UPDATE t_club_member SET `blacklist` = IF(blacklist = 0, 1, 0) WHERE uid = p_uid AND cid = p_cid;
		SELECT 200 AS `code`, '设置成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`, (SELECT blacklist FROM t_club_member WHERE uid = p_uid AND cid = p_cid) AS blacklist;
	ELSE 
		SELECT 10017 AS `code`, '不是管理员' AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_change_private_room
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_change_private_room`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_change_private_room`(IN p_prid INT,
	IN p_admin_uid INT,
	iN p_rule json)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 修改俱乐部包间
	# 传入参数：
	#    p_prid          包间id
	#    p_admin_uid          管理员uid
	#    p_rule          包间规则
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_is_admin BIGINT;            # 是否管理员
	DECLARE v_cid INT DEFAULT 0;                    # 俱乐部id
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT cid INTO v_cid FROM t_club_rooms WHERE id = p_prid;
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = v_cid AND uid = p_admin_uid AND type > 0;
	
	IF (v_cid = 0) THEN
		SELECT 10015 AS `code`, '包间不存在' AS `msg`; 
		LEAVE MAIN;
	END IF;
	
	IF (v_is_admin > 0) THEN
		UPDATE t_club_rooms SET `content` = p_rule WHERE id = p_prid;
		SELECT 200 AS `code`, '修改成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`;
	ELSE 
		SELECT 10017 AS `code`, '不是管理员' AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_change_pr_name
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_change_pr_name`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_change_pr_name`(IN p_uid INT,
	IN p_prid INT,
	IN p_name VARCHAR(256))
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#程序说明:修改包间名字
	#传入参数：
	#  p_uid     管理员id
	#  p_prid    包间id
	#  p_name    包间名字
	#返回结果：code, msg, changeRow, effectedRow
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_is_admin BIGINT;            # 是否管理员
	DECLARE v_cid INT DEFAULT 0;                    # 俱乐部id
	#**********************定义变量结束 **********************
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT cid INTO v_cid FROM t_club_rooms WHERE id = p_prid;
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = v_cid AND uid = p_uid AND type > 0;
	
	IF (v_cid = 0) THEN
		SELECT 10015 AS `code`, '包间不存在' AS `msg`; 
		LEAVE MAIN;
	END IF;
	
	IF (v_is_admin > 0) THEN
		UPDATE t_club_rooms SET `name` = p_name WHERE id = p_prid;
		SELECT 200 AS `code`, '修改成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`;
	ELSE 
		SELECT 10017 AS `code`, '不是管理员' AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_create
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_create`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_create`(IN VAR_uid BIGINT,
	IN VAR_cname VARCHAR(32))
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户创建俱乐部时调用
	#传入参数：用户ID，俱乐部名称
	#返回结果：1行3列 code[返回码],msg[返回消息],clubid[返回数据]   code为0时代表数据库处理逻辑成功，否则客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE VAR_clubID INT DEFAULT 0; #俱乐部ID
	DECLARE VAR_clubMaxLimit INT DEFAULT 5;	#最多允许加入几个俱乐部
	DECLARE VAR_clubJoinCount INT DEFAULT 100;	#已经加入了几个俱乐部
	
	
	#初始化变量
	SET VAR_clubMaxLimit=50;
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#判断该用户是否存在
	IF NOT EXISTS(SELECT 1 FROM `t_users` WHERE uid=VAR_uid) THEN
		SELECT 5004 AS `code`, '玩家不存在' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	#判断创建者已经加入了俱乐部的个数
	SELECT COUNT(DISTINCT(cid)) INTO VAR_clubJoinCount FROM`t_club_member`  WHERE uid=VAR_uid;
	IF(VAR_clubJoinCount>=VAR_clubMaxLimit) THEN
		SELECT 10016 AS `code`, CONCAT('最多允许创建或加入',VAR_clubMaxLimit,'个俱乐部！') AS `msg`;
		LEAVE  MAIN;
	END IF;
	
	
	#生成7位随机数作为俱乐部ID的循环体
	CREATE_RAND:LOOP
	SET VAR_clubID=CEILING(RAND()*9000000+1000000);
	
		#如果是未被占用的clubID，退出循环体
		IF NOT EXISTS(SELECT 1 FROM `t_club` WHERE id=VAR_clubID) THEN
			LEAVE CREATE_RAND;  #退出循环体
		ELSE
			ITERATE CREATE_RAND; #重复循环体
		END IF;
	END LOOP;
	
	
	#插入俱乐部表
	INSERT INTO `t_club`(
		`id`,
		`name`,
		`creator`
	)VALUES( 
		VAR_clubID,
		VAR_cname,
		VAR_uid
	);	
		
	
	#加入成员到俱乐部
	INSERT INTO `t_club_member`(
		`cid`,
		`uid`,
		`type`,
		`blacklist`,
		`create_time`
	)
	SELECT 
		VAR_clubID,
		a.uid,
		0,
		0,
		NOW()
	FROM `t_users` AS a 
	WHERE (a.invite_code=VAR_uid OR a.uid=VAR_uid)  #自己或者自己的直属下线
	AND NOT EXISTS(
		SELECT 1 FROM (SELECT uid, COUNT(1) AS clubcount FROM `t_club_member`  GROUP BY uid HAVING  clubcount >= VAR_clubMaxLimit) AS b 
		WHERE a.uid=b.uid
	)#排除加入俱乐部数量大于5的
	AND NOT EXISTS(
		SELECT 1 FROM `t_club_member` AS c WHERE c.uid=a.uid AND c.cid=VAR_clubID  #排除已经加入该俱乐部的成员
	);
	
	
	#修改当前用户为创建者
	UPDATE `t_club_member` SET `type`=2 WHERE cid=VAR_clubID AND uid=VAR_uid;
		
	
	
	
	
	#输出消息
	SELECT 200 AS `code`, '创建成功！' AS `msg`,VAR_clubID AS `clubid`;
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_create_private_room
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_create_private_room`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_create_private_room`(IN `p_cid` int,
	IN `p_uid` int,
	IN `p_name` varchar(128),
	IN `p_rule` json)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#程序说明:创建包间规则
	#传入参数：
	#  p_cid    俱乐部id
	#  p_uid    管理员uid
	#返回结果：创建成功的包间id
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE v_is_admin BIGINT;            # 是否管理员
	#**********************定义变量结束 **********************
	#********************* 逻辑运行开始 **********************
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = p_cid AND uid = p_uid AND type > 0;
	
	IF (v_is_admin > 0) THEN
		INSERT INTO t_club_rooms(cid, `name`, content, weight) VALUES(p_cid, p_name, p_rule, UNIX_TIMESTAMP(now()));
		SELECT 200 AS `code`, '创建成功' AS `msg`, LAST_INSERT_ID() AS `insertId`;
	ELSE 
		SELECT 10017 AS `code`, '不是管理员' AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_dealerAlreadyWithdraw
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_dealerAlreadyWithdraw`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_dealerAlreadyWithdraw`(IN p_admin_uid INT,
	IN p_order_sn VARCHAR(32),
	IN p_status TINYINT,
  IN p_payment_no VARCHAR(64),
	IN p_partner_trade_no VARCHAR(64))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回处理下分结果
	# 传入参数：
  #    p_admin_uid    用户id,需判断用户是否有权限操作
	#    p_status				订单状态
	#    p_order_sn     订单号
	#    p_payment_no   微信单号
	#    p_partner_trade_no   微信商户号
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_uid INT DEFAULT 0;            # 下分玩家ID
	DECLARE v_cid INT DEFAULT 0;            # 下分玩家俱乐部ID
	#**********************定义变量结束 **********************
	
	#订单是否存在
	SELECT uid INTO v_uid FROM t_withdraw_dealer WHERE order_sn = p_order_sn AND `status` = 0;
	IF(v_uid = 0) THEN
		SELECT 5023 code, '订单不存在或者已经处理' msg;
		LEAVE MAIN;
	END IF;
	#********************* 逻辑运行开始 **********************
	UPDATE t_withdraw_dealer SET
	`status` = p_status,
	payment_no = p_payment_no,
	partner_trade_no = p_partner_trade_no
	WHERE order_sn = p_order_sn;
	
	SELECT 200 AS `code`;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_dealerWithdrawList
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_dealerWithdrawList`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_dealerWithdrawList`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_status TINYINT,
	IN p_search_uid INT,
  IN p_page INT,
	IN p_pagesize INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回俱乐部玩家下分列表结果集
	# 传入参数：
	#    p_cid          俱乐部id
  #    p_admin_uid    用户id,需判断用户是否有权限操作
	#    p_status				订单状态
	#    p_page         返回第几页数据
	#    p_pagesize     每页数量
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_total_page BIGINT;            # 共多少页
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	#********************* 逻辑运行开始 **********************
	
	#初始化变量
	IF (p_search_uid > 0) THEN
		SELECT count(1) INTO v_count FROM t_withdraw_dealer WHERE `status` = p_status AND uid = p_search_uid AND type < 2;
	ELSE 
		SELECT count(1) INTO v_count FROM t_withdraw_dealer WHERE `status` = p_status AND type < 2;
	END IF;
	SET v_limit_start = (p_page - 1) * p_pagesize;
	SET v_total_page = CEILING(v_count / p_pagesize);
	
	#以下逻辑正在等待优化----------
	IF (p_search_uid > 0) THEN
		SELECT 
				`user`.`name`,
				`user`.sex,
				`user`.headimg,
				`order`.cid,
				`order`.order_sn,
				`order`.payment_no,
				`order`.uid,
				`order`.create_time,
				`order`.score,
				`order`.`status`,
				`order`.`id` AS order_id,
				v_total_page AS totalPage,
				v_count AS count
		FROM				t_withdraw_dealer AS `order`
		INNER JOIN  t_users AS `user`
		ON          `user`.uid = `order`.uid
		WHERE				`order`.`status` = p_status AND `order`.type < 2 AND `order`.uid = p_search_uid
		ORDER BY 		`order`.create_time DESC
		LIMIT v_limit_start, p_pagesize;
	ELSE
		SELECT 
				`user`.`name`,
				`user`.sex,
				`user`.headimg,
				`order`.cid,
				`order`.order_sn,
				`order`.payment_no,
				`order`.uid,
				`order`.create_time,
				`order`.score,
				`order`.`status`,
				`order`.`id` AS order_id,
				v_total_page AS totalPage,
				v_count AS count
		FROM				t_withdraw_dealer AS `order`
		INNER JOIN  t_users AS `user`
		ON          `user`.uid = `order`.uid
		WHERE				`order`.`status` = p_status AND `order`.type < 2
		ORDER BY 		`order`.create_time DESC
		LIMIT v_limit_start, p_pagesize;
	END IF;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_delete
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_delete`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_delete`(IN VAR_uid BIGINT,
	IN VAR_cid BIGINT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户删除俱乐部时调用
	#传入参数：用户ID，俱乐部ID
	#返回结果：1行2列 code[返回码],msg[返回消息]  code为0时代表数据库处理逻辑成功，否则客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	
	
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#判断该用户是否存在
	IF NOT EXISTS(SELECT 1 FROM `yfchess`.`t_users` WHERE uid=VAR_uid) THEN
		SELECT 5004 AS `code`, '用户不存在' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	#判断该用户是否拥有该俱乐部
	IF NOT EXISTS(SELECT 1 FROM `yfchess`.`t_club` WHERE id=VAR_cid AND creator=VAR_uid) THEN
		SELECT 10018 AS `code`, '您没有创建过此俱乐部！' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	#删除俱乐部
	DELETE FROM `yfchess`.`t_club` WHERE id=VAR_cid AND creator=VAR_uid;
	
	#删除俱乐部成员
	DELETE FROM `yfchess`.`t_club_member` WHERE cid=VAR_cid;	
	
	#删除俱乐部房间
	DELETE FROM `yfchess`.`t_club_rooms` WHERE cid=VAR_cid;	
	
	#输出消息
	SELECT 200 AS `code`, '删除成功！' AS `msg`;
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_del_private_room
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_del_private_room`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_del_private_room`(IN p_prid INT,
	IN p_admin_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 删除俱乐部包间
	# 传入参数：
	#    p_prid          包间id
	#    p_admin_uid          管理员uid
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_is_admin BIGINT;            # 是否管理员
	DECLARE v_cid INT DEFAULT 0;                    # 俱乐部id
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT cid INTO v_cid FROM t_club_rooms WHERE id = p_prid;
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = v_cid AND uid = p_admin_uid AND type > 0;
	
	IF (v_cid = 0) THEN
		SELECT 10015 AS `code`, '包间不存在' AS `msg`; 
		LEAVE MAIN;
	END IF;
	
	IF (v_is_admin > 0) THEN
		DELETE FROM t_club_rooms WHERE id = p_prid;
		SELECT 200 AS `code`, '删除成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`;
	ELSE 
		SELECT 10017 AS `code`, '不是管理员' AS `msg`, v_cid, v_is_admin;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_exit
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_exit`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_exit`(IN VAR_uid BIGINT,
	IN VAR_cid BIGINT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户退出俱乐部时调用
	#传入参数：用户ID，俱乐部ID
	#返回结果：1行2列 code[返回码],msg[返回消息]  code为0时代表数据库处理逻辑成功，否则客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	
	
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#判断该用户是否存在
	IF NOT EXISTS(SELECT 1 FROM `yfchess`.`t_users` WHERE uid=VAR_uid) THEN
		SELECT 5004 AS `code`, '用户不存在' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	
	#删除俱乐成员记录
	DELETE FROM `yfchess`.`t_club_member` WHERE cid=VAR_cid AND uid=VAR_uid;	
	
	
	
	#输出消息
	SELECT 200 AS `code`, '退出成功！' AS `msg`;
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_give_history
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_give_history`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_give_history`(IN p_uid INT,
	IN p_page INT,
	IN p_pagesize INT,
	IN `p_starttime` BIGINT,
	IN `p_endtime` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 管理员查看用户充值记录
	# 传入参数：
	#    p_cid                俱乐部id
  #    p_admin_uid          管理员uid
	#    p_uid                玩家uid
	#    p_page               页数
	#    p_pagesize               每页数量
	#    p_starttime               开始时间
	#    p_endtime               结束时间
	# 返回结果：结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE v_start_time BIGINT DEFAULT (IF((p_starttime) = 0, UNIX_TIMESTAMP(DATE_SUB(NOW(),INTERVAL 30 DAY)), p_starttime));  #开始时间
	DECLARE v_end_time BIGINT DEFAULT (IF((p_endtime) = 0, UNIX_TIMESTAMP(NOW()), p_endtime));      #结束时间
	
	#分页相关
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	
	# 计算一共有多少条
	SELECT count(1) INTO v_count FROM t_givescore WHERE (give_uid = p_uid OR accept_uid = p_uid) AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time;
	
	IF (v_count = 0) THEN
		SELECT * FROM t_orders LIMIT 0;
		LEAVE MAIN;
	END IF;
	
	SELECT 
		g.*, 
		p_page AS page, 
		v_count AS count, 
		CEILING(v_count/p_pagesize) AS totalPage 
		FROM 
		t_givescore AS g
		WHERE 
		(g.give_uid = p_uid OR g.accept_uid = p_uid) 
		AND 
		UNIX_TIMESTAMP(g.create_time) >= v_start_time 
		AND 
		UNIX_TIMESTAMP(g.create_time) <= v_end_time 
		ORDER BY 
		g.create_time DESC  
		LIMIT v_limit_start, p_pagesize;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_give_score
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_give_score`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_give_score`(IN p_i_uid INT,
	IN p_s_uid INT,
	IN p_score BIGINT,
	IN p_cid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部赠送分数,两个玩家必须在同一个俱乐部
	# 传入参数：
	#    p_i_uid          我的uid
	#    p_s_uid          对方uid
	#    p_score          分数
	# 返回用户信息
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_count INT DEFAULT 0;            # 两个用户是否在同一个俱乐部
	DECLARE var_min_give BIGINT DEFAULT 0;         # 最小赠送分数
	
	# 过程变量（容错）
	DECLARE _ERROR INTEGER DEFAULT 0;    
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
			GET DIAGNOSTICS CONDITION 1
        _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
		END;
	#**********************定义变量结束 **********************
	
	
	
	#********************* 逻辑运行开始 **********************
	# 判断赠送分数是否低于最小赠送分
	SELECT `value` INTO var_min_give FROM t_config WHERE `key` = 'min_givescore';
	IF (var_min_give > p_score) THEN 
		SELECT 5017 AS `code`, CONCAT('最少', var_min_give, '分') AS `msg`;
		LEAVE MAIN;
	END IF;
	
	IF (p_uid = p_admin_uid) THEN
		SELECT 5021 AS `code`, '不能赠送给自己' AS `msg`;
	END IF;
	
	
	# 判断是否同一俱乐部成员
	IF(f_same_club(p_uid, p_admin_uid) = 0) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	
	# 开始事务
	START TRANSACTION;
		UPDATE t_wallet w1 JOIN t_wallet w2 ON (w1.uid = p_i_uid AND w2.uid = p_s_uid) 
		SET 
			w1.score = w1.score - p_score, 
			w1.give = w1.give - p_score,	
			w2.score = w2.score + p_score,
			w2.give = w2.give + p_score 
		WHERE w1.score >= p_score;
		
		IF(ROW_COUNT() < 2)THEN
			ROLLBACK;
			
			SELECT 10035 AS `code`, '分数不足' AS `msg`;
			LEAVE MAIN;
		END IF;
		
		# 增加一条赠送记录
		INSERT t_givescore(give_uid, accept_uid, score) VALUES(p_i_uid, p_s_uid, p_score);
		
	COMMIT;
	
	SELECT 200 AS `code`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_info
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_info`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_info`(IN p_cid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 玩家加入的所有俱乐部
	# 传入参数：
	#    p_cid          俱乐部信息
	# 结果集
	#**********************程序说明结束 **********************
	
	#********************* 逻辑运行开始 **********************
	SELECT 
		c.`id`,
    c.`name` AS clubName,
		c.creator,
		c.create_time,
		c.`status`,
		c.mcount,
		u.`name` AS userName,
		u.`sex`,
		u.headimg
  FROM         t_club c 
	INNER JOIN   t_users u 
	ON c.creator = u.uid 
	WHERE c.id = p_cid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_join
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_join`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_join`(IN VAR_uid BIGINT,
	IN VAR_cid BIGINT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户加入俱乐部时调用
	#传入参数：用户ID，俱乐部ID
	#返回结果：1行2列 code[返回码],msg[返回消息]   code为0时代表数据库处理逻辑成功，否则客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE VAR_clubMaxLimit INT DEFAULT 5;	#最多允许加入几个俱乐部
	DECLARE VAR_clubJoinCount INT DEFAULT 100;	#已经加入了几个俱乐部
	DECLARE VAR_clubJoinType SMALLINT DEFAULT 0;	#加入俱乐部是否需要审核
	DECLARE VAR_clubid BIGINT DEFAULT -1;	#目标俱乐部ID
	DECLARE VAR_db_pid BIGINT DEFAULT -1;	#数据库中父级的UID
	DECLARE VAR_db_uid BIGINT DEFAULT -1;	#数据库中自己的UID
	
	#初始化变量
	SET VAR_clubMaxLimit=5;
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#用户表变量赋值
	SELECT `uid`,`invite_code` INTO VAR_db_uid,VAR_db_pid FROM `yfchess`.`t_users` WHERE uid=VAR_uid;
	
	#判断该用户是否存在
	IF (VAR_db_uid<0) THEN
		SELECT 5004 AS `code`, '用户不存在' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	#判断是否绑定了父级
	IF (VAR_db_pid<=0) THEN
		SELECT 20002 AS `code`, '未绑定代理' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	#判断该用户已经加入了俱乐部的个数
	SELECT COUNT(DISTINCT(cid)) INTO VAR_clubJoinCount FROM `yfchess`.`t_club_member`  WHERE uid=VAR_uid;
	IF(VAR_clubJoinCount>=VAR_clubMaxLimit) THEN
		SELECT 10016 AS `code`, CONCAT('最多允许加入',VAR_clubMaxLimit,'个俱乐部！') AS `msg`;
		LEAVE  MAIN;
	END IF;
	
	
	#获取目标俱乐部参数
	SELECT `join_type`,`id` INTO VAR_clubJoinType,VAR_clubid FROM `yfchess`.`t_club` WHERE id=VAR_cid;
	
	#判断目标俱乐部是否存在
	IF (VAR_clubid<0) THEN
		SELECT 10019 AS `code`, '该俱乐部不存在' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	#判断是否已经加入俱乐部
	IF EXISTS(SELECT 1 FROM `yfchess`.`t_club_member` WHERE `cid`=VAR_cid AND `uid`=VAR_uid) THEN
		SELECT 10020 AS `code`, '您已经是该俱乐部成员！' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	#判断是否有未处理的申请
	IF EXISTS(SELECT 1 FROM `yfchess`.`t_club_msg` WHERE `cid`=VAR_cid AND `uid`=VAR_uid AND `type`=1 AND `status`=0 ) THEN
		SELECT 10021 AS `code`, '您已经申请过加入该俱乐部,请耐心等待群主审核！' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	
	
	#获取加入该俱乐部的方式，允许直接加入还是需要审核
	IF(VAR_clubJoinType=1) THEN  #无需审核
		#写入俱乐部成员信息
		INSERT INTO `yfchess`.`t_club_member`(
			`cid`,
			`uid`,
			`type`,
			`blacklist`,
			`create_time`,
			`score`,
			`commission`,
			`current_cid`
		)
		VALUES( 
			VAR_cid,
			VAR_uid,
			0,
			0,
			NOW(),
			0,
			0,
			VAR_cid
		);
		
		
		#输出消息
		SELECT 200 AS `code`, '加入成功！' AS `msg`;
		LEAVE MAIN;
	
	ELSE #需要审核
		#写入申请记录
		INSERT INTO `yfchess`.`t_club_msg`(
			`cid`,
			`uid`,
			`type`,
			`create_time`,
			`content`,
			`status`	
		)
		VALUES
		(
			VAR_cid,
			VAR_uid,
			1,
			NOW(),
			'{}',
			0	
		);
		
		#输出消息
		SELECT 200 AS `code`, '申请成功，请等待群主审核！' AS `msg`;
		LEAVE MAIN;
		
	END IF;
	
	
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_members
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_members`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_members`(IN p_cid INT,
	IN p_uid INT,
  IN p_page INT,
	IN p_pagesize INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回俱乐部用户结果集
	# 传入参数：
	#    p_cid          俱乐部id
  #    p_uid          用户id,如果不为0，则是搜索用户
	#    p_page         返回第几页数据
	#    p_pagesize     每页数量
	# 成员结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_total_page BIGINT;            # 共多少页
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	#********************* 逻辑运行开始 **********************
	#初始化变量
	IF (p_uid = 0) THEN
		SELECT count(1) INTO v_count FROM t_club_member WHERE cid = p_cid;
	ELSE 
		SELECT count(1) INTO v_count FROM t_club_member WHERE cid = p_cid AND uid LIKE CONCAT("%", p_uid, '%');
	END IF;
	SET v_limit_start = (p_page - 1) * p_pagesize;
	SET v_total_page = CEILING(v_count / p_pagesize);
	
	
	IF (p_uid > 0) THEN
		SELECT 
				`user`.uid,
				`user`.`name`,
				`user`.sex,
				`user`.total_inning,
				`user`.headimg,
				`user`.login_time,
				`user`.create_time,
				`user`.profit_ratio,
				`member`.type,
				`member`.blacklist,
				`member`.create_time AS join_time,
				v_total_page AS totalPage,
				v_count AS count
		FROM         t_users AS `user`
		INNER JOIN   t_club_member AS `member`
		ON           `user`.uid = `member`.uid
		WHERE `member`.cid = p_cid
			AND `member`.uid LIKE CONCAT("%", p_uid, '%')
		ORDER BY `member`.create_time DESC
		LIMIT v_limit_start, p_pagesize;
	ELSE
		SELECT 
				`user`.uid,
				`user`.`name`,
				`user`.sex,
				`user`.total_inning,
				`user`.headimg,
				`user`.login_time,
				`user`.create_time,
				`user`.profit_ratio,
				`member`.type,
				`member`.blacklist,
				`member`.create_time AS join_time,
				v_total_page AS totalPage,
				v_count AS count
		FROM         t_users AS `user`
		INNER JOIN   t_club_member AS `member`
		ON           `user`.uid = `member`.uid
		WHERE `member`.cid = p_cid
		ORDER BY `member`.create_time DESC
		LIMIT v_limit_start, p_pagesize;
	END IF;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_my
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_my`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_my`(IN p_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 玩家加入的所有俱乐部
	# 传入参数：
	#    p_uid          玩家uid
	# 结果集
	#**********************程序说明结束 **********************
	
	#********************* 逻辑运行开始 **********************
	SELECT 
		c.`id`,
    c.`name` AS clubName,
		c.creator,
		c.create_time,
		c.`status`,
		c.mcount,
		u.`name` AS userName,
		u.`sex`,
		u.headimg,
		cm.type 
  FROM t_club_member AS cm INNER JOIN t_club c ON cm.cid = c.id INNER JOIN t_users u ON c.creator = u.uid WHERE cm.uid = p_uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_playerAlreadyWithdraw
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_playerAlreadyWithdraw`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_playerAlreadyWithdraw`(IN p_admin_uid INT,
	IN p_order_sn VARCHAR(32),
	IN p_status TINYINT,
  IN p_payment_no VARCHAR(64),
	IN p_partner_trade_no VARCHAR(64))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回处理下分结果
	# 传入参数：
  #    p_admin_uid    用户id,需判断用户是否有权限操作
	#    p_status				订单状态
	#    p_order_sn     订单号
	#    p_payment_no   微信单号
	#    p_partner_trade_no   微信商户号
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_uid INT DEFAULT 0;            # 下分玩家ID
	DECLARE v_cid INT DEFAULT 0;            # 下分玩家俱乐部ID
	#**********************定义变量结束 **********************
	
	#订单是否存在
	SELECT uid INTO v_uid FROM t_withdraw_order WHERE order_sn = p_order_sn AND `status` = 0;
	IF(v_uid = 0) THEN
		SELECT 5023 code, '订单不存在或者已经处理' msg;
		LEAVE MAIN;
	END IF;
	
	#********************* 逻辑运行开始 **********************
	UPDATE t_withdraw_order SET
	`status` = p_status,
	payment_no = p_payment_no,
	partner_trade_no = p_partner_trade_no
	WHERE order_sn = p_order_sn;
	
	SELECT 200 AS `code`;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_playerWithdrawList
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_playerWithdrawList`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_playerWithdrawList`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_status TINYINT,
	IN p_search_uid INT,
  IN p_page INT,
	IN p_pagesize INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回俱乐部玩家下分列表结果集
	# 传入参数：
	#    p_cid          俱乐部id
  #    p_admin_uid    用户id,需判断用户是否有权限操作
	#    p_status				订单状态
	#    p_page         返回第几页数据
	#    p_pagesize     每页数量
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_total_page BIGINT;            # 共多少页
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	#********************* 逻辑运行开始 **********************
	#初始化变量
	IF (p_search_uid > 0) THEN
		SELECT count(1) INTO v_count FROM t_withdraw_order WHERE uid = p_search_uid AND `status` = p_status;
	ELSE 
		SELECT count(1) INTO v_count FROM t_withdraw_order WHERE `status` = p_status;
	END IF;
	SET v_limit_start = (p_page - 1) * p_pagesize;
	SET v_total_page = CEILING(v_count / p_pagesize);
	
	#以下逻辑正在等待优化----------
	IF (p_search_uid > 0) THEN
		SELECT 
				`user`.`name`,
				`user`.sex,
				`user`.headimg,
				`order`.cid,
				`order`.order_sn,
				`order`.payment_no,
				`order`.uid,
				`order`.create_time,
				`order`.score,
				`order`.`status`,
				`order`.`id` AS order_id,
				v_total_page AS totalPage,
				v_count AS count
		FROM				t_withdraw_order AS `order`
		INNER JOIN  t_users AS `user`
		ON          `user`.uid = `order`.uid 
		WHERE				`order`.`status` = p_status AND `order`.uid = p_search_uid
		ORDER BY 		`order`.create_time DESC
		LIMIT v_limit_start, p_pagesize;
	ELSE
		SELECT 
				`user`.`name`,
				`user`.sex,
				`user`.headimg,
				`order`.cid,
				`order`.order_sn,
				`order`.payment_no,
				`order`.uid,
				`order`.create_time,
				`order`.score,
				`order`.`status`,
				`order`.`id` AS order_id,
				v_total_page AS totalPage,
				v_count AS count
		FROM				t_withdraw_order AS `order`
		INNER JOIN  t_users AS `user`
		ON          `user`.uid = `order`.uid
		WHERE				`order`.`status` = p_status
		ORDER BY 		`order`.create_time DESC
		LIMIT v_limit_start, p_pagesize;
	END IF;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_private_rooms
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_private_rooms`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_private_rooms`(IN p_cid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回俱乐部所有包间
	# 传入参数：
	#    p_cid          俱乐部id
	# 结果集
	#**********************程序说明结束 **********************
	
	#********************* 逻辑运行开始 **********************
	SELECT id, cid, `name`, content, `create_time`, weight FROM t_club_rooms WHERE cid = p_cid ORDER BY weight ASC, create_time ASC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_pr_order
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_pr_order`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_pr_order`(IN p_prid INT,
	IN p_prid2 INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 包间排序
	# 传入参数：
	#    p_prid          包间id
	#    p_prid2         包间id2
	# 结果集
	#**********************程序说明结束 **********************
	UPDATE t_club_rooms AS cr1 JOIN t_club_rooms AS cr2 ON (cr1.id = p_prid AND cr2.id = p_prid2)
	SET cr1.weight = cr2.weight, cr2.weight = cr1.weight;
	
	SELECT 200 AS `code`, '成功' AS `msg`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_recharge_history
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_recharge_history`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_recharge_history`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_uid INT,
	IN p_page INT,
	IN p_pagesize INT,
	IN `p_starttime` BIGINT,
	IN `p_endtime` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 管理员查看用户充值记录
	# 传入参数：
	#    p_cid                俱乐部id
  #    p_admin_uid          管理员uid
	#    p_uid                玩家uid
	#    p_page               页数
	#    p_pagesize               每页数量
	#    p_starttime               开始时间
	#    p_endtime               结束时间
	# 返回结果：结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE v_start_time BIGINT DEFAULT IF(p_starttime = 0, UNIX_TIMESTAMP(DATE_SUB(NOW(),INTERVAL 30 DAY)), p_starttime);  #开始时间
	DECLARE v_end_time BIGINT DEFAULT IF(p_endtime = 0, UNIX_TIMESTAMP(NOW()), p_endtime);      #结束时间
	
	#分页相关
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	#********************* 逻辑运行开始 **********************
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	
	# 判断是否同一俱乐部成员
	IF(f_same_club(p_uid, p_admin_uid) = 0) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	# 计算一共有多少条
	SELECT count(1) INTO v_count FROM t_orders WHERE uid = p_uid AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time;
	
	IF (v_count = 0) THEN
		SELECT * FROM t_orders LIMIT 0;
		LEAVE MAIN;
	END IF;
	
	SELECT *, p_page AS page, v_count AS count, CEILING(v_count/p_pagesize) AS totalPage FROM t_orders WHERE uid = p_uid AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time ORDER BY create_time DESC LIMIT v_limit_start, p_pagesize;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_set_admin
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_set_admin`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_set_admin`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_target_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 设置俱乐部管理员
	# 传入参数：
	#    p_cid           俱乐部id
  #    p_admin_uid          管理员uid
	#    p_target_uid         需要设置为管理员的uid
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_is_admin INT;            # 是否管理员 
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = p_cid AND uid = p_admin_uid AND type = 2;
	
	IF (v_is_admin > 0) THEN
		UPDATE t_club_member SET type = IF(type = 0, 1, 0)  WHERE cid = p_cid AND uid = p_target_uid;
		SELECT 200 AS `code`, '设置成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`;
	ELSE 
		SELECT 10018 AS `code`, '不是俱乐部创建者' AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_set_name
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_set_name`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_set_name`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_name VARCHAR(256))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 设置俱乐部名字
	# 传入参数：
	#    p_cid           俱乐部id
  #    p_admin_uid          管理员uid
	#    p_name         俱乐部新名字
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_is_admin BIGINT;            # 是否管理员
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = p_cid AND uid = p_admin_uid AND type > 0;
	
	IF (v_is_admin > 0) THEN
		UPDATE t_club SET `name` = p_name WHERE id = p_cid;
		SELECT 200 AS `code`, '设置成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`;
	ELSE 
		SELECT 10017 AS `code`, '不是管理员' AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_set_profit
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_set_profit`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_set_profit`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_target_uid INT,
	IN p_ratio      DOUBLE)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 设置分润，俱乐部中操作
	# 传入参数：
	#    p_cid                俱乐部id
  #    p_admin_uid          管理员uid
	#    p_target_uid         需要调整返佣的uid
	#    p_ratio              返佣比例
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE var_ratio DOUBLE DEFAULT 0;           # 返佣比例
	DECLARE var_ratio_list JSON DEFAULT '[]';     # 返佣列表
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	# 判断是否同一俱乐部成员
	IF(f_same_club(p_admin_uid, p_target_uid) < 1) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	SELECT content INTO var_ratio_list FROM t_config WHERE `key` = 'ratios';
	SET var_ratio = JSON_extract(var_ratio_list, CONCAT('$[', p_ratio, "]"));
	
	# 修改玩家分润
	UPDATE t_users SET profit_ratio = var_ratio WHERE uid = p_target_uid;
	# 保存操作日志
	if(ROW_COUNT() > 0)THEN
		INSERT INTO t_logs SET uid = p_admin_uid, other_uid = p_target_uid, type = 0, remark = CONCAT(p_admin_uid, "修改玩家", p_target_uid,"返佣为", var_ratio);
	END IF;
	
	SELECT 200 AS `code`, ROW_COUNT() AS `count`, (SELECT profit_ratio FROM t_users WHERE uid = p_target_uid) AS ratio;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_showMyClub
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_showMyClub`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_showMyClub`(IN VAR_uid BIGINT,
	In VAR_cid bigint)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户加入俱乐部时调用
	#传入参数：用户ID
	#返回结果：记录集，记录集为空时，客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	
	
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	
	
	IF(VAR_cid=0) then
		#判断该用户是否存在
		IF NOT EXISTS(SELECT 1 FROM `yfchess`.`t_users` WHERE uid=VAR_uid) THEN
			#SELECT 1 AS `code`, '用户不存在' AS `msg`;
			SELECT uid FROM `yfchess`.`t_users` WHERE uid=-1;
			LEAVE  MAIN; 
		END IF;
	
		#查询所有俱乐部
		SELECT
		DATE_FORMAT(member.create_time,'%Y-%m-%d %T') AS my_join_time,
		member.cid AS club_id,
		club.name AS club_name,
		club.creator AS club_creator_uid,
		DATE_FORMAT(club.create_time,'%Y-%m-%d %T') AS club_create_time,
		clubcount.membersnum AS club_members_num,
		users.headimg AS club_headimg,
		users.name AS user_name,
		users.sex AS user_sex
		FROM 
		`yfchess`.`t_club_member` AS member,
		`yfchess`.`t_club` AS club,
		#(SELECT cid,COUNT(DISTINCT cid,uid) AS membersnum FROM `yfchess`.`t_club_member` GROUP BY cid ) AS clubcount,
		(SELECT cid,0 AS membersnum FROM `yfchess`.`t_club_member` GROUP BY cid ) AS clubcount,
		`yfchess`.`t_users` AS users
		WHERE 
		member.cid=club.id AND
		club.id=clubcount.cid AND
		club.creator=users.uid AND
		member.uid=VAR_uid;
	else
		#查询指定俱乐部
		SELECT
		club.id	AS club_id,
		club.name AS club_name,
		club.creator AS club_creator_uid,
		DATE_FORMAT(club.create_time,'%Y-%m-%d %T') AS club_create_time,
		clubcount.membersnum AS club_members_num,
		users.headimg AS club_headimg,
		users.name AS user_name,
		users.sex AS user_sex
		FROM 
		`yfchess`.`t_club` AS club,
		#(SELECT cid,COUNT(DISTINCT cid,uid) AS membersnum FROM `yfchess`.`t_club_member` GROUP BY cid ) AS clubcount,
		(SELECT cid,0 AS membersnum FROM `yfchess`.`t_club_member` GROUP BY cid ) AS clubcount,
		`yfchess`.`t_users` AS users
		WHERE 
		club.id=VAR_cid AND
		club.id=clubcount.cid AND
		club.creator=users.uid;
		
	end if;
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_userinfo
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_userinfo`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_userinfo`(IN `p_uid` int,
	IN `p_cid` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 更新游戏中分数结果
	# 传入参数：
	#    p_uid            玩家uid
	#    p_cid            俱乐部id
	# 返回结果：俱乐部用户信息
	#**********************程序说明结束 **********************
	SELECT 
	cm.*, 
	u.*
	FROM t_club_member cm INNER JOIN t_users u ON cm.uid = u.uid WHERE cm.uid = `p_uid` AND cm.cid = `p_cid`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_user_addscore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_user_addscore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_user_addscore`(IN `p_uid` INT, 
	IN `p_admin_uid` INT, 
	IN `p_score` INT,
	IN `p_cid` INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部管理员给玩家充值
	# 传入参数：
	#    p_uid         用户ID
	#    p_admin_uid   充值管理员
	#    p_score       充值道具ID
	# 返回结果：code， msg  200成功，其它错误
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_order_sn     VARCHAR(32)   DEFAULT '';        #本地订单号
	#**********************定义变量结束 **********************
	
	
	
	#****************** 变量赋值 ***************************
	# 生成订单号
	SET var_order_sn = CONCAT('30', DATE_FORMAT(NOW(),'%Y%m%d%k%i%s'), CAST(FLOOR(RAND() * 899999 + 100000) AS UNSIGNED));
	
	# 是否同一俱乐部
	IF (f_same_club(p_uid, p_admin_uid) = 0) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	# 是否是群主
	IF ((SELECT type FROM t_club_member WHERE uid = p_admin_uid) != 2) THEN
		SELECT 10018 AS `code`, '不是群主' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 5004 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	# 开始事务
	START TRANSACTION;
		# 插入订单
		INSERT INTO t_orders SET 
			order_sn = var_order_sn,
			uid = p_uid,
			operator_uid = p_admin_uid,
			agent_id = 'manual_recharge',
			pay_channel = 30,
			buy_number = p_score,
			pay_money = (p_score/10000),
			goods_name = "",
			pay_status = 1,
			remark = "",
			cid = p_cid;
			#poundage = p_score * 0.025;  
		
		UPDATE t_wallet SET score = score + p_score, recharge = recharge + p_score WHERE uid = p_uid;
		UPDATE t_club SET recharge = recharge + p_score WHERE id = p_cid;
		
		IF (ROW_COUNT() = 0) THEN
			ROLLBACK;
			SELECT 5005 AS `code`, "失败" AS `msg`;
			LEAVE MAIN;
		END IF;
		
	COMMIT;
	
	SELECT 200 AS `code`, (SELECT score FROM t_wallet WHERE uid = p_uid) AS score;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_user_decreasescore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_user_decreasescore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_user_decreasescore`(IN `p_uid` INT, 
	IN `p_admin_uid` INT,
	IN `p_score` INT,
	IN `p_cid` INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部管理员给玩家扣分
	# 传入参数：
	#    p_uid         用户ID
	#    p_admin_uid   管理员
	#    p_score       扣除分数
	# 返回结果：code， msg  200成功，其它错误
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_order_sn     VARCHAR(32)   DEFAULT CONCAT('002', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), FLOOR((1000000 + RAND() * 9000000)));        #本地订单号
	DECLARE v_surplus_score BIGINT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1 _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	#****************** 变量赋值 ***************************
	# 是否同一俱乐部
	IF (f_same_club(p_uid, p_admin_uid) = 0) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	# 是否是群主
	IF ((SELECT type FROM t_club_member WHERE uid = p_admin_uid) != 2) THEN
		SELECT 10018 AS `code`, '不是群主' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 5004 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	# 开始事务
	START TRANSACTION;
		#删除玩家的分数
		UPDATE 
			t_wallet 
		SET 
			score = score - p_score, 
			withdrawal = withdrawal + p_score 
		WHERE 
			uid = `p_uid` AND score >= p_score;
			
		UPDATE t_club SET withdrawal = withdrawal + p_score WHERE id = p_cid;
		
		# 查出剩余分数
		SELECT score INTO v_surplus_score FROM t_wallet WHERE uid = p_uid;
		
		IF (ROW_COUNT() > 0) THEN
			#插入提现订单
			INSERT INTO t_withdraw_order 
			SET 
				uid = p_uid, 
				score=p_score, 
				poundage = 0, 
				order_sn = var_order_sn, 
				surplus_score = v_surplus_score,
				type = 1,
				`status` = 1,
				admin = p_admin_uid,
				cid = p_cid;
				
			#发生错误，则返回错误代码与错误信息
			IF (_ERROR != 0) THEN
				ROLLBACK;
				SELECT _ERROR AS `code`, _SQLSTATE AS `sqlstate`, _ERROR_MSG AS `msg`;
				LEAVE MAIN; 
			END IF;
			# 如果成功，则返回成功后的分数
			SELECT 200 AS `code`, p_uid AS uid, LAST_INSERT_ID() AS insertId, v_surplus_score AS score;
		ELSE
			SELECT 10035 AS `code`, p_uid AS uid, (SELECT score FROM t_wallet WHERE uid = p_uid) AS score;
			ROLLBACK;
			LEAVE MAIN;
		END IF;
	COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_user_detailinfo
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_user_detailinfo`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_user_detailinfo`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部用户详细信息
	# 传入参数：
	#    p_cid          俱乐部id
	#    p_admin_uid    管理员uid
	#    p_uid          用户uid
	# 返回用户信息
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_mobile VARCHAR(32) DEFAULT '';
	DECLARE v_paymenturl VARCHAR(512) DEFAULT '';
	DECLARE v_paymentname VARCHAR(255) DEFAULT '';
	DECLARE v_nickname   VARCHAR(64)  DEFAULT '';
	DECLARE v_realname   VARCHAR(64)  DEFAULT '';
	DECLARE v_headimg    VARCHAR(512) DEFAULT '';
	
	DECLARE v_is_admin INT;            # 是否管理员
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = p_cid AND uid = p_admin_uid;# AND type > 0;
	
	IF(v_is_admin = 0)THEN
		LEAVE MAIN;
	END IF;
	
	#找出用户的绑定信息
	SELECT mobile INTO v_mobile FROM t_users WHERE uid = p_uid LIMIT 1;
	SELECT paymenturl, `name` INTO v_paymenturl, v_paymentname FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT nickname, realname, headimg INTO v_nickname, v_realname, v_headimg FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	
	
	SELECT 
		u.`uid`,
		u.`invite_code`,
		u.`total_inning`,
		u.`profit_ratio`,
		u.`name`,
		u.`team_count`,
		u.`sealUp`,
		w.`score`,
		w.`game_turnover`,
		w.`recharge`,
		w.`withdrawal`,
		w.`tax`,
		w.`give`,
		w.`poundage`,
		w.`profit` AS profit_recharge,
		p.`profit`,
		p.`today_profit`,
		p.`total_profit`,
		v_mobile AS mobile,
		v_paymenturl AS paymenturl,
		v_paymentname AS paymentname,
		v_nickname AS wx_nickname,
		v_realname AS wx_realname,
		v_headimg  AS wx_headimg,
		(SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio > 0) AS subordinateCount,
		(SELECT count(*) FROM t_users WHERE ppid = p_uid AND profit_ratio > 0) AS subordinateTwoCount,
		(SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio = 0) AS playerCount
	FROM t_users u 
	JOIN t_wallet w 
	ON u.uid = w.uid 
	JOIN t_profit p
	ON u.uid = p.uid
	WHERE u.uid = p_uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_withdraw_detailinfo
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_withdraw_detailinfo`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_withdraw_detailinfo`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 俱乐部用户详细信息
	# 传入参数：
	#    p_cid          俱乐部id
	#    p_admin_uid    管理员uid
	#    p_uid          用户uid
	# 返回用户信息
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_mobile VARCHAR(32) DEFAULT '';
	DECLARE v_paymenturl VARCHAR(512) DEFAULT '';
	DECLARE v_nickname   VARCHAR(64)  DEFAULT '';
	DECLARE v_realname   VARCHAR(64)  DEFAULT '';
	DECLARE v_headimg    VARCHAR(512) DEFAULT '';
	
	DECLARE v_is_admin INT;            # 是否管理员
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	
	SELECT count(1) INTO v_is_admin FROM t_club_member WHERE cid = p_cid AND uid = p_admin_uid AND type > 0;
	
	IF(v_is_admin = 0)THEN
		LEAVE MAIN;
	END IF;
	
	#找出用户的绑定信息
	SELECT mobile INTO v_mobile FROM t_users WHERE uid = p_uid LIMIT 1;
	SELECT paymenturl INTO v_paymenturl FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT nickname, realname, headimg INTO v_nickname, v_realname, v_headimg FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	
	
	SELECT 
		u.`uid`,
		u.`invite_code`,
		u.`total_inning`,
		u.`profit_ratio`,
		u.`name`,
		u.`team_count`,
		u.`sealUp`,
		w.`score`,
		w.`game_turnover`,
		w.`recharge`,
		w.`withdrawal`,
		w.`tax`,
		p.`profit`,
		p.`today_profit`,
		p.`total_profit`,
		v_mobile AS mobile,
		v_paymenturl AS paymenturl,
		v_nickname AS wx_nickname,
		v_realname AS wx_realname,
		v_headimg  AS wx_headimg,
		(SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio > 0) AS subordinateCount,
		(SELECT count(*) FROM t_users WHERE ppid = p_uid AND profit_ratio > 0) AS subordinateTwoCount,
		(SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio = 0) AS playerCount
	FROM t_users u 
	JOIN t_wallet w 
	ON u.uid = w.uid 
	JOIN t_profit p
	ON u.uid = p.uid
	WHERE u.uid = p_uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_withdraw_history
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_withdraw_history`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_withdraw_history`(IN p_cid INT,
	IN p_admin_uid INT,
	IN p_uid INT,
	IN p_page INT,
	IN p_pagesize INT,
	IN `p_starttime` BIGINT,
	IN `p_endtime` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 管理员查看用户充值记录
	# 传入参数：
	#    p_cid                俱乐部id
  #    p_admin_uid          管理员uid
	#    p_uid                玩家uid
	#    p_page               页数
	#    p_pagesize               每页数量
	#    p_starttime               开始时间
	#    p_endtime               结束时间
	# 返回结果：结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE v_start_time BIGINT DEFAULT (IF((p_starttime) = 0, UNIX_TIMESTAMP(DATE_SUB(NOW(),INTERVAL 30 DAY)), p_starttime));  #开始时间
	DECLARE v_end_time BIGINT DEFAULT (IF((p_endtime) = 0, UNIX_TIMESTAMP(NOW()), p_endtime));      #结束时间
	
	#分页相关
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	
	DECLARE var_count INT DEFAULT 0;            # 两个用户是否在同一个俱乐部
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	
	
	IF(f_same_club(p_uid, p_admin_uid) = 0) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	# 计算一共有多少条
	SELECT count(1) INTO v_count FROM t_withdraw_order WHERE uid = p_uid AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time;
	
	IF (v_count = 0) THEN
		SELECT * FROM t_orders LIMIT 0;
		LEAVE MAIN;
	END IF;
	
	SELECT *, p_page AS page, v_count AS count, CEILING(v_count/p_pagesize) AS totalPage FROM t_withdraw_order WHERE uid = p_uid AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time ORDER BY create_time DESC LIMIT v_limit_start, p_pagesize;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_withdraw_info
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_withdraw_info`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_withdraw_info`(IN `p_uid` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 用户登录后需要的数据
	# 传入参数：
	#    p_uid          
	# 返回登录后需要缓存到内存的用户数据
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_paymentUrl VARCHAR(512) DEFAULT '';
	DECLARE v_paymentName VARCHAR(64) DEFAULT '';
	
	DECLARE v_nickname   VARCHAR(64)  DEFAULT '';
	DECLARE v_realname   VARCHAR(64)  DEFAULT '';
	DECLARE v_headimg    VARCHAR(512) DEFAULT '';
	DECLARE v_openid    VARCHAR(64) DEFAULT '';
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	SELECT nickname, realname, headimg, openid INTO v_nickname, v_realname, v_headimg, v_openid FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT paymenturl, `name` INTO v_paymentUrl, v_paymentName FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	
	SELECT 
		200 AS code,
		v_nickname AS wxNickname, 
		v_realname AS wxRealname, 
		v_headimg AS wxHeadimg, 
		v_openid AS wxOpenid,
		v_paymentUrl AS paymentUrl, 
		v_paymentName AS paymentName;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_club_withdraw_num
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_club_withdraw_num`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_club_withdraw_num`(IN p_cid INT,
	IN p_admin_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回俱乐部玩家下分列表结果集
	# 传入参数：
	#    p_cid          俱乐部id
  #    p_admin_uid    用户id,需判断用户是否有权限操作
	#    p_status				订单状态
	#    p_page         返回第几页数据
	#    p_pagesize     每页数量
	# 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_plyaer_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_dealer_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_dealer_lastday BIGINT DEFAULT  0;     # 代理昨日提现
	DECLARE v_dealer_today BIGINT DEFAULT  0;      	# 代理今日提现
	DECLARE v_player_lastday BIGINT DEFAULT  0;     # 玩家昨日提现
	DECLARE v_player_today BIGINT DEFAULT  0;      	# 玩家今日提现
	#**********************定义变量结束 **********************
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT count(1) INTO v_plyaer_count FROM t_withdraw_order WHERE `status` = 0;
	SELECT count(1) INTO v_dealer_count FROM t_withdraw_dealer WHERE `status` = 0 AND `type` < 2;
	SELECT SUM(score) INTO v_dealer_lastday FROM t_withdraw_dealer WHERE TO_DAYS(NOW()) - TO_DAYS(create_time) = 1;
	SELECT SUM(score) INTO v_dealer_today FROM t_withdraw_dealer WHERE TO_DAYS(NOW()) = TO_DAYS(create_time);
	SELECT SUM(score) INTO v_player_lastday FROM t_withdraw_order WHERE TO_DAYS(NOW()) - TO_DAYS(create_time) = 1;
	SELECT SUM(score) INTO v_player_today FROM t_withdraw_order WHERE TO_DAYS(NOW()) = TO_DAYS(create_time);
	
	SELECT 
		200 AS code,
		v_plyaer_count AS player_num,
		v_dealer_count AS dealer_num,
		v_dealer_lastday AS dealer_lastday,
		v_dealer_today AS dealer_today,
		v_player_lastday AS player_lastday,
		v_player_today AS player_today;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_CheckScore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_CheckScore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_count_CheckScore`(IN VAR_uid BIGINT,
	In VAR_starttime datetime,
	IN VAR_endtime DATETIME)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#核对用户积分
	#传入参数：用户ID，开始时间，结束时间
	#返回结果：rs
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE VAR_intstarttime BIGINT;
	DECLARE VAR_intendtime BIGINT;		
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#计算开始时间
	SELECT UNIX_TIMESTAMP(VAR_starttime) INTO VAR_intstarttime;
	SELECT UNIX_TIMESTAMP(VAR_endtime) INTO VAR_intendtime;
	
	
	SELECT
		VAR_uid as uid,
		b.`actual_scores`,
		b.`cut`
		FROM `yfchess`.`t_history_relation` AS a
		INNER JOIN `yfchess`.`t_history` AS b
		ON a.hid=b.id 
		WHERE a.uid=VAR_uid 
		AND a.`htime` BETWEEN VAR_intstarttime AND VAR_intendtime;
	
	
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_count_GetZhanJi
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_count_GetZhanJi`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_count_GetZhanJi`(IN VAR_uid BIGINT,
	IN VAR_gametype varchar(32),
	In VAR_starttime datetime,
	in VAR_currentpage INT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#用户退出俱乐部时调用
	#传入参数：用户ID，游戏类型，开始时间
	#返回结果：rs
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE VAR_intstarttime BIGINT;	
	
	#分页相关
	declare VAR_pagesize bigint default  20; #每页显示多少数据
	DECLARE VAR_totalpage BIGINT ; #共多少页
	DECLARE VAR_rscount BIGINT DEFAULT  0; #总记录数
	DECLARE VAR_limitstart bigint default 0; #limit的第一个参数
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#计算开始时间
	SELECT UNIX_TIMESTAMP(VAR_starttime) INTO VAR_intstarttime;
	
	
	#计算总记录
	if (VAR_gametype='') then
		select count(1) into VAR_rscount from `yfchess`.`t_history_relation` where uid=VAR_uid AND `htime` >= VAR_intstarttime;
	else
		SELECT COUNT(1) INTO VAR_rscount FROM `yfchess`.`t_history_relation` as a inner join `yfchess`.`t_history` as b ON a.hid=b.id  WHERE a.uid=VAR_uid AND a.`htime` >= VAR_intstarttime and b.game_name=VAR_gametype;
	end if;
	
	
	#如果记录为空，仅返回表结构
	IF (VAR_rscount=0) THEN
		SELECT b.* FROM `yfchess`.`t_history_relation` AS a
		INNER JOIN `yfchess`.`t_history` AS b
		ON a.hid=b.id  
		WHERE a.uid=VAR_uid 
		AND a.`htime` >= VAR_intstarttime LIMIT 0;
		leave MAIN;
	END IF;
	
	#计算分页参数
	IF (VAR_currentpage<1) then 
		set VAR_currentpage=1;
	end if;
	SET VAR_limitstart= (VAR_currentpage-1) * VAR_pagesize;
	SET VAR_totalpage = ceiling(VAR_rscount/VAR_pagesize);
	
	
	#CALL `sp_count_GetZhanJi`(796323,'','20190110140000',4)
	
	#查询所有的
	IF (VAR_gametype='') THEN
		SELECT
		VAR_uid as p1,
		VAR_gametype as p2,
		date_format(VAR_starttime,'%Y-%m-%d %T') as p3,		
		VAR_currentpage AS currentpage,
		VAR_totalpage AS totalpage,
		VAR_pagesize AS pagesize,
		VAR_rscount as rscount,
		DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,	 
		b.*,
		c.`game_rule`,
		c.rid,
		f_managerment_uids2headname(b.uids) as userinfo
		FROM `yfchess`.`t_history_relation` AS a
		INNER JOIN `yfchess`.`t_history` AS b
		ON a.hid=b.id 
		inner join `t_room_history` as c
		on b.`room_history_id`=c.id
		WHERE a.uid=VAR_uid 
		AND a.`htime` >= VAR_intstarttime LIMIT VAR_limitstart,VAR_pagesize;
	ELSE
		SELECT
		VAR_uid AS p1,
		VAR_gametype AS p2,
		DATE_FORMAT(VAR_starttime,'%Y-%m-%d %T') AS p3,			
		VAR_currentpage AS currentpage,
		VAR_totalpage AS totalpage,
		VAR_pagesize AS pagesize,
		VAR_rscount AS rscount,
		DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,
		b.*,
		c.`game_rule`,
		c.rid,
		f_managerment_uids2headname(b.uids) AS userinfo 
		FROM `yfchess`.`t_history_relation` AS a
		INNER JOIN `yfchess`.`t_history` AS b
		ON a.hid=b.id  
		INNER JOIN `t_room_history` AS c
		ON b.`room_history_id`=c.id
		WHERE a.uid=VAR_uid 
		AND a.`htime` >= VAR_intstarttime
		AND b.`game_name`=VAR_gametype 
		LIMIT VAR_limitstart,VAR_pagesize;
		
	END IF;
	
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_dealer_info
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_dealer_info`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_dealer_info`(IN `p_uid` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 代理详细信息
	# 传入参数：
	#    p_uid            玩家uid
	# 返回结果：代理信息
	#**********************程序说明结束 **********************
	
	
	
	SELECT 
		u.uid, 
		u.invite_code, 
		u.`name`, 
		u.headimg, 
		u.profit_ratio,
		u.team_count, 
		(SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio > 0) AS subordinateCount, 
		(SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio = 0) AS playerCount, 
		(SELECT count(*) FROM t_users WHERE ppid = p_uid AND profit_ratio > 0) AS subordinateTwoCount, 
		p.profit, p.today_profit 
	FROM t_users AS u INNER JOIN t_profit AS p ON u.uid = p.uid  
	WHERE u.uid = p_uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_dealer_recharge
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_dealer_recharge`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_dealer_recharge`(IN `p_uid` int,IN `p_score` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 代理积分直接转换成游戏积分
	# 传入参数：
	#    p_uid         用户ID
	#    p_score       转换分数
	# 返回结果：code， msg  200成功，其它错误
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_order_sn     VARCHAR(32)   DEFAULT '';        #本地订单号
	DECLARE var_code         INT           DEFAULT 0;         #设置订单成功的状态码
	#**********************定义变量结束 **********************
	
	
	
	#****************** 变量赋值 ***************************
	# 生成订单号
	SET var_order_sn = CONCAT('d', DATE_FORMAT(NOW(),'%Y%m%d%k%i%s'), CAST(FLOOR(RAND() * 89999 + 10000) AS UNSIGNED));
	
	
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 2001 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	# 插入订单
	INSERT INTO t_orders SET 
		order_sn = var_order_sn,
		operator_id = p_uid,
		goods_id = 0,
		agent_id = '222',
		pay_channel = 31,
		buy_number = p_score,
		pay_money = p_score / 10000,
		goods_name = '代理积分',
		remark = '代理积分转游戏积分';
		
	# 设置订单成功
	CALL sp_buy_completed(var_order_sn, var_order_sn, '222');
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_dealer_withdraw
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_dealer_withdraw`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_dealer_withdraw`(IN `p_cid` INT,
	IN `p_uid` INT,
	IN `p_score` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 用户提现
	# 传入参数：
	#    p_cid       俱乐部id
	#    p_uid       提现玩家
	#    p_score     提现分数
	# 返回结果：分数改变后的结果 code,uid,score
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#程序变量
	DECLARE v_poundage BIGINT DEFAULT 0;		#手续费
	DECLARE v_deduction_score BIGINT DEFAULT 0;  #实际扣除的分数(包含手续费)
	DECLARE v_min_withdraw BIGINT DEFAULT 0; #最小提现金额
	DECLARE v_max_withdraw BIGINT DEFAULT 0; #最大提现金额
	DECLARE v_ordersn VARCHAR(255) DEFAULT CONCAT('003', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), FLOOR((1000000 + RAND() * 9000000)));
	DECLARE v_payment INT DEFAULT 0;
	DECLARE v_wechat  INT DEFAULT 0;
	DECLARE v_surplus_score BIGINT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1 _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	
	
	#**********************执行逻辑开始 **********************
	#计算手续费
	SELECT `value` * `p_score` INTO v_poundage FROM t_config WHERE `key` = 'dealer_withdraw_poundage';
	SET v_deduction_score = `p_score` + v_poundage;
	SELECT `value` INTO v_min_withdraw FROM t_config WHERE `key` = 'min_withdraw';
	SELECT `value` INTO v_max_withdraw FROM t_config WHERE `key` = 'max_withdraw';
	
	SELECT count(*) INTO v_payment FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT count(*) INTO v_wechat  FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	
	IF (v_payment = 0 AND v_wechat = 0) THEN
		SELECT 5020 AS `code`, "未上传收款信息" AS `msg`;
		LEAVE MAIN;
	END IF;
	
	IF (p_score < (v_min_withdraw * 10000) AND p_score > (v_max_withdraw * 10000)) THEN
		SELECT 10045 AS `code`, CONCAT('提现分数必须大于', v_min_withdraw, "并且小于", v_max_withdraw) AS `msg`;
		LEAVE MAIN;
	END IF;
	
	# 开始事务
	START TRANSACTION;
	  #删除玩家的分数
		UPDATE 
			t_profit 
		SET 
			profit = profit - v_deduction_score, 
			withdraw_profit = withdraw_profit + `p_score`, 
			poundage = poundage + v_poundage
		where 
			uid = `p_uid` and profit >= v_deduction_score;
		
		IF (ROW_COUNT() > 0) THEN
			# 查出剩余分数
			SELECT profit INTO v_surplus_score FROM t_profit WHERE uid = p_uid;
			#插入提现订单
			INSERT INTO t_withdraw_dealer SET uid = p_uid, score=p_score, poundage = v_poundage, order_sn = v_ordersn, surplus_score = v_surplus_score, cid = p_cid;
			
			#更新俱乐部玩家提现总手续费
			UPDATE 
				t_club
			SET 
				withdrawPoundage = withdrawPoundage + v_poundage,
				dealerWithdrawal = dealerWithdrawal + p_score
			WHERE 
				id = p_cid;
			
			#发生错误，则返回错误代码与错误信息
			IF (_ERROR != 0) THEN
				ROLLBACK;
				SELECT _ERROR AS `code`, _SQLSTATE AS `sqlstate`, _ERROR_MSG AS `msg`;
				LEAVE MAIN; 
			END IF;
			# 如果成功，则返回成功后的分数
			SELECT 200 AS code, p_uid AS uid, LAST_INSERT_ID() AS insertId, v_surplus_score AS score;
		ELSE
			ROLLBACK;
			
			SELECT 10035 AS code, p_uid AS uid, (SELECT profit FROM t_profit WHERE uid = p_uid) AS score;
			LEAVE MAIN;
		END IF;
	COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_dealer_withdraw_game
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_dealer_withdraw_game`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_dealer_withdraw_game`(IN `p_cid` INT,
	IN `p_uid` INT,
	IN `p_score` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 代理提现为游戏积分
	# 传入参数：
	#    p_cid       俱乐部id
	#    p_uid       提现玩家
	#    p_score     提现分数
	# 返回结果：分数改变后的结果 code,uid,score
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#程序变量
	DECLARE v_ordersn VARCHAR(255) DEFAULT CONCAT('004', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), FLOOR((1000000 + RAND() * 9000000)));
	DECLARE v_rechargeOrdersn VARCHAR(255) DEFAULT CONCAT('999', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), FLOOR((1000000 + RAND() * 9000000)));
	DECLARE v_surplus_score BIGINT DEFAULT 0;
	DECLARE v_surplus_profit BIGINT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1 _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	
	#**********************执行逻辑开始 **********************
	
	# 开始事务
	START TRANSACTION;
	  #删除玩家的分数
		UPDATE 
			t_profit AS p JOIN t_wallet AS w ON (p.uid = w.uid) 
		SET 
			p.profit = p.profit - p_score, 
			p.withdraw_profit = p.withdraw_profit + `p_score`,
			w.score = w.score + p_score,
			w.profit = w.profit + p_score
		where 
			p.uid = `p_uid` and p.profit >= `p_score`;
		
		IF (ROW_COUNT() > 0) THEN
			# 查出剩余分数
			SELECT p.profit, w.score INTO v_surplus_profit, v_surplus_score FROM t_profit p JOIN t_wallet w ON(p.uid = w.uid) WHERE p.uid = p_uid;
			#插入提现订单
			INSERT INTO t_withdraw_dealer SET uid = p_uid, score=p_score, order_sn = v_ordersn, surplus_score = v_surplus_profit, type = 2, status = 1, cid = p_cid;
			#插入充值订单
			INSERT INTO t_orders SET uid = p_uid, order_sn = v_rechargeOrdersn, agent_id = 999, pay_status = 1, pay_channel = 40, pay_type = 1, buy_number = p_score, pay_money = p_score/10000, cid = p_cid;
			
			UPDATE 
				t_club 
			SET 
				dealerWithdrawal = dealerWithdrawal + p_score,
				dealerRecharge = dealerRecharge + p_score
			WHERE
				id = p_cid;
				
			
			#发生错误，则返回错误代码与错误信息
			IF (_ERROR != 0) THEN
				ROLLBACK;
				SELECT _ERROR AS `code`, _SQLSTATE AS `sqlstate`, _ERROR_MSG AS `msg`;
				LEAVE MAIN; 
			END IF;
			# 如果成功，则返回成功后的分数
			SELECT 200 AS code, p_uid AS uid, LAST_INSERT_ID() AS insertId, v_surplus_score AS score, v_surplus_profit AS profit;
		ELSE
			ROLLBACK;
			
			SELECT 10035 AS code, p_uid AS uid, (SELECT profit FROM t_profit WHERE uid = p_uid) AS profit, (SELECT score FROM t_wallet WHERE uid = p_uid) AS score;
			LEAVE MAIN;
		END IF;
	COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_dealer_withdraw_history
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_dealer_withdraw_history`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_dealer_withdraw_history`(IN `p_uid` int,
	IN `p_page` int,
	IN `p_pagesize` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 代理提现记录
	# 传入参数：
	#    p_uid            玩家uid
	# 返回结果：结果集
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_count         INT           DEFAULT 0;         
	DECLARE v_start           INT           DEFAULT 0;
	DECLARE v_limit_size      INT           DEFAULT 0;
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	SET v_limit_size = IF(p_pagesize = 0, 1, p_pagesize);
	SET v_start = IF(p_page > 0, p_page - 1, p_page) * v_limit_size;
	
	SELECT count(1) INTO var_count FROM t_withdraw_dealer where uid = p_uid;
	
	IF (var_count = 0) THEN
		SELECT * FROM t_withdraw_order limit 0;
		LEAVE MAIN;
	END IF;
	
	
	SELECT 
		* , 
		var_count AS totalCount, 
		p_page AS page,
		CEILING(var_count/p_pagesize) AS totalPage
	FROM t_withdraw_dealer WHERE uid = p_uid  ORDER BY create_time DESC limit v_start, v_limit_size;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_Game_Client_GetClubRankByScore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_Game_Client_GetClubRankByScore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_Game_Client_GetClubRankByScore`(in PARA_clubid bigint,IN PARA_uid INT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#程序说明:获取俱乐部金币数量最多的15个人
	#传入参数：
	#返回结果：
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	SELECT 
	DISTINCT(u.uid),
	u.name,
	u.`headimg`,
	u.`score`,
	u.`remarks`,
	u.`sex`,
	u.invite_code,
	r.`wx_account`
	FROM `yfchess`.`t_users` AS u
	INNER JOIN  `yfchess`.`t_club_member` AS c
	ON c.uid=u.uid
	LEFT JOIN `yfchess`.`t_real_name` AS r
	ON u.uid=r.uid
	WHERE c.cid=PARA_clubid  AND u.uid !=PARA_uid
	ORDER BY u.`score` DESC LIMIT 15 ;
	
	
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_Game_Client_GetUpDealerList
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_Game_Client_GetUpDealerList`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_Game_Client_GetUpDealerList`(IN PARA_uid INT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#程序说明:查询所有上级代理
	#传入参数：
	#返回结果：
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE sTempUid INT;	      #运算过程中的当前用户ID
	DECLARE iLoop INT DEFAULT -1;	      #是否继续 （大于0继续）
	DECLARE i INT DEFAULT 0;	#防止意外最大操作100次
	#**********************定义变量结束 **********************
	
	
	#**********************执行逻辑开始 **********************
	CREATE TEMPORARY TABLE IF NOT EXISTS uids(uid INT);
	SET sTempUid = PARA_uid;      #第一个操作对象为传入的用户
	
	#查询出来的UID复制给iLoop，如果用户存在iLoop必定>0
	SELECT uid,invite_code INTO iLoop,sTempUid FROM `t_users` WHERE uid = sTempUid;
	
	WHILE (sTempUid <> 254530 && sTempUid <> 0 && iLoop>0 && i<100 ) DO
		INSERT INTO uids(uid) VALUES (sTempUid);
		
		#操作完一个用户后复位iLoop
		SET iLoop=-1;  #查询到不存在的用户退出
		SET i=i+1;  #防止意外最大操作100次
		SELECT uid,invite_code INTO iLoop,sTempUid FROM `t_users` WHERE uid = sTempUid;
	END WHILE;
	SELECT 
	DISTINCT(u.uid),
	u.name,
	u.`headimg`,
	u.`score`,
	u.`remarks`,
	u.`sex`,
	u.invite_code,
	r.`wx_account`
	FROM `yfchess`.`t_users` AS u
	LEFT JOIN `yfchess`.`t_real_name` AS r
	ON u.uid=r.uid
	WHERE u.uid !=PARA_uid AND u.`subordinate_count`>=5	AND u.uid IN(SELECT uid FROM uids)
	ORDER BY u.`score` DESC ;
	
	
	#丢弃临时表
	DROP TABLE uids;
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_game_writescore
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_game_writescore`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_game_writescore`(IN p_uuid BIGINT,
IN p_scores_json JSON,
IN p_tax  BIGINT,
IN p_inning INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 更新游戏中分数结果
	# 传入参数：
	#    p_uuid            房间uuid
	#    p_scores_json     格式： '[{"uid":979326,"score":-560000,"giveScore":-100000},{"uid":26548,"score":500000,"giveScore":50000}]'
	#    p_tax             税收
	#    p_inning          房间局号
	# 返回结果：分数改变后的结果 uid,score 结果集
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#程序变量
	DECLARE v_jsonLength INT DEFAULT 0;		#传入JSON结构体的长度
	DECLARE v_i INT DEFAULT 0;			    #循环体内变量I
	DECLARE v_uid BIGINT DEFAULT 0;		  #要操作的用户ID
	DECLARE v_score BIGINT DEFAULT 0;		#要添加的积分
	DECLARE v_sql TEXT DEFAULT '';
	
	#过程变量（容错）
	DECLARE _ERROR INTEGER DEFAULT 0;    
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET _ERROR=1; 
	#**********************定义变量结束 **********************
	
	#**********************执行逻辑开始 **********************
	# 空数据退出,要根据对象长度判断
	SET v_jsonLength = json_length(p_scores_json);
	IF(v_jsonLength = 0) THEN 
		SELECT 1000 AS `code`, 'scores_json参数为空！' AS `msg`;
		LEAVE  MAIN; 
	END IF;
	# 开启事务，必须所有执行成功
	START TRANSACTION; 
	  # 循环处理
		WHILE v_i< v_jsonLength DO
		  # 变量赋值
			SET v_uid = JSON_EXTRACT(p_scores_json,CONCAT('$[',v_i,'].uid'));
			SET v_score = JSON_EXTRACT(p_scores_json,CONCAT('$[',v_i,'].score'));
			SET v_sql = CONCAT(v_sql, v_uid, ',');
			
			#修改数据
			UPDATE 
			  t_wallet 
			SET 
			  `score` = `score` + v_score - p_tax, 
				`game_turnover` = `game_turnover` + v_score,
				`tax` = `tax` + p_tax
			WHERE 
			  `uid` = v_uid;
				
			UPDATE t_users SET total_inning = total_inning + 1 WHERE uid = v_uid;
			
			
			#判断错误
			IF(_ERROR=1) THEN
				#回滚事务
				ROLLBACK;  
				
				#记录失败
				INSERT INTO `t_sp_log_sp_game_witescore`(`roomid`,`inning`,`data`,`tax`,`insertdate`)
				VALUES(p_uuid, p_inning, p_scores_json, p_tax,NOW());
				
				#输出信息
				SELECT 1001 AS `code`, '批量修改积分失败！' AS `msg`;
				LEAVE MAIN;
			END IF;
			# 步进
		  SET v_i = v_i+1; 
		END WHILE;
		
	#提交事务
	COMMIT;
	
	#删除最后一个逗号
	SET v_sql = SUBSTR(v_sql, 1, LENGTH(v_sql) - 1);
	
	#分数变化后的结果
	SELECT uid, score FROM t_wallet WHERE FIND_IN_SET(uid, v_sql);
	#SELECT 200 AS `code`, '修改成功' AS `msg`;
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_history
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_history`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_get_history`(IN `param_uid` int,IN `param_gametype` varchar(32),IN `param_currentpage` int,IN `param_pagesize` int,IN `param_starttime` datetime,IN `param_endtime` datetime)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回玩家的战绩
	# 传入参数：
	#    param_uid         用户ID
	#    param_gametype    游戏类型
	#    param_currentpage 查询页数
	#    param_pagesize    每页数量
	#    param_starttime   开始时间
	#    param_endtime     结束时间
	#    param_order       排序规则，默认desc降序
	# 返回结果：战绩表数组
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE var_start_time BIGINT DEFAULT UNIX_TIMESTAMP(IF(param_starttime = '', '2019-01-01 12:00:00', param_starttime));  #开始时间
	DECLARE var_end_time BIGINT DEFAULT IF(param_endtime = '', var_start_time + 3600, UNIX_TIMESTAMP(param_endtime));      #结束时间
	
	#分页相关
	DECLARE var_total_page BIGINT;           # 共多少页
	DECLARE var_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE var_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	# 计算总记录
	if (param_gametype='') then
		SET var_count = (SELECT count(1) FROM `yfchess`.`t_history_relation` WHERE uid=`param_uid` AND htime >= var_start_time AND `htime` <= var_end_time);
	else
		SET var_count = (SELECT COUNT(1) FROM `yfchess`.`t_history_relation` AS a INNER JOIN `yfchess`.`t_history` AS b ON a.hid=b.id  WHERE a.uid = param_uid AND a.`htime`      >= var_start_time AND a.`htime` <= var_end_time AND b.game_name=param_gametype);
	end if;
	
	#如果记录为空，仅返回表结构
	IF (var_count = 0) THEN
		SELECT b.* FROM `yfchess`.`t_history_relation` AS a INNER JOIN `yfchess`.`t_history` AS b ON a.hid=b.id WHERE a.uid=param_uid AND a.`htime` >= var_start_time LIMIT 0;
		leave MAIN;
	END IF;
	
	#计算分页参数
	SET param_currentpage = IF(param_currentpage < 1, 1, param_currentpage);
	SET param_pagesize = IF(param_pagesize < 1, 1, param_pagesize);
	SET var_limit_start= (param_currentpage - 1) * param_pagesize;
	SET var_total_page = ceiling(var_count / param_pagesize);           #一共有多少页，向上取整
	
	#查询所有的战绩
	IF (param_gametype='') THEN
			SELECT
				param_uid as uid,
				param_gametype as gameType,
				date_format(var_start_time,'%Y-%m-%d %T') as p3,		
				param_currentpage AS currentPage,
				var_total_page AS totalPage,
				param_pagesize AS pageSize,
				var_count as count,
				DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,	 
				b.*,
				c.`game_rule`,
				c.rid,
				f_managerment_uids2headname(b.uids) as userinfo
			FROM `yfchess`.`t_history_relation` AS a
			INNER JOIN `yfchess`.`t_history` AS b
			ON a.hid=b.id 
			inner join `t_room_history` AS c
			on b.`room_history_id`=c.id
			WHERE a.uid = param_uid 
			AND a.`htime` >= var_start_time 
		  AND a.`htime` <= var_end_time 
			ORDER BY a.`htime` DESC
			LIMIT var_limit_start, param_pagesize;
	ELSE
			SELECT
				param_uid AS uid,
				param_gametype AS gameType,
				DATE_FORMAT(VAR_starttime,'%Y-%m-%d %T') AS p3,			
				param_currentpage AS currentPage,
				var_total_page AS totalPage,
				param_pagesize AS pageSize,
				var_count AS count,
				DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,
				b.*,
				c.`game_rule`,
				c.rid,
				f_managerment_uids2headname(b.uids) AS userinfo 
			FROM `yfchess`.`t_history_relation` AS a
			INNER JOIN `yfchess`.`t_history` AS b
			ON a.hid=b.id  
			INNER JOIN `t_room_history` AS c
			ON b.`room_history_id`=c.id
			WHERE a.uid = param_uid 
			AND a.`htime` >= var_start_time 
			AND a.`htime` <= var_end_time 
			AND b.`game_name` = param_gametype 
			ORDER BY a.`htime` DESC
			LIMIT var_limit_start, param_pagesize;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_notice
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_notice`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_get_notice`(IN `p_all` tinyint,
IN `p_pagesize` int,
IN `p_currentpage` int,
IN `p_order_by` VARCHAR(5))
BEGIN
	#********************** 程序说明开始 **********************
	# 获取公告信息
	# 传入参数：
	#    p_all         是否全公告 1= 全部 0= 当前
	#    p_pagesize    每页数量
	#    p_currentpage 当前页数 下标从1开始
	# 返回结果：公告信息
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE var_total_page BIGINT ;           # 共多少页
	DECLARE var_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE var_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束***********************
	#**************** 逻辑开始 *******************
	IF (p_all = 1) THEN 
		# 检查参数合理性
		SET p_currentpage = IF(p_currentpage < 1, 1, p_currentpage);
		SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
		SET p_order_by = IF(p_order_by = "desc", "desc", "asc");
		SELECT count(*) INTO var_count FROM t_notice;
		#计算总共多少页，向上取整
		SET var_total_page = ceiling(var_count / p_pagesize); 
		SET var_limit_start = (p_currentpage - 1) * p_pagesize;
		SELECT * FROM t_notice LIMIT var_limit_start, p_pagesize ;
	ELSE
		SELECT * FROM t_notice WHERE status = 1;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_statistic
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_statistic`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_get_statistic`()
BEGIN
	############## 程序说明 ###################
	# 获取统计数组  过时函数
	###########################################
	
	
	############## 定义变量 ################
	
	
	############### 开始执行逻辑 ###############
	SELECT 
	  (SELECT count(*) FROM t_users) totalUser,   # 平台总用户数
	  (SELECT COUNT(*) FROM yfchess.t_users WHERE TO_DAYS(now()) - TO_DAYS(create_time) = 1) newAddYesterday,                   # 昨天新增
		(SELECT COUNT(*) FROM (SELECT DISTINCT operator_id FROM yfchess.t_orders WHERE pay_status = 1) T) totalBuyCount,          # 总充值人数
		(SELECT COUNT(*) FROM (SELECT DISTINCT uid FROM yfchess.t_withdraw_order) T) totalWithdrawCount,                          # 总提现人数
		(SELECT IFNULL(SUM(pay_money), 0) FROM t_orders WHERE TO_DAYS(now()) - TO_DAYS(pay_time) = 1 AND pay_status = 1) yesterdayRecharge,  # 昨日充值
		(SELECT IFNULL(SUM(pay_money), 0) FROM t_orders WHERE TO_DAYS(NOW()) - TO_DAYS(pay_time) = 1 AND pay_status = 1 AND pay_channel = 30) yesterdayArtifactRecharge,  # 昨日手工充值
		(SELECT IFNULL(SUM(score), 0) FROM t_withdraw_order WHERE TO_DAYS(now()) - TO_DAYS(create_time) = 1) yesterdayWithdraw,              # 昨日下分
		(SELECT IFNULL(SUM(pay_money), 0) FROM t_orders WHERE TO_DAYS(now()) - TO_DAYS(pay_time) = 0 AND pay_status = 1) todayRecharge,  # 今日充值
		(SELECT IFNULL(SUM(pay_money), 0) FROM t_orders WHERE TO_DAYS(NOW()) - TO_DAYS(pay_time) = 0 AND pay_status = 1 AND pay_channel = 30) todayArtifactRecharge,  # 今日手工充值
		(SELECT IFNULL(SUM(score), 0) FROM t_withdraw_order WHERE TO_DAYS(now()) - TO_DAYS(create_time) = 0) todayWithdraw,              # 今日下分
		(SELECT IFNULL(SUM(score), 0) FROM t_users) totalScore,                              # 平台剩余总分数
		(SELECT cumulate_value FROM t_cumulatively WHERE cumulate_key = 'total_recharge') totalRecharge,   # 平台总充值
		(SELECT cumulate_value FROM t_cumulatively WHERE id = 2) totalWithdraw,   # 平台总下分
		(SELECT cumulate_value FROM t_cumulatively WHERE id = 3) totalProfit,     # 平台总抽水
		(SELECT cumulate_value FROM t_cumulatively WHERE id = 4) totalPoundage,   # 平台下分总手续费
		(SELECT cumulate_value FROM t_cumulatively WHERE id = 5) toDayProfit,     # 今日总抽水
		(SELECT cumulate_value FROM t_cumulatively WHERE id = 6) yesterdayProfit, # 昨日总抽水
	  (SELECT cumulate_value FROM t_cumulatively WHERE cumulate_key = 'dealer_today_profit') dealerTodayProfit,            #代理今日收益
		(SELECT cumulate_value FROM t_cumulatively WHERE cumulate_key = 'dealer_yesterday_profit') dealerYesterdayProfit;    #代理昨日收益
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_get_userinfo
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_get_userinfo`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_get_userinfo`(p_json json)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 获取用户信息
	# 传入参数：
	#    p_json          参数说明'{uid:123456}'; '{account:"wx_1234a56d4f6asd"}'
	# 返回创建用户的uid
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_uid INT DEFAULT JSON_EXTRACT(p_json, '$.uid');
	DECLARE v_account VARCHAR(64) DEFAULT json_unquote(JSON_EXTRACT(p_json, '$.account'));
	#**********************定义变量结束 **********************
	
	IF (v_uid IS NOT NULL) THEN
		SELECT u.*, w.* FROM t_users u JOIN t_wallet w ON u.uid = w.uid WHERE u.uid = v_uid;
	ELSEIF(v_account IS NOT NULL) THEN
		SELECT u.*, w.* FROM t_users u JOIN t_wallet w ON u.uid = w.uid WHERE u.account = v_account;
	ELSE
		SELECT * FROM t_users WHERE uid = 1;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_history_get_club_all
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_history_get_club_all`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_history_get_club_all`(IN `p_cid` int,
	IN `p_gametype` varchar(64),
	IN `p_page` int,
	IN `p_pagesize` int,
	IN `p_starttime` BIGINT,
	IN `p_endtime` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回玩家的战绩
	# 传入参数：
	#    p_cid         俱乐部id
	#    p_gametype    游戏类型
	#    p_page 查询页数
	#    p_pagesize    每页数量
	#    p_starttime   开始时间
	#    p_endtime     结束时间
	# 返回结果：战绩表数组
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE v_start_time BIGINT DEFAULT IF(p_starttime = '', UNIX_TIMESTAMP(DATE_SUB(NOW(),INTERVAL 30 DAY)), p_starttime);  #开始时间
	DECLARE v_end_time BIGINT DEFAULT IF(p_endtime = '', UNIX_TIMESTAMP(NOW()), p_endtime);      #结束时间
	
	
	#分页相关
	DECLARE v_total_page BIGINT;           # 共多少页
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	
	#**********************执行逻辑开始 **********************
	# 计算总记录
	if (p_gametype='') then
		SET v_count = (SELECT count(1) FROM t_history WHERE cid=`p_cid` AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time);
	else
		SET v_count = (SELECT count(1) FROM t_history WHERE cid=`p_cid` AND UNIX_TIMESTAMP(create_time) >= v_start_time AND UNIX_TIMESTAMP(create_time) <= v_end_time AND game_name = p_gametype);
	end if;
	
	
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	SET v_total_page = ceiling(v_count / p_pagesize);           #一共有多少页，向上取整
	
	#如果记录为空，仅返回表结构
	IF (v_count = 0) THEN
		SELECT * FROM t_history  WHERE cid = p_cid LIMIT 0;
		leave MAIN;
	END IF;
	
	
	
	#查询所有的战绩
	IF (p_gametype='') THEN
			SELECT
				p_gametype as gameType,
				p_page AS page,
				v_total_page AS totalPage,
				p_pagesize AS pageSize,
				v_count as count,
				DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,	 
				b.*,
				c.`game_rule`,
				c.`room_rule`,
				c.rid
			FROM 
			`t_history` AS b
			inner join `t_room_history` AS c
			on b.`room_history_id` = c.id
			WHERE b.cid = p_cid 
			AND UNIX_TIMESTAMP(b.create_time) >= v_start_time
		  AND UNIX_TIMESTAMP(b.create_time) <= v_end_time
			ORDER BY b.create_time DESC
			LIMIT v_limit_start, p_pagesize;
	ELSE
			SELECT
				p_gametype as gameType,
				p_page AS page,
				v_total_page AS totalPage,
				p_pagesize AS pageSize,
				v_count as count,
				DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,	 
				b.*,
				c.`game_rule`,
				c.`room_rule`,
				c.rid
			FROM 
			`t_history` AS b
			inner join `t_room_history` AS c
			on b.`room_history_id` = c.id
			WHERE b.cid = p_cid 
			AND UNIX_TIMESTAMP(b.create_time) >= v_start_time
		  AND UNIX_TIMESTAMP(b.create_time) <= v_end_time
			AND b.game_name = p_gametype
			ORDER BY b.create_time DESC
			LIMIT v_limit_start, p_pagesize;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_history_get_club_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_history_get_club_user`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_history_get_club_user`(IN `p_cid` int,
	IN `p_uid` int,
	IN `p_gametype` varchar(64),
	IN `p_page` int,
	IN `p_pagesize` int,
	IN `p_starttime` BIGINT,
	IN `p_endtime` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回玩家的战绩
	# 传入参数：
	#    p_cid         俱乐部id
	#    p_uid         玩家uid
	#    p_gametype    游戏类型
	#    p_page 查询页数
	#    p_pagesize    每页数量
	#    p_starttime   开始时间
	#    p_endtime     结束时间
	# 返回结果：战绩表数组
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	
	#分页相关
	DECLARE v_total_page BIGINT;           # 共多少页
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	
	DECLARE v_start_time BIGINT DEFAULT (IF(p_starttime = 0, UNIX_TIMESTAMP(DATE_SUB(NOW(),INTERVAL 3 DAY)), p_starttime));  #开始时间
	DECLARE v_end_time BIGINT DEFAULT (IF(p_endtime = 0, UNIX_TIMESTAMP(NOW()), p_endtime));      #结束时间
	#**********************定义变量结束 **********************
	
	
	
	
	
	#**********************执行逻辑开始 **********************
	# 计算总记录
	if (p_gametype='') then
		SELECT count(1) INTO v_count FROM t_history_relation  AS a INNER JOIN t_history AS b ON a.hid = b.id WHERE a.uid = `p_uid` AND b.cid = `p_cid` AND a.htime >= v_start_time AND a.`htime` <= v_end_time;
	ELSE 
		SELECT count(1) INTO v_count FROM t_history_relation  AS a INNER JOIN t_history AS b ON a.hid = b.id WHERE a.uid = `p_uid` AND b.cid = `p_cid` AND a.htime >= v_start_time AND a.`htime` <= v_end_time  AND game_name = p_gametype;
	END IF;
	
	
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	SET v_total_page = ceiling(v_count / p_pagesize);           #一共有多少页，向上取整
	#select v_count;
	#LEAVE MAIN;
	#如果记录为空，仅返回表结构
	IF (v_count = 0) THEN
		SELECT * FROM t_history  WHERE cid = p_cid LIMIT 0;
		leave MAIN;
	END IF;
	
	IF (p_gametype='') THEN
	#查询所有的战绩
			SELECT
				p_gametype as gameType,
				p_page AS page,
				v_total_page AS totalPage,
				p_pagesize AS pageSize,
				v_count as count,
				b.*,
				c.`game_rule`,
				c.`room_rule`,
				c.rid
			FROM 
			  `t_history_relation` AS a
			INNER JOIN 
			  `t_history` AS b
			ON a.hid = b.id
			INNER JOIN 
				`t_room_history` AS c
			ON b.`room_history_id` = c.id
			WHERE 
			a.uid = p_uid
			AND b.cid = p_cid 
			AND UNIX_TIMESTAMP(b.create_time) >= v_start_time
		  AND UNIX_TIMESTAMP(b.create_time) <= v_end_time
			ORDER BY b.create_time DESC
			LIMIT v_limit_start, p_pagesize;
		ELSE
			SELECT
				p_gametype as gameType,
				p_page AS page,
				v_total_page AS totalPage,
				p_pagesize AS pageSize,
				v_count as count,
				b.*,
				c.`game_rule`,
				c.`room_rule`,
				c.rid
			FROM 
			  `t_history_relation` AS a
			INNER JOIN 
			  `t_history` AS b
			ON a.hid = b.id
			INNER JOIN 
				`t_room_history` AS c
			ON b.`room_history_id` = c.id
			WHERE 
			a.uid = p_uid
			AND b.cid = p_cid 
			AND UNIX_TIMESTAMP(b.create_time) >= v_start_time
		  AND UNIX_TIMESTAMP(b.create_time) <= v_end_time
			AND b.game_name = p_gametype
			ORDER BY b.create_time DESC
			LIMIT v_limit_start, p_pagesize;
		END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_history_get_user
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_history_get_user`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_history_get_user`(IN `p_uid` int,
	IN `p_gametype` varchar(64),
	IN `p_page` int,
	IN `p_pagesize` int,
	IN `p_starttime` BIGINT,
	IN `p_endtime` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 返回玩家的战绩
	# 传入参数：
	#    p_cid         俱乐部id
	#    p_uid         玩家uid
	#    p_gametype    游戏类型
	#    p_page 查询页数
	#    p_pagesize    每页数量
	#    p_starttime   开始时间
	#    p_endtime     结束时间
	# 返回结果：战绩表数组
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE v_start_time BIGINT DEFAULT (IF(p_starttime = 0, UNIX_TIMESTAMP(DATE_SUB(NOW(),INTERVAL 3 DAY)), p_starttime));  #开始时间
	DECLARE v_end_time BIGINT DEFAULT (IF(p_endtime = 0, UNIX_TIMESTAMP(NOW()), p_endtime));      #结束时间
	
	#分页相关
	DECLARE v_total_page BIGINT;           # 共多少页
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE v_limit_start BIGINT DEFAULT 0; # 开始位置
	#**********************定义变量结束 **********************
	
	
	
	
	
	#**********************执行逻辑开始 **********************
	# 计算总记录
	SET v_count = (SELECT count(1) FROM t_history_relation  AS a INNER JOIN t_history AS b ON a.hid = b.id WHERE a.uid = `p_uid` AND b.cid = 0 AND a.htime >= v_start_time AND a.`htime` <= v_end_time);
	
	#计算分页参数
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_pagesize = IF(p_pagesize < 1, 1, p_pagesize);
	SET v_limit_start= (p_page - 1) * p_pagesize;
	SET v_total_page = ceiling(v_count / p_pagesize);           #一共有多少页，向上取整
	
	#如果记录为空，仅返回表结构
	IF (v_count = 0) THEN
		SELECT b.* FROM t_history  WHERE cid = p_cid LIMIT 0;
		leave MAIN;
	END IF;
	
	
	#查询所有的战绩
			SELECT
				p_gametype as gameType,
				date_format(v_start_time,'%Y-%m-%d %T') as p3,		
				p_page AS page,
				v_total_page AS totalPage,
				p_pagesize AS pageSize,
				v_count as count,
				DATE_FORMAT(b.create_time,'%Y-%m-%d %T') AS `date`,	 
				b.*,
				c.`game_rule`,
				c.`room_rule`,
				c.rid
			FROM 
			  `t_history_relation` AS a
			INNER JOIN 
			  `t_history` AS b
			ON a.hid = b.id
			INNER JOIN 
				`t_room_history` AS c
			ON b.`room_history_id` = c.id
			WHERE 
			a.uid = p_uid
			AND b.cid = 0 
			AND UNIX_TIMESTAMP(b.create_time) >= v_start_time
		  AND UNIX_TIMESTAMP(b.create_time) <= v_end_time
			ORDER BY b.create_time DESC
			LIMIT v_limit_start, p_pagesize;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_mobile_save
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_mobile_save`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_mobile_save`(IN `p_mobile` varchar(32),
	IN `p_uid` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 保存用户绑定手机号
	# 传入参数：
	#    p_uid         玩家uid
	#    p_mobile      手机号码
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	#**********************定义变量结束 **********************
	
	
	
  #**********************执行逻辑开始 **********************
	SELECT count(1) INTO v_count FROM t_users WHERE uid != p_uid AND mobile = p_mobile;
	
	IF (v_count > 0) THEN
		SELECT 50008 AS `code`, "手机号已经绑定其他用户" AS `msg`;
	ELSE
		UPDATE t_users SET mobile = p_mobile WHERE uid = p_uid;
		SELECT 200 AS `code`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_parents
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_parents`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_parents`(IN p_uid INT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#程序说明:查询所有上级
	#传入参数：
	#  p_uid    玩家uid
	#返回结果：父级列表
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE v_pid INT;	      #运算过程中的当前用户ID
	DECLARE v_uid INT DEFAULT -1;	      #是否继续 （大于0继续）
	DECLARE i INT DEFAULT 0;	#防止意外最大操作50次
	#**********************定义变量结束 **********************
	
	
	#**********************执行逻辑开始 **********************
	CREATE TEMPORARY TABLE IF NOT EXISTS temp_uids(uid INT);
	SET v_uid = p_uid;      #第一个操作对象为传入的用户
	
	#查询出来的UID复制给iLoop，如果用户存在v_uid必定>0
	SELECT uid,invite_code INTO v_uid,v_pid FROM `t_users` WHERE uid = v_uid;
	
	WHILE (v_uid > 0 && i < 50 ) DO
		INSERT INTO temp_uids(uid) VALUES (v_uid);
		
		
		SET v_uid=-1;  #查询到不存在的用户退出
		SET i=i+1;  #防止意外最大操作50次
		
		
		SELECT uid,invite_code INTO v_uid,v_pid FROM `t_users` WHERE uid = v_pid;
	END WHILE;
	
	SELECT 
		u.`uid`,
		u.`name`,
		u.`headimg`,
		u.`sex`,
		u.invite_code,
		u.profit_ratio
	FROM t_users AS u
	INNER JOIN temp_uids AS tu ON u.uid = tu.uid;
	
	
	#丢弃临时表
	DROP TABLE temp_uids;
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_payment_manager_save
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_payment_manager_save`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_payment_manager_save`(IN `p_cid` int,
	IN `p_admin_uid` int,
	IN `p_uid` int,
	IN `p_url` varchar(255),
	IN `p_name` varchar(255))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 保存用户收款码
	# 传入参数：
	#    p_uid         玩家uid
	#    p_url         收款链接
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	#**********************定义变量结束 **********************
	
		# 是否同一俱乐部
	IF (f_same_club(p_uid, p_admin_uid) = 0) THEN
		SELECT 5016 AS `code`, '不在同一俱乐部' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 5004 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	IF (f_is_club_role(p_cid, p_admin_uid) <= 0) THEN
		SELECT 10017 AS `code`, '不是管理员' AS `msg`;
		LEAVE MAIN;
	END IF;
	
  #**********************执行逻辑开始 **********************
	SELECT count(1) INTO v_count FROM t_payment_code WHERE uid = p_uid AND paymenturl = p_url;
	
	IF (v_count > 0) THEN
		UPDATE t_payment_code SET `update_time` = NOW(), `name` = `p_name` WHERE uid = p_uid AND paymenturl = p_url;
		SELECT 200 AS `code`, "更新成功" AS `msg`, ROW_COUNT() AS changeRow, FOUND_ROWS() AS affectedRow;
	ELSE
		INSERt INTO t_payment_code(uid, `name`, `paymenturl`) VALUES(`p_uid`, `p_name`, `p_url`);
		SELECT 200 AS `code`, LAST_INSERT_ID() AS insertId, "插入成功" AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_payment_save
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_payment_save`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_payment_save`(IN `p_uid` int,
	IN `p_url` varchar(255),
	IN `p_name` varchar(255))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 保存用户收款码
	# 传入参数：
	#    p_uid         玩家uid
	#    p_url         收款链接
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	DECLARE v_count BIGINT DEFAULT  0;      # 总记录数
	#**********************定义变量结束 **********************
	
	
	
  #**********************执行逻辑开始 **********************
	SELECT count(1) INTO v_count FROM t_payment_code WHERE uid = p_uid AND paymenturl = p_url;
	
	IF (v_count > 0) THEN
		UPDATE t_payment_code SET `update_time` = NOW(), `name` = `p_name` WHERE uid = p_uid AND paymenturl = p_url;
		SELECT 200 AS `code`, "更新成功" AS `msg`, ROW_COUNT() AS changeRow, FOUND_ROWS() AS affectedRow;
	ELSE
		INSERt INTO t_payment_code(uid, `name`, `paymenturl`) VALUES(`p_uid`, `p_name`, `p_url`);
		SELECT 200 AS `code`, LAST_INSERT_ID() AS insertId, "插入成功" AS `msg`;
	END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_profit_calculate
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_profit_calculate`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_profit_calculate`()
BEGIN
	#Routine body goes here...
	DECLARE   var_i          INT        DEFAULT 0;
	DECLARE   var_temp_uid   INT        DEFAULT 0;
	DECLARE   var_uid        INT        DEFAULT 297020;
	DECLARE   var_tax        INT        DEFAULT 3000;
	#DECLARE   var_parents    JSON       DEFAULT f_user_single_parents(var_uid);
	DECLARE   var_parents    JSON       DEFAULT '[[297020, 0.3], [876930, 0.4], [530180, 0.8], [218048, 0.8], [969363, 0.8], [298267, 0.8], [507274, 0.8], [352326, 1]]';
	DECLARE   var_parents_length  INT   DEFAULT JSON_LENGTH(var_parents);
	DECLARE   var_profit     INT        DEFAULT  0;
	
	DECLARE   var_total_tax       INT       DEFAULT  var_tax;
	DECLARE   var_root_uid        INT       DEFAULT  JSON_EXTRACT(var_parents, CONCAT('$[', var_parents_length - 1, '][0]'));
	DECLARE   var_parent_ratio    JSON      DEFAULT  (SELECT content FROM t_config WHERE `key` = 'parent_ratio');
	
	DECLARE   var_total_ratio     DOUBLE     DEFAULT   0;
  DECLARE   var_ratio           DOUBLE     DEFAULT   0;
	
	# 临时表，用来存那些分数变化的玩家
	CREATE TEMPORARY TABLE IF NOT EXISTS temp_users
	(
		`uid`     INT(8) UNSIGNED DEFAULT 0,
		`score`   BIGINT UNSIGNED DEFAULT 0,
		PRIMARY KEY (`uid`) USING BTREE
	);
	
	
	
	outer_label:  BEGIN
		WHILE var_i < var_parents_length AND var_i < 5 DO
			SET var_temp_uid = JSON_EXTRACT(var_parents, CONCAT('$[', var_i, '][0]'));
			SET var_ratio = IF(var_i > 0, JSON_EXTRACT(var_parent_ratio, CONCAT('$[', var_i - 1, ']')), JSON_EXTRACT(var_parents, '$[0][1]'));
			SET var_total_ratio = var_total_ratio + var_ratio;
			
			IF(var_total_ratio > 0.8) THEN
				LEAVE outer_label;
			END IF;
			
			SET var_profit = var_ratio * var_tax;
			SET var_total_tax = var_total_tax - var_profit;
			INSERT INTO temp_users(`uid`, `score`) VALUES(var_temp_uid, var_profit);
			
			SET var_i = var_i + 1;
		END WHILE;
	END outer_label;
	
	INSERT INTO temp_users(`uid`, `score`) VALUES(var_root_uid, var_total_tax);
	
	
	UPDATE t_profit AS tp 
	INNER JOIN temp_users AS tu 
	ON tp.uid = tu.uid 
	SET 
		tp.profit = tp.profit + tu.score,
		tp.today_profit = tp.today_profit + tu.score,
		tp.total_profit = tp.total_profit + tu.score;
	SELECT * FROM temp_users;
	DROP TABLE temp_users;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_profit_creator_write
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_profit_creator_write`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_profit_creator_write`(IN `p_cid` INT, IN `p_profit` BIGINT)
MAIN:BEGIN
	############## 程序说明 #################
	# 群主收益
	# 传入参数：群id  群主利润 
	# 返回结果：code, msg, data 
	############################################
	
	################# 定义变量 ###################
	#更新俱乐部群主利润
	UPDATE t_club SET creatorProfit = creatorProfit + p_profit WHERE id = p_cid;
	
	# 结束
	SELECT 200 AS 'code', '成功' AS 'msg';
	
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_profit_write
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_profit_write`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_profit_write`(IN `param_scores` json, 
	IN `p_cid` INT, 
	IN `p_profit` BIGINT, 
	IN `p_tax` BIGINT)
MAIN:BEGIN
	############## 程序说明 #################
	# 抽水积分累加到代理积分上
	# 传入参数：需要更新的玩家列表数组  json类型 
	#    格式：[{"uid":101023, "score":-38200}, {"uid":101026, "score":100000}]
	# 返回结果：code, msg, data 
	############################################
	
	################# 定义变量 ###################
	DECLARE var_length INT DEFAULT JSON_LENGTH(param_scores);
	DECLARE var_i INT DEFAULT 0;           #循环体变量
	DECLARE var_uid INT DEFAULT 0;         #循环体变量
	DECLARE var_score INT DEFAULT 0;       #循环体变量
	DECLARE var_total_score INT DEFAULT 0; #所有玩家分数和
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1
        _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	################# 定义变量结束 ###################
		
		
	
	
	
	################# 执行逻辑 ##################
	#开启事务，必须所有执行成功
	START TRANSACTION;
		#更新俱乐部利润和俱乐部抽水
		UPDATE t_club SET inning = inning + 1, profit = profit + p_profit, tax = tax + p_tax WHERE id = p_cid;
	
	  #循环更新玩家分数
		WHILE var_i < var_length DO
			SET var_uid = JSON_EXTRACT(param_scores, CONCAT('$[', var_i, '].uid'));
			SET var_score = JSON_EXTRACT(param_scores, CONCAT('$[', var_i, '].score'));
			# 积分增加到代理钱包中
			UPDATE t_profit SET 
					profit = profit + var_score, 
					today_profit = today_profit + var_score, 
					total_profit = total_profit + var_score 
			WHERE uid = var_uid;
				
			#判断错误，可能分数溢出，导致错误
			IF(_ERROR != 0) THEN
				#回滚事务
				ROLLBACK;  
					
				SELECT _ERROR AS `code`, _ERROR_MSG AS `msg`, _SQLSTATE AS `sqlstate`;
					
				#终止循环，跳转到end outer_label标记
				LEAVE  MAIN;  
			END IF;
			
			# 给循环变量增一
			SET var_i = var_i + 1;
		END WHILE;
		
	# 提交事务
	COMMIT;
	
	# 结束
	SELECT 200 AS 'code', '成功' AS 'msg';
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_statistic
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_statistic`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_statistic`(`p_cid` INT)
BEGIN
	############## 程序说明 ###################
	# 获取统计数组
	###########################################
	
	
	############## 定义变量 ################
	
	SELECT 
		SUM(wa.score) AS payerScore, 
		SUM(p.profit) AS dealerScore, 
		c.*,
		SUM(wa.recharge) AS totalRecharge,
		SUM(wa.withdrawal) AS totalWithdrawal,
		SUM(wa.tax) AS totalTax,
		SUM(wa.poundage) AS totalPoundage
	FROM t_club_member cm JOIN t_wallet wa ON (cm.uid = wa.uid) JOIN t_profit p ON cm.uid = p.uid, (SELECT tax, lastTax, profit, lastProfit, inning, lastInning FROM t_club WHERE id = p_cid) c WHERE cm.cid = p_cid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_toggle_notice_status
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_toggle_notice_status`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_toggle_notice_status`(IN `p_id` int,IN `p_status` tinyint)
BEGIN
	#********************** 程序说明开始 **********************
	# 获取公告信息
	# 传入参数：
	#    p_id        需要切换的公告id
	#    p_status    切换状态
	# 返回结果：公告信息
	#**********************程序说明结束 **********************
	UPDATE t_notice SET status = p_status WHERE id = p_id; 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_bind
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_bind`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_bind`(IN VAR_uid BIGINT,
	IN VAR_pid BIGINT)
MAIN:BEGIN
	#**********************程序说明开始 **********************
	# 绑定上级
	# 传入参数：用户ID，推荐人ID
	# 返回结果：1行2列 code[返回码],msg[返回消息]  code为0时代表数据库处理逻辑成功，否则客户端需自行处理错误
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	#！！！！MYSQL 所有变量定义必须在 DML之前！！！！
	DECLARE VAR_db_uid BIGINT DEFAULT -1;	#当前操作用户在数据库中的UID
	DECLARE VAR_db_pid BIGINT DEFAULT 0;	#当前操作用户在数据库中的PID
	DECLARE VAR_db_p_uid BIGINT DEFAULT -1;	#当前操作用户父级在数据库中的UID
	DECLARE VAR_db_p_pid BIGINT DEFAULT 0;	#当前操作用户父级在数据库中的PID
	
	DECLARE VAR_joinclub_maxlimit BIGINT DEFAULT 5; 	#最多允许加入几个俱乐部	
	DECLARE VAR_total_joinclub BIGINT DEFAULT 0; 	#当前用户加入了几个俱乐部
	DECLARE VAR_can_joinclub BIGINT DEFAULT 0; 	#当前用户还可以加入几个俱乐部
	
	
	DECLARE v_pid INT DEFAULT 0;	      #运算过程中的当前用户ID
	DECLARE v_uid INT DEFAULT -1;	      #是否继续 （大于0继续）
	DECLARE i INT DEFAULT 0;	#防止意外最大操作50次
	
	DECLARE v_subordinate_count INT DEFAULT 0; #下级人数
	
	#初始化变量
	SET VAR_joinclub_maxlimit=5;
	#**********************定义变量结束 **********************
	
	
	
	#**********************执行逻辑开始 **********************
	#自己不能绑定自己
	IF (VAR_uid =VAR_pid ) THEN
		SELECT 5004 AS `code`, '用户不存在1' AS `msg`;
		LEAVE  MAIN; 
	END IF;	
	
	
	#查询用户信息
	SELECT `uid`,`invite_code` INTO VAR_db_uid,VAR_db_pid FROM `t_users` WHERE uid=VAR_uid; 
		#判断该用户是否存在
		IF (VAR_db_uid<0) THEN
			SELECT 5004 AS `code`, '用户不存在2' AS `msg`;
			LEAVE  MAIN; 
		END IF;
		#判断是否已经绑定上级
		IF(VAR_db_pid>0) THEN
			SELECT 10006 AS `code`, '已经绑定了上级！' AS `msg`;
			LEAVE  MAIN;
		END IF;
		
		#校验PID的合法性
		SELECT `uid`,`invite_code` INTO VAR_db_p_uid,VAR_db_p_pid FROM `t_users` WHERE uid=VAR_pid; 
                
                #如果上级不是合法用户 或者 上级的PID=0 退出		
		IF(VAR_db_p_uid < 0 OR VAR_db_p_pid = 0) THEN
			SELECT 5004 AS `code`, '父级信息有误！' AS `msg`;
			LEAVE  MAIN;
		END IF;
  #更改当前用户的上级ID	
	update t_users set `invite_code`=VAR_pid, ppid = VAR_db_p_pid, `bind_time`=now()   where uid=VAR_uid;
	
	# 根据邀请人数来设置提成
	SELECT count(*) INTO v_subordinate_count FROM t_users WHERE invite_code = VAR_pid;
	IF (v_subordinate_count >= 50) THEN
		UPDATE t_users SET profit_ratio = 0.4 WHERE uid = VAR_pid AND profit_ratio < 0.4;
	ELSEIF v_subordinate_count >= 30 THEN
		UPDATE t_users SET profit_ratio = 0.36 WHERE uid = VAR_pid AND profit_ratio < 0.36;
	ELSEIF v_subordinate_count >= 10 THEN
		UPDATE t_users SET profit_ratio = 0.33 WHERE uid = VAR_pid AND profit_ratio < 0.33;
	ELSEIF v_subordinate_count >= 5 THEN
		UPDATE t_users SET profit_ratio = 0.30 WHERE uid = VAR_pid AND profit_ratio < 0.30;
	END IF;
	
	
	
	# 所有上级team人数加1
	#CREATE TEMPORARY TABLE IF NOT EXISTS temp_uids(uid INT);
	#SET v_uid = VAR_pid;      #第一个操作对象为传入的用户
	#SELECT uid,invite_code INTO v_uid,v_pid FROM `t_users` WHERE uid = v_uid;
	
	#WHILE (v_uid > 0 && i < 50 ) DO
		#INSERT INTO temp_uids(uid) VALUES (v_uid);
		
		
		#SET v_uid=-1;  #查询到不存在的用户退出
		#SET i=i+1;  #防止意外最大操作50次
		
		
		#SELECT uid,invite_code INTO v_uid,v_pid FROM `t_users` WHERE uid = v_pid;
	#END WHILE;
	#UPDATE t_users u, temp_uids tu SET u.team_count = u.team_count + 1 WHERE u.uid = tu.uid;
	
	
	
	
	
	#强制当前用户继承父级的俱乐部
	#判断当前用户现在加入了几个俱乐部
	SELECT COUNT(1) INTO VAR_total_joinclub FROM `t_club_member` WHERE uid=VAR_uid;
	
	
	#加入了0个俱乐部，直接继承父级所有俱乐部
	IF (VAR_total_joinclub=0) THEN
		#写入俱乐部成员信息
		INSERT INTO `t_club_member`(
			`cid`,
			`uid`,
			`type`,
			`blacklist`,
			`create_time`
		)SELECT				#复制爸爸的所有俱乐部信息，除了UID用自己的
			`cid`,
			VAR_uid,
			0,			#群组权限，0.普通成员 1管理员(股东), 2群主  
			0,			#是否黑名单成员，0不是  1是 
			NOW()
		FROM `t_club_member` WHERE uid=VAR_pid;      	
		
		
		#输出信息
		SELECT 200 AS `code`, '绑定成功！' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	
	
	#加入了5个俱乐部，不继承
	IF (VAR_total_joinclub=5) THEN
		SELECT 200 AS `code`, '绑定成功！' AS `msg`;
		LEAVE MAIN;
	END IF;
	
	
	
	#VAR_total_joinclub 非0和非5处理
	#计算还可以加入几个俱乐部
	SET VAR_can_joinclub=VAR_joinclub_maxlimit-VAR_total_joinclub;
	
	#写入俱乐部成员信息
	INSERT INTO `t_club_member`(
			`cid`,
			`uid`,
			`type`,
			`blacklist`,
			`create_time`
	)SELECT				#复制父级的 LIMIT[VAR_can_joinclub]条记录 按时间降序 的俱乐部信息，除了UID用自己的
			`cid`,
			VAR_uid,
			0,			#群组权限，0.普通成员 1管理员(股东), 2群主  
			0,			#是否黑名单成员，0不是  1是 
			NOW()
	FROM `t_club_member` 
	WHERE uid=VAR_pid AND
	`cid` NOT IN(SELECT `cid` FROM `t_club_member` WHERE `uid`=VAR_uid)   #查询父级的俱乐部 需要排除子级已经拥有的俱乐部 （去重）
	ORDER BY `create_time` DESC LIMIT VAR_can_joinclub;
		
	
		
	#输出信息
	SELECT 200 AS `code`, '绑定成功！' AS `msg`;
	LEAVE MAIN;
	
	
	#**********************执行逻辑结束 **********************
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_bind_wechat
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_bind_wechat`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_bind_wechat`(IN p_uid INT,
	IN p_nickname VARCHAR(1000),
	IN p_realname VARCHAR(1000),
	IN p_headimgurl VARCHAR(1000),
	IN p_openid   VARCHAR(125))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 绑定微信出款号
	# 传入参数：
	#    p_uid            玩家UID
	#    p_nickname       微信昵称
	#    p_realname       微信实名
	#    p_headimgurl     微信头像
	#    p_openid         微信openid
	# 返回结果：code, msg
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_score INT DEFAULT 0;
	DECLARE var_uid INT DEFAULT 0;
	DECLARE var_count INT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1
        _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	
	#**********************执行逻辑开始 **********************
	INSERT INTO t_wechat(uid, nickname, realname, headimg, openid) VALUES(p_uid, p_nickname, p_realname, p_headimgurl, p_openid)
	ON DUPLICATE KEY UPDATE 
										update_time = NOW(), 
										nickname = VALUES(nickname), 
										realname = VALUES(realname),
										headimg = VALUES(headimg);
		
		IF (_ERROR != 0) THEN
			SELECT _ERROR AS `code`, _ERROR_MSG AS `msg`;
			LEAVE MAIN; 
		END IF;
	
	#输出信息
	SELECT 200 AS `code`, '绑定成功！' AS `msg`;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_create
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_create`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_create`(IN p_account VARCHAR(64),
	IN p_nickname VARCHAR(128),
	IN p_sex BIGINT,
	IN p_headimg VARCHAR(256))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 创建游戏用户
	# 传入参数：
	#    p_account          账号
	#    p_nickname         昵称
	#    p_sex              性别 0=无1男2女
	#    p_headimg          头像地址
	# 返回创建用户的uid
	#**********************程序说明结束 **********************
  #**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_uid INT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1
        _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	
	
	#********************* 逻辑运行开始 **********************
	# 判断用户是否存在
	SELECT `uid` INTO v_uid FROM t_users WHERE `account` = p_account;
	IF (v_uid = 0) THEN
		SET v_uid = f_generate_uid();
		INSERT INTO 
			t_users 
		SET
			`uid` = v_uid,
			`account` = p_account,
			`name` = p_nickname,
			`sex`  = p_sex,
			`location` = '{}',
			`headimg` = p_headimg;
			
		# 如果发生错误，则直接返回错误类型
		IF (_ERROR != 0) THEN
			SELECT _ERROR AS `code`, _ERROR_MSG AS `msg`;
			LEAVE MAIN; 
		END IF;
	ELSE 
		UPDATE 
			t_users 
		SET 
			`name` = p_nickname,
			`sex` = p_sex,
			`headimg` = p_headimg
		WHERE `uid` = v_uid;
	END IF;
	#********************* 逻辑运行结束 **********************
	
	
	
	SELECT 200 AS `code`, v_uid AS uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_get_bind_info
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_get_bind_info`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_get_bind_info`(IN p_uid INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 获取用户绑定的微信，手机号，收款码
	# 传入参数：
	#    p_uid          用户uid
	# 返回用户信息
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_mobile VARCHAR(32) DEFAULT '';
	DECLARE v_paymenturl VARCHAR(512) DEFAULT '';
	DECLARE v_nickname   VARCHAR(64)  DEFAULT '';
	DECLARE v_realname   VARCHAR(64)  DEFAULT '';
	DECLARE v_headimg    VARCHAR(512) DEFAULT '';
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	
	
	SELECT mobile INTO v_mobile FROM t_users WHERE uid = p_uid LIMIT 1;
	SELECT paymenturl INTO v_paymenturl FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT nickname, realname, headimg INTO v_nickname, v_realname, v_headimg FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	
	SELECT v_mobile AS mobile, v_paymenturl AS paymenturl, v_nickname AS nickname, v_realname AS realname, v_headimg AS headimg;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_login_info
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_login_info`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_login_info`(IN `p_uid` int)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 用户登录后需要的数据
	# 传入参数：
	#    p_uid          
	# 返回登录后需要缓存到内存的用户数据
	#**********************程序说明结束 **********************
	
	
	
	#**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_paymentUrl VARCHAR(512) DEFAULT '';
	DECLARE v_paymentName VARCHAR(64) DEFAULT '';
	
	DECLARE v_nickname   VARCHAR(64)  DEFAULT '';
	DECLARE v_realname   VARCHAR(64)  DEFAULT '';
	DECLARE v_headimg    VARCHAR(512) DEFAULT '';
	DECLARE v_cid        INT DEFAULT 0;
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	SELECT nickname, realname, headimg INTO v_nickname, v_realname, v_headimg FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT paymenturl, `name` INTO v_paymentUrl, v_paymentName FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT cid INTO v_cid FROM t_club_member WHERE uid = p_uid ORDER BY create_time DESC LIMIT 1;
	
	SELECT 
		*, 
		(SELECT blacklist FROM t_club_member WHERE uid = p_uid AND cid = v_cid) AS blacklist,
		(SELECT count(1) FROM t_users WHERE invite_code = p_uid) AS subordinateCount,
		v_cid AS cid,
		v_nickname AS wxNickname, v_realname AS wxRealname, v_headimg AS wxHeadimg, v_paymentUrl AS paymentUrl, v_paymentName AS paymentName
	FROM t_users u JOIN t_wallet w ON u.uid = w.uid WHERE u.uid = p_uid;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_recharge
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_recharge`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_recharge`(IN `p_uid` int, 
IN `p_prop_id` int,
IN `p_agent_id` VARCHAR(256),
IN `p_channel`  int,
IN `p_remark`   VARCHAR(4000),
IN `p_poundage` DECIMAL(5,4))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 人工充值
	# 传入参数：
	#    p_uid         用户ID
	#    p_prop_id     充值道具ID
	#    p_agent_id    商户ID
	#    p_channel     渠道号
	#    p_remark      备注
	# 返回结果：code， msg  200成功，其它错误
	#**********************程序说明结束 **********************
	
	
	
	
	#**********************定义变量开始 **********************
	DECLARE var_order_sn     VARCHAR(32)   DEFAULT '';        #本地订单号
	DECLARE var_buy_number   INT           DEFAULT 0;         #道具积分
	DECLARE var_price        DECIMAL(7, 2) DEFAULT 0.00;      #道具价格 
	DECLARE var_goods_name   VARCHAR(16)   DEFAULT '';        #道具名字
	DECLARE var_code         INT           DEFAULT 0;         #设置订单成功的状态码
	DECLARE var_cid         INT            DEFAULT 0;         #设置订单俱乐部ID
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1
        _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	#****************** 变量赋值 ***************************
	# 生成订单号
	SET var_order_sn = CONCAT('joycenter', DATE_FORMAT(NOW(),'%Y%m%d%k%i%s'), CAST(FLOOR(RAND() * 899999 + 100000) AS UNSIGNED));
	
	# 查找道具信息
	SELECT count, price, `name` INTO var_buy_number, var_price, var_goods_name FROM t_prop WHERE id = p_prop_id;
	
	SELECT cid INTO var_cid FROM t_club_member WHERE uid = p_uid;
	
	#判断是否存在这个道具
	IF(var_buy_number = 0) THEN 
		SELECT 2000 code, '没有这个道具' msg;
		LEAVE MAIN;
	END IF;
	
	#玩家是否存在
	IF( (SELECT count(*) FROM t_users WHERE uid = p_uid) = 0 ) THEN
		SELECT 2001 code, '没有这个玩家' msg;
		LEAVE MAIN;
	END IF;
	
	# 插入订单
	INSERT INTO t_orders SET 
		order_sn = var_order_sn,
		uid = p_uid,
		operator_uid = p_uid,
		goods_id = p_prop_id,
		agent_id = p_agent_id,
		pay_channel = p_channel,
		buy_number = var_buy_number,
		pay_money = var_price,
		goods_name = var_goods_name,
		remark = p_remark,
		poundage = (var_buy_number * p_poundage),
		cid = var_cid;   
		
	IF(_ERROR != 0)THEN
		SELECT _ERROR AS `code`, _ERROR_MSG AS `msg`;
		LEAVE MAIN; 
	END IF;
	SELECT 200 AS `code`, "成功" AS `msg`, var_order_sn AS orderSn, var_price AS price;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_sealUp
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_sealUp`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_sealUp`(IN `p_uid` int)
MAIN:BEGIN
	#封闭用户账号
	UPDATE t_users SET sealUp = IF(sealUp = 0, 1, 0)  WHERE  uid = p_uid;
	
	SELECT 200 AS `code`, '设置成功' AS `msg`, ROW_COUNT() AS `changedRow`, FOUND_ROWS() AS `affectedRow`, (SELECT sealUp FROM t_users WHERE uid = p_uid) AS sealUp;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_search
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_search`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_search`(IN p_uid INT(6))
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 搜索用户信息
	# 传入参数：
	#    p_uid          用户uid
	# 返回用户信息
	#**********************程序说明结束 **********************
 #**********************定义变量开始 **********************
	# 程序变量
	DECLARE v_uid INT DEFAULT 0;
	DECLARE v_name VARCHAR(256) DEFAULT '';
	DECLARE v_invite_code INT DEFAULT 0;
	DECLARE v_login_ip VARCHAR(64) DEFAULT '';
	DECLARE v_total_inning INT DEFAULT 0;
	DECLARE v_super_uid INT DEFAULT 0;
	DECLARE v_super_name VARCHAR(256) DEFAULT '';
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	SELECT u.uid, u.`name`,u.sex, u.headimg, u.profit_ratio, u.invite_code, u.total_inning, w.score, f_user_parents(p_uid) AS parents FROM t_users u JOIN t_wallet w ON u.uid = w.uid WHERE u.uid = p_uid; 
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_subordinates
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_subordinates`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_subordinates`(IN p_category INT,
	IN p_uid INT,
	IN p_page INT,
	IN p_size INT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 搜索用户信息
	# 传入参数：
	#    p_category      0=下属下级，1=从属下级；2=玩家
	#    p_uid           用户uid
	#    p_page          查询页数
	#    p_size          每页数量
	# 返回用户信息结果集
	#**********************程序说明结束 **********************
	
	
	#**********************定义变量开始 **********************
	DECLARE var_total_page BIGINT;            # 共多少页
	DECLARE var_count BIGINT DEFAULT  0;      # 总记录数
	DECLARE var_limit_start BIGINT DEFAULT 0; # 开始位置
	
	# 过程变量（容错）
	-- DECLARE _ERROR INTEGER DEFAULT 0;    
	-- DECLARE _ERROR_MSG TEXT;
	-- DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
	-- 	BEGIN 
			# 获取异常code,异常信息
  --     GET DIAGNOSTICS CONDITION 1
  --       _ERROR = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT;
	-- 	END;
	#**********************定义变量结束 **********************
	
	
	
	
	#********************* 逻辑运行开始 **********************
	IF (p_category = 0) THEN 
		SET var_count = (SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio > 0);
	ELSEIF (p_category = 1) THEN
		SET var_count = (SELECT count(*) FROM t_users WHERE ppid = p_uid AND profit_ratio > 0);
	ELSEIF (p_category = 2) THEN
		SET var_count = (SELECT count(*) FROM t_users WHERE invite_code = p_uid AND profit_ratio = 0);
	END IF;
	
	SET p_page = IF(p_page < 1, 1, p_page);
	SET p_size = IF(p_size < 1, 1, p_size);
	SET var_limit_start= (p_page - 1) * p_size;
	SET var_total_page = ceiling(var_count / p_size);
	
	IF (p_category = 0) THEN
		SELECT 
			var_count AS count,
			var_total_page AS totalPage,
			u.uid, 
			u.`name`, 
			u.headimg, 
			p.today_profit,
			DATE_FORMAT(u.create_time, '%Y-%m-%d %H:%i:%s') AS create_time, 
			(u.total_inning - u.last_inning) AS inning 
		FROM t_users AS u
		INNER JOIN t_profit AS p
		ON u.uid = p.uid
		WHERE u.invite_code = p_uid AND u.profit_ratio > 0
		ORDER BY u.create_time DESC
		LIMIT var_limit_start, p_size;
	ELSEIF(p_category = 1) THEN
		SELECT 
			var_count AS count,
			var_total_page AS totalPage,
			u.uid, 
			u.`name`, 
			u.headimg, 
			p.today_profit,
			DATE_FORMAT(u.create_time, '%Y-%m-%d %H:%i:%s') AS create_time, 
			(u.total_inning - u.last_inning) AS inning 
		FROM t_users AS u
		INNER JOIN t_profit AS p
		ON u.uid = p.uid
		WHERE u.ppid = p_uid AND u.profit_ratio > 0
		ORDER BY u.create_time DESC
		LIMIT var_limit_start, p_size;
	ELSEIF (p_category = 2) THEN
		SELECT 
			var_count AS count,
			var_total_page AS totalPage,
			uid, 
			`name`, 
			headimg, 
			DATE_FORMAT(create_time, '%Y-%m-%d %H:%i:%s') AS create_time, 
			(total_inning - last_inning) AS inning 
		FROM t_users
		WHERE invite_code = p_uid AND profit_ratio = 0
		ORDER BY create_time DESC
		LIMIT var_limit_start, p_size;
	END IF;
		
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_user_withdraw
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_user_withdraw`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_user_withdraw`(IN `p_cid` INT,
	IN `p_uid` INT,
	IN `p_score` BIGINT)
MAIN:BEGIN
	#********************** 程序说明开始 **********************
	# 用户提现
	# 传入参数：
	#    p_cid       俱乐部id
	#    p_uid       提现玩家
	#    p_score     提现分数
	# 返回结果：分数改变后的结果 code,uid,score
	#**********************程序说明结束 **********************
	#**********************定义变量开始 **********************
	#程序变量
	DECLARE v_poundage BIGINT DEFAULT 0;		#手续费
	DECLARE v_deduction_score BIGINT DEFAULT 0;  #实际扣除的分数(包含手续费)
	DECLARE v_min_withdraw BIGINT DEFAULT 0; #最小提现金额
	DECLARE v_max_withdraw BIGINT DEFAULT 0; #最大提现金额
	DECLARE v_ordersn VARCHAR(255) DEFAULT CONCAT('001', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), FLOOR((1000000 + RAND() * 9000000)));
	DECLARE v_payment INT DEFAULT 0;
	DECLARE v_wechat  INT DEFAULT 0;
	DECLARE v_surplus_score BIGINT DEFAULT 0;
	
	# 过程变量（容错）
	DECLARE _SQLSTATE CHAR(5) DEFAULT ""; 
	DECLARE _ERROR INT DEFAULT 0;   
	DECLARE _ERROR_MSG TEXT;
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION 
		BEGIN 
			# 获取异常code,异常信息
      GET DIAGNOSTICS CONDITION 1 _SQLSTATE = RETURNED_SQLSTATE, _ERROR_MSG = MESSAGE_TEXT, _ERROR =  MYSQL_ERRNO;
		END;
	#**********************定义变量结束 **********************
	
	
	
	
	
	#**********************执行逻辑开始 **********************
	#计算手续费
	SELECT `value` * `p_score` INTO v_poundage FROM t_config WHERE `key` = 'withdraw_poundage';
	SET v_deduction_score = `p_score` + v_poundage;
	SELECT `value` INTO v_min_withdraw FROM t_config WHERE `key` = 'min_withdraw';
	SELECT `value` INTO v_max_withdraw FROM t_config WHERE `key` = 'max_withdraw';
	
	SELECT count(*) INTO v_payment FROM t_payment_code WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	SELECT count(*) INTO v_wechat  FROM t_wechat WHERE uid = p_uid ORDER BY update_time DESC limit 1;
	
	IF (v_payment = 0 AND v_wechat = 0) THEN
		SELECT 5020 AS `code`, "未上传收款信息" AS `msg`;
		LEAVE MAIN;
	END IF;
	
	IF (p_score < (v_min_withdraw * 10000) AND p_score > (v_max_withdraw * 10000)) THEN
		SELECT 10045 AS `code`, CONCAT('提现分数必须大于', v_min_withdraw, "并且小于", v_max_withdraw) AS `msg`;
		LEAVE MAIN;
	END IF;
	
	# 开始事务
	START TRANSACTION;
	  #删除玩家的分数
		UPDATE 
			t_wallet
		SET 
			score = score - v_deduction_score, 
			withdrawal = withdrawal + `p_score`, 
			poundage = poundage + v_poundage
		WHERE 
			uid = `p_uid` AND score >= v_deduction_score;
			
		# 查出剩余分数
		SELECT score INTO v_surplus_score FROM t_wallet WHERE uid = p_uid;
		
		IF (ROW_COUNT() > 0) THEN
			#插入提现订单
			INSERT INTO t_withdraw_order SET uid = p_uid, score=p_score, poundage = v_poundage, order_sn = v_ordersn, surplus_score = v_surplus_score, cid = p_cid;
			
			#更新俱乐部玩家提现总手续费
			UPDATE 
				t_club
			SET 
				withdrawPoundage = withdrawPoundage + v_poundage,
				withdrawal = withdrawal + p_score
			WHERE 
				id = p_cid;
			
			#发生错误，则返回错误代码与错误信息
			IF (_ERROR != 0) THEN
				ROLLBACK;
				SELECT _ERROR AS `code`, _SQLSTATE AS `sqlstate`, _ERROR_MSG AS `msg`;
				LEAVE MAIN; 
			END IF;
			# 如果成功，则返回成功后的分数
			SELECT 200 AS code, p_uid AS uid, LAST_INSERT_ID() AS insertId, v_surplus_score AS score;
		ELSE
			SELECT 10035 AS code, p_uid AS uid, (SELECT score FROM t_wallet WHERE uid = p_uid) AS score;
			ROLLBACK;
			LEAVE MAIN;
		END IF;
	COMMIT;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for sp_version_get
-- ----------------------------
DROP PROCEDURE IF EXISTS `sp_version_get`;
delimiter ;;
CREATE PROCEDURE `chess`.`sp_version_get`(IN p_ossys VARCHAR(32),
	IN p_osbuild INT,
	IN p_version VARCHAR(32))
MAIN:BEGIN
	#**********************程序说明开始 **********************
	#程序说明:获取版本号
	#传入参数：
	#  p_ossys    系统
	#  p_osbuild    build号
	#  p_version    版本名
	#返回结果：信息
	#**********************程序说明结束 **********************
	
	
	
	
	
	#**********************执行逻辑开始 **********************
	SELECT remark, downloadUrl, version FROM t_version WHERE os = p_ossys AND build > p_osbuild;
	
END
;;
delimiter ;

-- ----------------------------
-- Event structure for del_data
-- ----------------------------
DROP EVENT IF EXISTS `del_data`;
delimiter ;;
CREATE EVENT `chess`.`del_data`
ON SCHEDULE
EVERY '1' DAY STARTS '2019-03-28 00:00:00'
COMMENT '每天0点执行删除\n只保留最近的数据'
DO BEGIN
	############## 程序说明 ###################
	# 每天00:00执行，清空数据，和统计数据
	########################################### 
	
	############# 定义变量 #################
	#DECLARE var_today_profit INT DEFAULT 0;
	#DECLARE var_dealer_today_profit INT DEFAULT 0;
	
	# 清空每日利润
	UPDATE t_profit SET today_profit = 0;
	
	# 保存0点时用户的局数 计算玩家的每日局数
	UPDATE t_users SET last_inning = total_inning;
	
	# 保存0点时的俱乐部局数
	UPDATE t_club SET lastInning = inning, lastTax = tax, lastProfit = profit;
	
	
	#只保留最近3天的战绩数据
	DELETE FROM t_history WHERE DATE(create_time) < DATE_SUB(CURDATE(), INTERVAL 3 DAY);
	#关联表，提升单个玩家的战绩查询数据
	DELETE FROM t_history_relation WHERE date_format(from_unixtime(htime),'%Y-%m-%d %h:%i:%s') < DATE_SUB(CURDATE(), INTERVAL 3 DAY);
	
	#保留最近3天的充值记录
	#DELETE FROM t_orders WHERE DATE(create_time) < DATE_SUB(CURDATE(), INTERVAL 3 DAY);
	
	#保留最近3天的赠送记录
	#DELETE FROM t_givescore WHERE DATE(create_time) < DATE_SUB(CURDATE(), INTERVAL 3 DAY);
	
	#保留最近3天的玩家下分记录 未处理的不删除
	#DELETE FROM t_withdraw_order WHERE `status` > 0 AND DATE(create_time) < DATE_SUB(CURDATE(), INTERVAL 3 DAY);
	
	#保留最近3天的代理下分记录 未处理的不删除
	#DELETE FROM t_withdraw_dealer WHERE `status` > 0 AND DATE(create_time) < DATE_SUB(CURDATE(), INTERVAL 3 DAY);
	
	#保留最近10天的统计记录
	#DELETE FROM t_statistics WHERE DATE(create_time) < DATE_SUB(CURDATE(), INTERVAL 10 DAY);
	
END
;;
delimiter ;

-- ----------------------------
-- Event structure for ev_statistics
-- ----------------------------
DROP EVENT IF EXISTS `ev_statistics`;
delimiter ;;
CREATE EVENT `chess`.`ev_statistics`
ON SCHEDULE
EVERY '1' DAY STARTS '2020-05-26 00:00:00'
COMMENT '每天0点执行删除\n只保留最近的数据'
DO BEGIN
	############## 程序说明 ###################
	# 每天00:00执行，清空数据，和统计数据
	########################################### 
	
	
	
	
	############# 定义变量 #################
	DECLARE v_days                INT(10)            DEFAULT   TO_DAYS(now()) - 1;
	DECLARE v_tax                 BIGINT(20)         DEFAULT   0;
	DECLARE v_inning              INT(10)            DEFAULT   0;
	DECLARE v_recharge            BIGINT(20)         DEFAULT   0;
	DECLARE v_profitRecharge      BIGINT(20)         DEFAULT   0;
	DECLARE v_rechargePoundage    BIGINT(20)         DEFAULT   0;
	DECLARE v_withdraw            BIGINT(20)         DEFAULT   0;
	DECLARE v_uwPoundage          BIGINT(20)         DEFAULT   0;
	DECLARE v_dwPoundage          BIGINT(20)         DEFAULT   0;
	DECLARE v_totalProfit         BIGINT(20)         DEFAULT   0;
	DECLARE v_playerScore         BIGINT(20)         DEFAULT   0;
	DECLARE v_dealerScore         BIGINT(20)         DEFAULT   0;
	DECLARE v_totalUsers          BIGINT(20)         DEFAULT   0;
	DECLARE v_activeUsers         BIGINT(20)         DEFAULT   0;
	DECLARE v_creatorProfit       BIGINT(20)         DEFAULT   0;
	#************ 定义变量结束 ***************#
	
	
	
	
	
	#************ 逻辑开始 *************#
	# 玩家钱包数据
	SELECT SUM(tax), SUM(recharge), SUM(profit), SUM(withdrawal), SUM(score), count(1)
	INTO v_tax, v_recharge, v_profitRecharge, v_withdraw, v_playerScore, v_totalUsers  FROM t_wallet;
	
	# 利润数据
	SELECT SUM(profit), SUM(total_profit) INTO v_dealerScore, v_totalProfit  FROM t_profit;
	
	# 充值手续费，玩家提现手续费，代理提现手续费，群主收益
	SELECT SUM(rechargePoundage), SUM(uwWithdrawPoundage), SUM(dwWithdrawPoundage), SUM(creatorProfit) 
	INTO v_rechargePoundage, v_uwPoundage, v_dwPoundage, v_creatorProfit FROM t_club;
	
	# 局数统计
	SELECT count(*) INTO v_inning FROM t_history WHERE v_days = TO_DAYS(create_time);
	
	# 参战玩家数统计
	SELECT count(DISTINCT uid) INTO v_activeUsers from t_history_relation WHERE htime BETWEEN UNIX_TIMESTAMP(CAST(now() AS DATE) - INTERVAL 1 DAY) AND UNIX_TIMESTAMP(CAST(now() AS DATE));
	
	INSERT INTO t_statistics(
			days, 
			tax, 
			inning, 
			recharge, 
			rechargePoundage, 
			profitRecharge,
			withdraw, 
			uwPoundage, 
			dwPoundage, 
			dealerProfit, 
			playerScore, 
			dealerScore, 
			totalUsers, 
			activeUsers,
			creatorProfit) 
	VALUES(
			v_days,
			v_tax,
			v_inning,
			v_recharge,
			v_rechargePoundage,
			v_profitRecharge,
			v_withdraw,
			v_uwPoundage,
			v_dwPoundage,
			v_totalProfit,
			v_playerScore,
			v_dealerScore,
			v_totalUsers,
			v_activeUsers,
			v_creatorProfit);
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
