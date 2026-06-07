"use client";

import React, { useEffect, useEffectEvent, useReducer } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, LogOut, PencilLine } from "lucide-react";

import { getApiErrorMessage } from "@/services/http";
import { useAuthStore } from "@/stores/authStore";
import type { UpdateUserRequest } from "@/types/user";

interface ProfileModalProps {
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

interface ProfileModalState {
  name: string;
  avatarUrl: string;
  bio: string;
  avatarError: boolean;
  modalError: string | null;
  isSaving: boolean;
  isLoggingOut: boolean;
}

type ProfileModalAction =
  | { type: "setName"; value: string }
  | { type: "setAvatarUrl"; value: string }
  | { type: "setBio"; value: string }
  | { type: "setAvatarError"; value: boolean }
  | { type: "setModalError"; value: string | null }
  | { type: "setSaving"; value: boolean }
  | { type: "setLoggingOut"; value: boolean };

function profileModalReducer(
  state: ProfileModalState,
  action: ProfileModalAction,
): ProfileModalState {
  switch (action.type) {
    case "setName":
      return { ...state, name: action.value };
    case "setAvatarUrl":
      return { ...state, avatarUrl: action.value, avatarError: false };
    case "setBio":
      return { ...state, bio: action.value };
    case "setAvatarError":
      return { ...state, avatarError: action.value };
    case "setModalError":
      return { ...state, modalError: action.value };
    case "setSaving":
      return { ...state, isSaving: action.value };
    case "setLoggingOut":
      return { ...state, isLoggingOut: action.value };
  }
}

interface ProfileIdentitySectionProps {
  name: string;
  avatarUrl: string;
  avatarFallback: string;
  showAvatar: boolean;
  dispatch: React.Dispatch<ProfileModalAction>;
}

function ProfileIdentitySection({
  name,
  avatarUrl,
  avatarFallback,
  showAvatar,
  dispatch,
}: ProfileIdentitySectionProps) {
  return (
    <section className="flex flex-col gap-2" aria-labelledby="profile-identity-title">
      <h3 id="profile-identity-title" className="text-xs text-secondary font-medium">
        Tên & ảnh đại diện
      </h3>
      <div className="flex items-center gap-3">
        <label
          htmlFor="profile-avatar-file"
          title="Cập nhật ảnh đại diện"
          className="group relative size-14 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer focus-within:outline-2 focus-within:outline-[rgb(var(--outlineColor-focus-ring))]"
          style={{
            background: "rgb(var(--backgroundColor-surface-container))",
            border: "1px solid rgb(var(--backgroundColor-state-enabled))",
          }}
        >
          <input
            id="profile-avatar-file"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={() => {
              dispatch({
                type: "setModalError",
                value: "Chọn ảnh đại diện sẽ được hỗ trợ trong bản cập nhật tiếp theo.",
              });
            }}
          />
          {showAvatar ? (
            <Image
              src={avatarUrl.trim()}
              alt="Ảnh đại diện"
              width={56}
              height={56}
              unoptimized
              className="size-14 object-cover"
              onError={() => dispatch({ type: "setAvatarError", value: true })}
            />
          ) : (
            <span className="text-primary font-medium" style={{ fontSize: 22, lineHeight: 1 }}>
              {avatarFallback}
            </span>
          )}
          <span
            className="absolute inset-x-0 bottom-0 flex h-6 items-center justify-center text-white transition-colors group-hover:bg-black/65"
            style={{ background: "rgb(0 0 0 / 0.52)" }}
          >
            <Camera size={14} strokeWidth={2} aria-hidden="true" />
          </span>
        </label>

        <label htmlFor="profile-name" className="sr-only">
          Tên hiển thị
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id="profile-name"
            type="text"
            placeholder="Tên hiển thị…"
            value={name}
            maxLength={50}
            onChange={(event) => dispatch({ type: "setName", value: event.target.value })}
            name="profileName"
            autoComplete="name"
            className="w-full modal-input-underline text-sm font-medium text-primary py-2 pr-9"
          />
          <PencilLine
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-secondary"
          />
        </div>
      </div>
    </section>
  );
}

function ProfileBioSection({
  bio,
  dispatch,
}: {
  bio: string;
  dispatch: React.Dispatch<ProfileModalAction>;
}) {
  return (
    <section className="flex flex-col gap-2" aria-labelledby="profile-bio-title">
      <div className="flex items-center justify-between">
        <h3 id="profile-bio-title" className="text-xs text-secondary font-medium">
          Giới thiệu bản thân
        </h3>
        <p className="text-xs text-secondary">{bio.length}/300</p>
      </div>
      <label htmlFor="profile-bio" className="sr-only">
        Giới thiệu bản thân
      </label>
      <textarea
        id="profile-bio"
        rows={2}
        placeholder="Thêm mô tả về bạn…"
        value={bio}
        maxLength={300}
        onChange={(event) => dispatch({ type: "setBio", value: event.target.value })}
        name="profileBio"
        autoComplete="off"
        className="w-full text-sm text-primary modal-textarea rounded-xl p-3 resize-none"
      />
    </section>
  );
}

interface ProfileModalActionsState {
  canSave: boolean;
  isSaving: boolean;
  isLogoutPending: boolean;
  canLogout: boolean;
}

interface ProfileModalActionsHandlers {
  onSave: () => void;
  onLogout: () => void;
}

function ProfileModalActions({
  state,
  handlers,
}: {
  state: ProfileModalActionsState;
  handlers: ProfileModalActionsHandlers;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handlers.onSave}
        disabled={!state.canSave}
        className="flex items-center justify-center gap-2 rounded-lg bg-clip-border
          focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2
          border border-white/[.13] bg-state-enabled text-primary shadow-sm
          enabled:hover:bg-state-hover enabled:active:bg-state-pressed
          disabled:opacity-50 disabled:cursor-not-allowed
          backdrop-blur-glass text-subtitle-md px-3 h-8 w-full"
      >
        {state.isSaving ? (
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
              aria-hidden="true"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span className="font-medium text-sm" aria-live="polite">
              Đang lưu…
            </span>
          </>
        ) : (
          <span className="font-medium text-sm">Lưu thay đổi</span>
        )}
      </button>

      {state.canLogout ? (
        <button
          type="button"
          onClick={handlers.onLogout}
          disabled={state.isSaving || state.isLogoutPending}
          className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-transparent
            px-3 text-subtitle-md text-[rgb(var(--textColor-danger))]
            border border-[rgb(var(--borderColor-error)/.35)]
            transition-colors enabled:hover:bg-[rgb(var(--backgroundColor-error)/.08)]
            enabled:active:bg-[rgb(var(--backgroundColor-error)/.14)]
            disabled:cursor-not-allowed disabled:opacity-50
            focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2"
        >
          <LogOut size={15} aria-hidden="true" />
          <span className="font-medium text-sm">{state.isLogoutPending ? "Đang đăng xuất…" : "Đăng xuất"}</span>
        </button>
      ) : null}
      <div className="h-2" />
    </div>
  );
}

function ProfileModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current
        focus-visible:-outline-offset-2 border-none enabled:hover:bg-state-hover
        enabled:active:bg-state-pressed text-subtitle-md p-1.5 rounded-full
        bg-transparent text-primary hover:bg-state-hover active:bg-state-pressed
        transition-colors flex items-center justify-center focus-ring right-4 top-4
        fixed md:absolute"
      aria-label="Đóng"
      onClick={onClose}
    >
      <span className="text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" fill="currentColor" viewBox="0 0 256 256">
          <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
        </svg>
      </span>
    </button>
  );
}

export default function ProfileModal({
  onOpenChange,
  initialData,
  onSave,
  onLogout,
}: ProfileModalProps) {
  const { replace } = useRouter();
  const authUser = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const logout = useAuthStore((state) => state.logout);
  const isUpdatingProfile = useAuthStore((state) => state.isUpdatingProfile);
  const isStoreLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const initialName = initialData?.name ?? authUser?.name ?? authUser?.email ?? "";
  const initialAvatarUrl = initialData?.avatarUrl ?? authUser?.avatarUrl ?? "";
  const initialBio = initialData?.bio ?? authUser?.bio ?? "";
  const [state, dispatch] = useReducer(profileModalReducer, {
    name: initialName,
    avatarUrl: initialAvatarUrl,
    bio: initialBio,
    avatarError: false,
    modalError: null,
    isSaving: false,
    isLoggingOut: false,
  });
  const {
    name,
    avatarUrl,
    bio,
    avatarError,
    modalError,
    isSaving,
    isLoggingOut,
  } = state;
  const closeModalFromEffect = useEffectEvent(() => onOpenChange(false));

  const isSavingProfile = isSaving || isUpdatingProfile;
  const isLogoutPending = isLoggingOut || isStoreLoggingOut;
  const hasProfileChanges =
    name.trim() !== initialName.trim() ||
    avatarUrl.trim() !== initialAvatarUrl.trim() ||
    bio.trim() !== initialBio.trim();
  const canSaveProfile = Boolean(name.trim()) && hasProfileChanges && !isSavingProfile;
  const avatarFallback = name.trim().charAt(0).toUpperCase() || "U";
  const showAvatar = Boolean(avatarUrl.trim() && !avatarError);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModalFromEffect();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSave = async () => {
    if (!canSaveProfile) return;

    dispatch({ type: "setSaving", value: true });
    dispatch({ type: "setModalError", value: null });

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
      dispatch({ type: "setModalError", value: getApiErrorMessage(error) });
    } finally {
      dispatch({ type: "setSaving", value: false });
    }
  };

  const handleLogout = async () => {
    if (isLogoutPending) return;

    dispatch({ type: "setLoggingOut", value: true });
    dispatch({ type: "setModalError", value: null });

    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logout();
        replace("/login");
      }

      onOpenChange(false);
    } catch (error) {
      dispatch({ type: "setModalError", value: getApiErrorMessage(error) });
    } finally {
      dispatch({ type: "setLoggingOut", value: false });
    }
  };

  const modalContent = (
    <div data-base-ui-portal className="chat-root">
      <div
        className="overflow-hidden fixed inset-0 z-[9999] bg-overlay backdrop-blur-sm modal-overlay-enter"
        role="presentation"
        aria-hidden={true}
        style={{ userSelect: "none" }}
      />

      <button type="button" aria-label="Focus guard" style={FOCUS_GUARD} />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <dialog
          open
          aria-modal="true"
          aria-labelledby="update-profile-title"
          className={`pointer-events-auto shadow-tool cursor-default flex w-full h-full overflow-hidden
            bg-surface border border-secondary md:rounded-xl relative text-primary justify-center
            max-w-[400px] max-h-[calc(100svh-2rem)] md:h-auto p-4 md:p-6 m-0
            modal-content-enter`}
        >
          <div className="flex flex-col w-full justify-between gap-3">
            <div className="flex flex-col gap-8">
              <h1 id="update-profile-title" className="text-title-md">
                Hồ sơ
              </h1>

              <ProfileIdentitySection
                name={name}
                avatarUrl={avatarUrl}
                avatarFallback={avatarFallback}
                showAvatar={showAvatar}
                dispatch={dispatch}
              />

              <ProfileBioSection bio={bio} dispatch={dispatch} />

              {modalError ? (
                <p className="text-xs text-[rgb(var(--textColor-danger))]" role="alert">
                  {modalError}
                </p>
              ) : null}
            </div>

            <ProfileModalActions
              state={{
                canSave: canSaveProfile,
                isSaving: isSavingProfile,
                isLogoutPending,
                canLogout: Boolean(authUser || onLogout),
              }}
              handlers={{
                onSave: handleSave,
                onLogout: handleLogout,
              }}
            />
          </div>

          <ProfileModalCloseButton onClose={() => onOpenChange(false)} />
        </dialog>
      </div>

      <button type="button" aria-label="Focus guard" style={FOCUS_GUARD} />
    </div>
  );

  if (typeof document === "undefined") return null;

  return createPortal(modalContent, document.body);
}
