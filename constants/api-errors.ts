import type { ApiErrorCode } from "@/types/api";

export const API_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: "Đã có lỗi hệ thống. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Thông tin nhập chưa hợp lệ. Vui lòng kiểm tra lại.",
  INVALID_REQUEST: "Yêu cầu không hợp lệ.",
  UNAUTHORIZED: "Bạn cần đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  BAD_REQUEST: "Yêu cầu chưa đúng. Vui lòng kiểm tra lại.",
  CONFLICT: "Dữ liệu đã tồn tại hoặc đang xung đột.",
  TOO_MANY_REQUESTS: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
  INVALID_CREDENTIALS: "Thông tin đăng nhập không chính xác.",
  TOKEN_MISSING: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  TOKEN_INVALID: "Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản người dùng.",
  CONVERSATION_NOT_FOUND: "Không tìm thấy hội thoại.",
  INVALID_CURSOR: "Dữ liệu phân trang không hợp lệ. Vui lòng tải lại.",
  NOT_A_MEMBER: "Bạn không phải thành viên của hội thoại này.",
  MESSAGE_NOT_FOUND: "Không tìm thấy tin nhắn.",
  MESSAGE_DELETED: "Tin nhắn này đã bị xóa.",
  CANNOT_EDIT_MESSAGE: "Bạn không thể chỉnh sửa tin nhắn này.",
  CANNOT_DELETE_MESSAGE: "Bạn không thể xóa tin nhắn này.",
  INVALID_INPUT: "Thông tin nhập chưa hợp lệ.",
  CANNOT_SEND_CONTACT_REQUEST: "Không thể gửi lời mời kết bạn.",
} satisfies Record<ApiErrorCode, string>;

export function getApiErrorMessageByCode(code?: string) {
  if (!code) return undefined;

  return API_ERROR_MESSAGES[code as ApiErrorCode];
}
