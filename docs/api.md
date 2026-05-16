Hãy tạo mock-test dữ liệu cho list conv với : type ConversationListItem struct {
	ID             string  `json:"id"`
	Type           int8    `json:"type"` // 1: DM, 2: Group, 3: Channel
	Name           *string `json:"name,omitempty"`
	Description    *string `json:"description,omitempty"`
	AvatarURL      *string `json:"avatar_url,omitempty"`
	CreateBy       *string `json:"created_by,omitempty"`
	LastMessageID  *string `json:"last_message_id,omitempty"`
	LastActivityAt *string `json:"last_activity_at,omitempty"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`

	Role        int8  `json:"role"`
	IsMuted     bool  `json:"is_muted"`
	UnreadCount int64 `json:"unread_count"`

	LastMessageText *string `json:"last_message_text,omitempty"`
}. Khi triển khai đảm bảo sau này tích hợp api thật dễ triển khai tránh phức tạp. Nếu có sửa đổi giao diện thì không thay đổi style giao diện bám vào #file:chat.css  và #file:icons.tsx  hoặc "@heroicons/react": "^2.2.0", nếu cần