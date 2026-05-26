import { API_BASE_URL } from "@/constants/config";
import type {
  WsConversationPayload,
  WsInboundEnvelope,
  WsInboundType,
  WsOutboundEvent,
  WsReadPayload,
} from "@/types/ws";
import { isWsOutboundEvent } from "@/types/ws";

export type WsConnectionStatus =
  | "idle"
  | "connecting"
  | "open"
  | "reconnecting"
  | "closed"
  | "error";

interface WsConnectOptions {
  accessToken: string;
  onEvent: (event: WsOutboundEvent) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onStatusChange?: (status: WsConnectionStatus, retryCount: number, error?: string | null) => void;
}

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;
const RECONNECT_JITTER_MS = 350;

function getReconnectDelay(retryCount: number) {
  const baseDelay = Math.min(
    INITIAL_RECONNECT_DELAY_MS * 2 ** Math.max(0, retryCount - 1),
    MAX_RECONNECT_DELAY_MS,
  );

  return baseDelay + Math.floor(Math.random() * RECONNECT_JITTER_MS);
}

function buildWsUrl(accessToken: string) {
  if (typeof window === "undefined") return "";

  const url = new URL(API_BASE_URL, window.location.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}/ws`;
  url.searchParams.set("token", accessToken);

  return url.toString();
}

class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private options: WsConnectOptions | null = null;
  private retryCount = 0;
  private manualClose = false;
  private accessToken: string | null = null;

  connect(options: WsConnectOptions) {
    if (typeof window === "undefined") return;

    const isSameToken = this.accessToken === options.accessToken;
    const readyState = this.socket?.readyState;

    this.options = options;

    if (
      isSameToken &&
      (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.disconnect();
    this.manualClose = false;
    this.accessToken = options.accessToken;
    this.retryCount = 0;
    this.openSocket("connecting");
  }

  disconnect() {
    this.manualClose = true;

    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;

      if (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      ) {
        this.socket.close();
      }
    }

    this.socket = null;
    this.options?.onStatusChange?.("closed", this.retryCount, null);
  }

  send<TPayload extends object>(type: WsInboundType, payload: TPayload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;

    const envelope: WsInboundEnvelope<TPayload> = { type, payload };
    this.socket.send(JSON.stringify(envelope));

    return true;
  }

  sendTyping(convId: string) {
    return this.send<WsConversationPayload>("typing", { conv_id: convId });
  }

  sendViewing(convId: string) {
    return this.send<WsConversationPayload>("viewing", { conv_id: convId });
  }

  sendLeft(convId: string) {
    return this.send<WsConversationPayload>("left", { conv_id: convId });
  }

  sendRead(convId: string, lastReadMessageId: string) {
    return this.send<WsReadPayload>("read", {
      conv_id: convId,
      last_read_msg_id: lastReadMessageId,
    });
  }

  private openSocket(status: WsConnectionStatus) {
    const accessToken = this.accessToken;
    const options = this.options;

    if (!accessToken || !options) return;

    options.onStatusChange?.(status, this.retryCount, null);

    try {
      this.socket = new WebSocket(buildWsUrl(accessToken));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cannot create WebSocket";
      options.onStatusChange?.("error", this.retryCount, message);
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.retryCount = 0;
      options.onStatusChange?.("open", this.retryCount, null);
      options.onOpen?.();
    };

    this.socket.onmessage = (message) => {
      try {
        const parsed = JSON.parse(message.data);
        if (isWsOutboundEvent(parsed)) {
          options.onEvent(parsed);
        }
      } catch {
        // Ignore invalid server frames. The server contract currently has no error frame.
      }
    };

    this.socket.onerror = (event) => {
      options.onStatusChange?.("error", this.retryCount, "WebSocket error");
      options.onError?.(event);
    };

    this.socket.onclose = (event) => {
      this.socket = null;

      if (this.manualClose) {
        options.onStatusChange?.("closed", this.retryCount, null);
        return;
      }

      options.onStatusChange?.("closed", this.retryCount, event.reason || null);
      options.onClose?.(event);
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    const options = this.options;
    if (!options || this.manualClose) return;

    this.retryCount += 1;
    const delay = getReconnectDelay(this.retryCount);

    options.onStatusChange?.("reconnecting", this.retryCount, null);

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket("reconnecting");
    }, delay);
  }
}

export const wsService = new ChatWebSocketService();
