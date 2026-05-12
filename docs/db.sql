
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
--  1. USERS
-- =============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`             CHAR(36)        NOT NULL                     COMMENT 'UUID v4',
  `username`       VARCHAR(50)     NOT NULL                     COMMENT "Tên Người dung ( không đăng nhập được )",
  `email`          VARCHAR(255)    NOT NULL                     COMMENT 'Email đăng nhập',
  `avatar_url`     VARCHAR(512)    DEFAULT NULL                 COMMENT 'URL ảnh đại diện',
  `bio`            VARCHAR(300)    DEFAULT NULL                 COMMENT 'Giới thiệu bản thân',
  `status`         ENUM('active','suspended','deactivated')
                                   NOT NULL DEFAULT 'active'   COMMENT 'Trạng thái tài khoản',
  `last_seen_at`   DATETIME        DEFAULT NULL                 COMMENT 'Lần cuối online',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `uq_users_username`        (`username`),
  UNIQUE KEY `uq_users_email`    (`email`),
  KEY `idx_users_status`         (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tài khoản người dùng';

-- =============================================================
--  2. OAUTH ACCOUNTS  (Google, Facebook, GitHub, Apple…)
-- =============================================================
CREATE TABLE IF NOT EXISTS `oauth_accounts` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      CHAR(36)        NOT NULL,
  `provider`     VARCHAR(50)     NOT NULL                      COMMENT 'google | facebook | github | apple',
  `provider_uid` VARCHAR(255)    NOT NULL                      COMMENT 'sub / id trả về từ provider',
  `raw_profile`  JSON            DEFAULT NULL                  COMMENT 'Payload gốc từ provider',
  `created_at`   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_oauth_provider_uid` (`provider`, `provider_uid`),
  KEY `idx_oauth_user`               (`user_id`),
 
  CONSTRAINT `fk_oauth_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tài khoản OAuth2 liên kết với user';

-- =============================================================
--  3. USER TOKENS  (JWT 30 ngày)
--     Lưu lại để:  revoke chủ động | đa thiết bị | audit
--     Không lưu toàn bộ JWT — chỉ lưu jti (JWT ID) để lookup
-- =============================================================
CREATE TABLE IF NOT EXISTS `user_tokens` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    CHAR(36)        NOT NULL,
  `jti`        CHAR(36)        NOT NULL                        COMMENT 'JWT ID — claim "jti" trong token',
  `device_hint`VARCHAR(200)    DEFAULT NULL                    COMMENT 'User-Agent / tên thiết bị rút gọn',
  `ip_address` VARCHAR(45)     DEFAULT NULL                    COMMENT 'IPv4 hoặc IPv6',
  `expires_at` DATETIME        NOT NULL                        COMMENT 'issued_at + 30 ngày',
  `revoked_at` DATETIME        DEFAULT NULL                    COMMENT 'NULL = còn hiệu lực',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token_jti`  (`jti`),
  KEY `idx_token_user`       (`user_id`),
  KEY `idx_token_expires`    (`expires_at`),
 
  CONSTRAINT `fk_token_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='JWT đang hoạt động — 30 ngày, hỗ trợ revoke';
  
-- =============================================================
--  3. CONVERSATIONS  (DM hoặc Group)
-- =============================================================
CREATE TABLE IF NOT EXISTS `conversations` (
  `id`               CHAR(36)    NOT NULL,
  `type`             ENUM('direct','group','channel') NOT NULL DEFAULT 'direct',
  `name`             VARCHAR(100) DEFAULT NULL                 COMMENT 'Tên nhóm (null với DM)',
  `avatar_url`       VARCHAR(512) DEFAULT NULL,
  `description`      VARCHAR(500) DEFAULT NULL,
  `created_by`       CHAR(36)    NOT NULL                      COMMENT 'Người tạo hội thoại',
  `last_message_id`  CHAR(36)    DEFAULT NULL                  COMMENT 'Tin nhắn mới nhất (denormalized)',
  `last_activity_at` DATETIME    DEFAULT NULL                  COMMENT 'Thời điểm có hoạt động mới nhất',
  `created_at`       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_conv_creator`        (`created_by`),
  KEY `idx_conv_last_activity`  (`last_activity_at` DESC),

  CONSTRAINT `fk_conv_creator`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Hội thoại — DM hoặc nhóm';


