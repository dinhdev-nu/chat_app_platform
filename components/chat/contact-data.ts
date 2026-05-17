export interface ContactUserResponse {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  lastSeenAt?: string | null;
  createdAt?: string;
};

export enum ContactStatus {
  Pending = 1,  // Chờ xác nhận
  Accepted = 2, // Đã kết bạn
  Blocked = 3,  // Đã chặn
}

export interface SearchUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  lastSeenAt?: string | null;
  outgoingStatus?: ContactStatus;
  incomingStatus?: ContactStatus;
}

export const MOCK_CONTACT_USERS: ContactUserResponse[] = [
  {
    id: "contact_01",
    username: "An Bình",
    avatarUrl: "/assets/home/iVBORw0KGg_3.png",
    bio: "Thiết kế landing page và tối ưu flow onboarding.",
    lastSeenAt: "2026-05-16T09:10:00.000Z",
  },
  {
    id: "contact_02",
    username: "Linh Trần",
    avatarUrl: "/assets/home/iVBORw0KGg_5.png",
    bio: "Làm product design và set up design system.",
    lastSeenAt: "2026-05-16T08:45:00.000Z",
  },
  {
    id: "contact_03",
    username: "Minh Nhật",
    bio: "Kiểm tra giao diện, spacing và responsive.",
    lastSeenAt: "2026-05-15T23:15:00.000Z",
  },
  {
    id: "contact_04",
    username: "Backend Sync",
    bio: "API contract, auth và realtime infrastructure.",
    lastSeenAt: "2026-05-15T19:48:00.000Z",
  },
  {
    id: "contact_05",
    username: "Growth Team",
    bio: "Campaign metrics, nội dung và tracking.",
    lastSeenAt: "2026-05-14T18:05:00.000Z",
  },
  {
    id: "contact_06",
    username: "Quang Phạm",
    bio: "Đã tạm chặn do test luồng an toàn.",
    lastSeenAt: "2026-05-13T12:00:00.000Z",
  },
];

export function formatContactLastSeen(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const lastSeenDate = new Date(value);
  if (Number.isNaN(lastSeenDate.getTime())) return value;

  const now = new Date();
  const diffInDays = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(lastSeenDate.getFullYear(), lastSeenDate.getMonth(), lastSeenDate.getDate())) /
      86400000,
  );

  if (diffInDays <= 0) {
    return `Hoạt động ${lastSeenDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  if (diffInDays === 1) {
    return "Hoạt động hôm qua";
  }

  return `Hoạt động ${lastSeenDate.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  })}`;
}
