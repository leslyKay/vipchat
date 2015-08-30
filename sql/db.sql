CREATE TABLE `chat_record` (  `id` bigint(12) NOT NULL AUTO_INCREMENT COMMENT '主键',  `user_name` varchar(32) COLLATE utf8_unicode_ci NOT NULL DEFAULT '' COMMENT '用户名',  `ip` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'ip',  `message_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '消息时间',  `message` text COLLATE utf8_unicode_ci NOT NULL COMMENT '消息内容',  `message_type` varchar(12) COLLATE utf8_unicode_ci NOT NULL DEFAULT '1' COMMENT '消息类型，1：文字，2：图片，3：系统消息',  `group` bigint(12) NOT NULL DEFAULT '1' COMMENT '分组id',  `group_name` varchar(64) COLLATE utf8_unicode_ci NOT NULL DEFAULT '默认分组' COMMENT '分组名称',  `user_id` bigint(12) NOT NULL DEFAULT '0' COMMENT '用户id',  PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci