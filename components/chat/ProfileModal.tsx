"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { getApiErrorMessage } from "@/services/http";
import { useAuthStore } from "@/stores/authStore";
import type { UpdateUserRequest } from "@/types/user";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: UpdateUserRequest;
  onSave?: (data: UpdateUserRequest) => void | Promise<void>;
  onLogout?: () => void | Promise<void>;
}

const FOCUS_GUARD: React.CSSProperties = {
  clip: "rect(0px,0px,0px,0px)",
  overflow: "hidden",
  whiteSpace: "nowrap",
  position: "fixed",
  top: 0,
  left: 0,
  border: 0,
  padding: 0,
  width: "1px",
  height: "1px",
  margin: "-1px",
};

export default function ProfileModal({
  open,
  onOpenChange,
  initialData,
  onSave,
  onLogout,
}: ProfileModalProps) {
  const router = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const isUpdatingProfile = useAuthStore((state) => state.isUpdatingProfile);
  const isStoreLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const initialName = initialData?.name ?? authUser?.name ?? authUser?.email ?? "";
  const initialAvatarUrl = initialData?.avatarUrl ?? authUser?.avatarUrl ?? "";
  const initialBio = initialData?.bio ?? authUser?.bio ?? "";
  const [shouldRender, setShouldRender] = useState(open);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [bio, setBio] = useState(initialBio);
  const [avatarError, setAvatarError] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setAvatarUrl(initialAvatarUrl);
      setBio(initialBio);
      setAvatarError(false);
      setModalError(null);
    }
  }, [open, initialName, initialAvatarUrl, initialBio]);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setIsAnimatingOut(false);
    } else if (shouldRender) {
      setIsAnimatingOut(true);
    }
  }, [open, shouldRender]);

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const handleAnimationEnd = () => {
    if (isAnimatingOut) {
      setShouldRender(false);
      setIsAnimatingOut(false);
    }
  };

  const handleSave = async () => {
    if (isSaving || isUpdatingProfile || !name.trim()) return;

    setIsSaving(true);
    setModalError(null);

    try {
      const payload: UpdateUserRequest = {
        name: name.trim(),
        ...(avatarUrl.trim() ? { avatarUrl: avatarUrl.trim() } : {}),
        ...(bio.trim() ? { bio: bio.trim() } : {}),
      };

      if (onSave) {
        await onSave(payload);
      } else {
        await updateProfile(payload);
      }

      onOpenChange(false);
    } catch (error) {
      setModalError(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut || isStoreLoggingOut) return;

    setIsLoggingOut(true);
    setModalError(null);

    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logout();
        router.replace("/login");
      }

      onOpenChange(false);
    } catch (error) {
      setModalError(getApiErrorMessage(error));
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isSavingProfile = isSaving || isUpdatingProfile;
  const isLogoutPending = isLoggingOut || isStoreLoggingOut;
  const avatarFallback = name.trim().charAt(0).toUpperCase() || "U";
  const showAvatar = avatarUrl.trim() && !avatarError;

  if (!shouldRender) return null;

  return (
    <div data-base-ui-portal>
      <div
        className={`overflow-hidden fixed inset-0 z-[9999] bg-overlay backdrop-blur-sm ${isAnimatingOut ? "modal-overlay-exit" : "modal-overlay-enter"}`}
        role="presentation"
        aria-hidden={true}
        style={{ userSelect: "none" }}
      />

      <span aria-hidden tabIndex={0} style={FOCUS_GUARD} />

      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-profile-title"
        tabIndex={-1}
      >
        <div
          className={`pointer-events-auto shadow-tool cursor-default flex w-full h-full overflow-hidden
            bg-surface border border-secondary md:rounded-xl relative text-primary justify-center
            md:w-[400px] md:h-auto p-4 md:p-6
            ${isAnimatingOut ? "modal-content-exit" : "modal-content-enter"}`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="flex flex-col w-full justify-between gap-3">
            <div className="flex flex-col gap-8">
              <h1 id="update-profile-title" className="text-title-md">
                Hồ sơ
              </h1>

              <div className="flex flex-col gap-2">
                <h3 className="text-xs text-secondary font-medium">Tên & ảnh đại diện</h3>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{
                      background: "rgb(var(--backgroundColor-surface-container))",
                      border: "1px solid rgb(var(--backgroundColor-state-enabled))",
                    }}
                  >
                    {showAvatar ? (
                      <img
                        src={avatarUrl.trim()}
                        alt="Ảnh đại diện"
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-primary font-medium" style={{ fontSize: 20, lineHeight: 1 }}>
                        {avatarFallback}
                      </span>
                    )}
                  </div>
                  <label htmlFor="profile-name" className="sr-only">
                    Tên hiển thị
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    placeholder="Tên hiển thị..."
                    value={name}
                    maxLength={50}
                    onChange={(event) => setName(event.target.value)}
                    name="profileName"
                    autoComplete="name"
                    className="flex-1 modal-input-underline text-sm font-medium text-primary py-2"
                  />
                </div>

                <label htmlFor="profile-avatar" className="sr-only">
                  URL ảnh đại diện
                </label>
                <input
                  id="profile-avatar"
                  type="url"
                  placeholder="URL ảnh đại diện (tùy chọn)"
                  value={avatarUrl}
                  maxLength={512}
                  onChange={(event) => {
                    setAvatarUrl(event.target.value);
                    setAvatarError(false);
                  }}
                  name="profileAvatarUrl"
                  autoComplete="off"
                  className="w-full modal-input-underline-secondary text-xs text-secondary py-1"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs text-secondary font-medium">Giới thiệu bản thân</h3>
                  <p className="text-xs text-secondary">{bio.length}/300</p>
                </div>
                <label htmlFor="profile-bio" className="sr-only">
                  Giới thiệu bản thân
                </label>
                <textarea
                  id="profile-bio"
                  rows={2}
                  placeholder="Thêm mô tả về bạn..."
                  value={bio}
                  maxLength={300}
                  onChange={(event) => setBio(event.target.value)}
                  name="profileBio"
                  autoComplete="off"
                  className="w-full text-sm text-primary modal-textarea rounded-xl p-3 resize-none"
                />
              </div>

              {modalError ? (
                <p className="text-xs text-[rgb(var(--textColor-danger))]" role="alert">
                  {modalError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSavingProfile || !name.trim()}
                className="flex items-center justify-center gap-2 rounded-lg bg-clip-border
                  focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2
                  border border-white/[.13] bg-state-enabled text-primary shadow-sm
                  enabled:hover:bg-state-hover enabled:active:bg-state-pressed
                  disabled:opacity-50 disabled:cursor-not-allowed
                  backdrop-blur-glass text-subtitle-md px-3 h-8 w-full"
              >
                {isSavingProfile ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="modal-spinner"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <span className="font-medium text-sm" aria-live="polite">
                      Đang lưu...
                    </span>
                  </>
                ) : (
                  <span className="font-medium text-sm">Lưu thay đổi</span>
                )}
              </button>
              {authUser || onLogout ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isSavingProfile || isLogoutPending}
                  className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-transparent
                    px-3 text-subtitle-md text-[rgb(var(--textColor-danger))]
                    border border-[rgb(var(--borderColor-error)/.35)]
                    transition-colors enabled:hover:bg-[rgb(var(--backgroundColor-error)/.08)]
                    enabled:active:bg-[rgb(var(--backgroundColor-error)/.14)]
                    disabled:cursor-not-allowed disabled:opacity-50
                    focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2"
                >
                  <LogOut size={15} aria-hidden="true" />
                  <span className="font-medium text-sm">{isLogoutPending ? "Đang đăng xuất..." : "Đăng xuất"}</span>
                </button>
              ) : null}
              <div className="h-2" />
            </div>
          </div>

          <button
            type="button"
            className="gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current
              focus-visible:-outline-offset-2 border-none enabled:hover:bg-state-hover
              enabled:active:bg-state-pressed text-subtitle-md p-1.5 rounded-full
              bg-transparent text-primary hover:bg-state-hover active:bg-state-pressed
              transition-colors flex items-center justify-center focus-ring right-4 top-4
              fixed md:absolute"
            aria-label="Đóng"
            onClick={() => onOpenChange(false)}
          >
            <span className="text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <span aria-hidden tabIndex={0} style={FOCUS_GUARD} />
    </div>
  );
}
