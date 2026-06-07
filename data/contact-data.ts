import type { ContactUserResponse, SearchUser } from "@/types/user";
import {
  formatVietnamDate,
  formatVietnamTime,
  getVietnamDayDiffFromNow,
} from "@/lib/chat-time-utils";

export type { ContactUserResponse, SearchUser };

export const MOCK_CONTACT_USERS: ContactUserResponse[] = [
  {
    id: "contact_01",
    username: "An Bình",
    avatarUrl: "/assets/home/iVBORw0KGg_3.png",
    bio: "Thiết kế landing page và tối ưu flow onboarding.",
    lastSeenAt: "2026-05-16T09:10:00.000Z",
    isOnline: true,
  },
  {
    id: "contact_02",
    username: "Linh Trần",
    avatarUrl: "/assets/home/iVBORw0KGg_5.png",
    bio: "Làm product design và set up design system.",
    lastSeenAt: "2026-05-16T08:45:00.000Z",
    isOnline: true,
  },
  {
    id: "contact_03",
    username: "Minh Nhật",
    bio: "Kiểm tra giao diện, spacing và responsive.",
    lastSeenAt: "2026-05-15T23:15:00.000Z",
    isOnline: false,
  },
  {
    id: "contact_04",
    username: "Backend Sync",
    bio: "API contract, auth và realtime infrastructure.",
    lastSeenAt: "2026-05-15T19:48:00.000Z",
    isOnline: true,
  },
  {
    id: "contact_05",
    username: "Growth Team",
    bio: "Campaign metrics, nội dung và tracking.",
    lastSeenAt: "2026-05-14T18:05:00.000Z",
    isOnline: false,
  },
  {
    id: "contact_06",
    username: "Quang Phạm",
    bio: "Đã tạm chặn do test luồng an toàn.",
    lastSeenAt: "2026-05-13T12:00:00.000Z",
    isOnline: false,
  },
];

export function formatContactPresence(contact: ContactUserResponse) {
  if (contact.isOnline) return "Đang trực tuyến";

  return formatContactLastSeen(contact.lastSeenAt);
}

function formatContactLastSeen(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const diffInDays = getVietnamDayDiffFromNow(value);
  if (diffInDays === null) return value;

  if (diffInDays <= 0) {
    return `Hoạt động ${formatVietnamTime(value)}`;
  }

  if (diffInDays === 1) {
    return "Hoạt động hôm qua";
  }

  return `Hoạt động ${formatVietnamDate(value)}`;
}
