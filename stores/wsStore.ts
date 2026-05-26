import { create } from "zustand";

import type { WsConnectionStatus } from "@/services/wsService";

interface WsState {
  status: WsConnectionStatus;
  retryCount: number;
  error: string | null;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  setConnectionState: (
    status: WsConnectionStatus,
    retryCount?: number,
    error?: string | null,
  ) => void;
  reset: () => void;
}

export const useWsStore = create<WsState>()((set) => ({
  status: "idle",
  retryCount: 0,
  error: null,
  lastConnectedAt: null,
  lastDisconnectedAt: null,

  setConnectionState: (status, retryCount = 0, error = null) => {
    const now = new Date().toISOString();

    set((state) => ({
      status,
      retryCount,
      error,
      lastConnectedAt: status === "open" ? now : state.lastConnectedAt,
      lastDisconnectedAt:
        status === "closed" || status === "error" ? now : state.lastDisconnectedAt,
    }));
  },

  reset: () =>
    set({
      status: "idle",
      retryCount: 0,
      error: null,
      lastConnectedAt: null,
      lastDisconnectedAt: null,
    }),
}));
