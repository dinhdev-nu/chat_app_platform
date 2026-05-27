import {
  formatVietnamDate,
  formatVietnamTime,
  getVietnamDayDiffFromNow,
} from "./chat-time-utils";

export type ConversationType = 1 | 2 | 3;
export type ConversationRole = 1 | 2 | 3;

export interface ConversationListItem {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  createBy?: string;
  lastMessageId?: string;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
  role: ConversationRole;
  isMuted: boolean;
  unreadCount: number;
  lastMessageText?: string;
  memberOnlineCount: number;
  isOnline: boolean;
}

export const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  1: "DM",
  2: "Nhóm",
  3: "Kênh",
};

export const CONVERSATION_ROLE_LABELS: Record<ConversationRole, string> = {
  1: "Chủ sở hữu",
  2: "Quản trị",
  3: "Thành viên",
};

export const MOCK_CONVERSATIONS: ConversationListItem[] = [
  {
    id: "conv_01",
    type: 1,
    name: "An Bình",
    description: "Thiết kế landing page cho chiến dịch mới.",
    avatarUrl: "/assets/home/iVBORw0KGg_3.png",
    createBy: "user_01",
    lastMessageId: "msg_010",
    lastActivityAt: "2026-05-16T09:42:00.000Z",
    createdAt: "2026-05-12T08:20:00.000Z",
    updatedAt: "2026-05-16T09:42:00.000Z",
    role: 3,
    isMuted: false,
    unreadCount: 4,
    memberOnlineCount: 1,
    isOnline: true,
    lastMessageText: "Mình vừa đẩy bản wireframe mới lên rồi, bạn xem giúp nhé.",
  },
  {
    id: "conv_02",
    type: 2,
    name: "Stitch Product",
    description: "Thảo luận UI/UX, release và QA.",
    createBy: "user_02",
    lastMessageId: "msg_011",
    lastActivityAt: "2026-05-16T08:15:00.000Z",
    createdAt: "2026-04-28T10:10:00.000Z",
    updatedAt: "2026-05-16T08:15:00.000Z",
    role: 2,
    isMuted: false,
    unreadCount: 12,
    memberOnlineCount: 3,
    isOnline: true,
    lastMessageText: "Hôm nay chốt lại copy cho màn onboarding nhé.",
  },
  {
    id: "conv_03",
    type: 3,
    name: "#design-system",
    description: "Changelog token, component API, và cập nhật docs.",
    createBy: "user_03",
    lastMessageId: "msg_012",
    lastActivityAt: "2026-05-16T07:05:00.000Z",
    createdAt: "2026-03-17T11:45:00.000Z",
    updatedAt: "2026-05-16T07:05:00.000Z",
    role: 2,
    isMuted: true,
    unreadCount: 0,
    memberOnlineCount: 0,
    isOnline: false,
    lastMessageText: "Docs đã cập nhật token color mới ở branch main.",
  },
  {
    id: "conv_04",
    type: 1,
    name: "Linh Trần",
    description: "Trao đổi mock dữ liệu cho màn chat.",
    avatarUrl: "/assets/home/iVBORw0KGg_5.png",
    createBy: "user_01",
    lastMessageId: "msg_013",
    lastActivityAt: "2026-05-15T22:10:00.000Z",
    createdAt: "2026-05-09T13:00:00.000Z",
    updatedAt: "2026-05-15T22:10:00.000Z",
    role: 3,
    isMuted: false,
    unreadCount: 1,
    memberOnlineCount: 0,
    isOnline: false,
    lastMessageText: "Nếu ổn thì mai mình export sang API contract luôn.",
  },
  {
    id: "conv_05",
    type: 2,
    name: "Backend Sync",
    description: "Tối ưu schema, auth và realtime updates.",
    createBy: "user_04",
    lastMessageId: "msg_014",
    lastActivityAt: "2026-05-15T19:48:00.000Z",
    createdAt: "2026-04-10T09:30:00.000Z",
    updatedAt: "2026-05-15T19:48:00.000Z",
    role: 3,
    isMuted: false,
    unreadCount: 0,
    memberOnlineCount: 2,
    isOnline: true,
    lastMessageText: "Migration conversations xong rồi, chỉ còn seed mock data.",
  },
  {
    id: "conv_06",
    type: 3,
    name: "#release-notes",
    description: "Thông báo bản phát hành và thông tin triển khai.",
    createBy: "user_05",
    lastMessageId: "msg_015",
    lastActivityAt: "2026-05-15T17:30:00.000Z",
    createdAt: "2026-03-04T15:00:00.000Z",
    updatedAt: "2026-05-15T17:30:00.000Z",
    role: 1,
    isMuted: true,
    unreadCount: 0,
    memberOnlineCount: 0,
    isOnline: false,
    lastMessageText: "Release note v0.12 đã sẵn sàng review.",
  },
  {
    id: "conv_07",
    type: 1,
    name: "Minh Nhật",
    description: "Kiểm tra giao diện dark mode và spacing.",
    createBy: "user_01",
    lastMessageId: "msg_016",
    lastActivityAt: "2026-05-14T23:15:00.000Z",
    createdAt: "2026-05-03T10:30:00.000Z",
    updatedAt: "2026-05-14T23:15:00.000Z",
    role: 3,
    isMuted: false,
    unreadCount: 8,
    memberOnlineCount: 1,
    isOnline: true,
    lastMessageText: "Tớ vừa test trên mobile, layout vẫn ổn.",
  },
  {
    id: "conv_08",
    type: 2,
    name: "Growth Team",
    description: "Chiến dịch, metrics và nội dung quảng bá.",
    createBy: "user_06",
    lastMessageId: "msg_017",
    lastActivityAt: "2026-05-14T18:05:00.000Z",
    createdAt: "2026-02-22T08:00:00.000Z",
    updatedAt: "2026-05-14T18:05:00.000Z",
    role: 3,
    isMuted: false,
    unreadCount: 2,
    memberOnlineCount: 4,
    isOnline: true,
    lastMessageText: "Số liệu tuần này tăng đều, giữ lịch đăng như cũ nhé.",
  },
];

export function getConversationTypeLabel(type: ConversationType) {
  return CONVERSATION_TYPE_LABELS[type];
}

export function getConversationRoleLabel(role: ConversationRole) {
  return CONVERSATION_ROLE_LABELS[role];
}

export function formatConversationActivity(value?: string) {
  if (!value) return "Mới đây";

  const diffInDays = getVietnamDayDiffFromNow(value);
  if (diffInDays === null) return value;

  if (diffInDays <= 0) {
    return formatVietnamTime(value);
  }

  if (diffInDays === 1) {
    return "Hôm qua";
  }

  return formatVietnamDate(value);
}