-- =============================================================
--  4. CONVERSATION MEMBERS
-- =============================================================
CREATE TABLE IF NOT EXISTS `conversation_members` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` CHAR(36)   NOT NULL,
  `user_id`         CHAR(36)   NOT NULL,
  `role`            ENUM('owner','admin','member') NOT NULL DEFAULT 'member',
  `is_muted`        TINYINT(1) NOT NULL DEFAULT 0            COMMENT '1 = tắt thông báo',
  `last_read_at`    DATETIME   DEFAULT NULL                  COMMENT 'Mốc thời gian đã đọc — tính unread',
  `joined_at`       DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv_member`        (`conversation_id`, `user_id`),
  KEY `idx_members_user`             (`user_id`, `last_read_at`),
  KEY `idx_members_conv`             (`conversation_id`),

  CONSTRAINT `fk_members_conv`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_user`
    FOREIGN KEY (`user_id`)         REFERENCES `users`         (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thành viên trong hội thoại';


-- =============================================================
--  5. MESSAGES
-- =============================================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id`              CHAR(36)   NOT NULL,
  `conversation_id` CHAR(36)   NOT NULL,
  `sender_id`       CHAR(36)   NOT NULL,
  `parent_id`       CHAR(36)   DEFAULT NULL                   COMMENT 'Reply / thread — self reference',
  `type`            ENUM('text','image','file','audio','video','system') NOT NULL DEFAULT 'text',
  `content`         TEXT       DEFAULT NULL                   COMMENT 'Nội dung tin nhắn',
  `is_edited`       TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted`      TINYINT(1) NOT NULL DEFAULT 0             COMMENT 'Soft delete',
  `created_at`      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  -- Query chính: lấy tin theo conversation + phân trang
  KEY `idx_messages_conv_created`  (`conversation_id`, `created_at` DESC),
  KEY `idx_messages_sender`        (`sender_id`),
  KEY `idx_messages_parent`        (`parent_id`),
  -- Full-text search nội dung
  FULLTEXT KEY `ft_messages_content` (`content`),

  CONSTRAINT `fk_messages_conv`
    FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender`
    FOREIGN KEY (`sender_id`)       REFERENCES `users`         (`id`),
  CONSTRAINT `fk_messages_parent`
    FOREIGN KEY (`parent_id`)       REFERENCES `messages`      (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Tin nhắn — core table';


-- =============================================================
--  6. ATTACHMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS `attachments` (
  `id`             CHAR(36)        NOT NULL,
  `message_id`     CHAR(36)        NOT NULL,
  `file_name`      VARCHAR(255)    NOT NULL,
  `file_url`       VARCHAR(512)    NOT NULL                   COMMENT 'S3 / CDN URL',
  `mime_type`      VARCHAR(100)    NOT NULL,
  `file_size_bytes` INT UNSIGNED   NOT NULL DEFAULT 0,
  `width`          SMALLINT        DEFAULT NULL               COMMENT 'Pixels (ảnh/video)',
  `height`         SMALLINT        DEFAULT NULL               COMMENT 'Pixels (ảnh/video)',
  `duration_sec`   SMALLINT        DEFAULT NULL               COMMENT 'Giây (audio/video)',
  `created_at`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_attachments_message` (`message_id`),

  CONSTRAINT `fk_attachments_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='File đính kèm trong tin nhắn';


-- =============================================================
--  7. MESSAGE REACTIONS  (emoji)
-- =============================================================
CREATE TABLE IF NOT EXISTS `message_reactions` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `message_id` CHAR(36)        NOT NULL,
  `user_id`    CHAR(36)        NOT NULL,
  `emoji`      VARCHAR(10)     NOT NULL                       COMMENT 'Unicode emoji, vd: 👍 😂',
  `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  -- Mỗi user chỉ được react 1 loại emoji trên 1 tin nhắn
  UNIQUE KEY `uq_reaction`           (`message_id`, `user_id`, `emoji`),
  KEY `idx_reactions_message`        (`message_id`),

  CONSTRAINT `fk_reactions_message`
    FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reactions_user`
    FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Reaction emoji trên tin nhắn';


-- =============================================================
--  8. FRIEND REQUESTS / CONTACTS
-- =============================================================
CREATE TABLE IF NOT EXISTS `user_contacts` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    CHAR(36)   NOT NULL                            COMMENT 'Người gửi lời mời',
  `contact_id` CHAR(36)   NOT NULL                            COMMENT 'Người được mời',
  `status`     ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending',
  `created_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contact_pair`   (`user_id`, `contact_id`),
  KEY `idx_contact_contact_id`   (`contact_id`),
  KEY `idx_contact_status`       (`user_id`, `status`),

  CONSTRAINT `fk_contact_user`
    FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contact_target`
    FOREIGN KEY (`contact_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Danh bạ & trạng thái kết bạn';


-- =============================================================
--  9. NOTIFICATIONS  (lưu lại để hiển thị inbox)
-- =============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`          CHAR(36)    NOT NULL,
  `user_id`     CHAR(36)    NOT NULL                          COMMENT 'Người nhận',
  `type`        VARCHAR(50) NOT NULL                          COMMENT 'message, reaction, friend_request...',
  `title`       VARCHAR(200) NOT NULL,
  `body`        VARCHAR(500) DEFAULT NULL,
  `payload`     JSON         DEFAULT NULL                     COMMENT 'Extra data (conv_id, message_id...)',
  `is_read`     TINYINT(1)  NOT NULL DEFAULT 0,
  `created_at`  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_notif_user_read`  (`user_id`, `is_read`, `created_at` DESC),

  CONSTRAINT `fk_notif_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thông báo trong ứng dụng';


-- =============================================================
--  10. FK ngược: conversations.last_message_id → messages
--  (Thêm sau khi cả 2 bảng đã tồn tại để tránh circular ref)
-- =============================================================
ALTER TABLE `conversations`
  ADD CONSTRAINT `fk_conv_last_message`
    FOREIGN KEY (`last_message_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL;


SET FOREIGN_KEY_CHECKS = 1;

