"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import Image from "next/image";
import {
  BackIcon,
  CheckIcon,
  CloseIcon,
  SearchIcon,
  UserGroupIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { SearchUser } from "@/types/user";

type ConversationDraftType = 2 | 3;
type CreateConversationTab = "info" | "members";

interface CreateConversationPayload {
  name: string;
  type: ConversationDraftType;
  avatar_url?: string;
  description?: string;
  member_user_ids: string[];
}

interface CreateConversationFormProps {
  onBack?: () => void;
  initialType?: ConversationDraftType;
  onSearchMembers?: (q: string) => Promise<SearchUser[]>;
  onCreateConversation?: (payload: CreateConversationPayload) => void;
}

interface CreateConversationState {
  activeTab: CreateConversationTab;
  name: string;
  description: string;
  type: ConversationDraftType;
  avatarUrl: string;
  memberIds: string[];
  searchQuery: string;
  memberResults: SearchUser[];
  isMemberSearching: boolean;
  memberSearchError: string | null;
}

type CreateConversationAction =
  | { type: "setActiveTab"; activeTab: CreateConversationTab }
  | { type: "setName"; name: string }
  | { type: "setDescription"; description: string }
  | { type: "setConversationType"; conversationType: ConversationDraftType }
  | { type: "setAvatarUrl"; avatarUrl: string }
  | { type: "toggleMember"; memberId: string }
  | { type: "setSearchQuery"; searchQuery: string }
  | { type: "startMemberSearch" }
  | { type: "memberSearchSuccess"; users: SearchUser[] }
  | { type: "memberSearchError"; message: string };

function createInitialState(initialType: ConversationDraftType): CreateConversationState {
  return {
    activeTab: "info",
    name: "",
    description: "",
    type: initialType,
    avatarUrl: "",
    memberIds: [],
    searchQuery: "",
    memberResults: [],
    isMemberSearching: false,
    memberSearchError: null,
  };
}

function createConversationReducer(
  state: CreateConversationState,
  action: CreateConversationAction,
): CreateConversationState {
  switch (action.type) {
    case "setActiveTab":
      return { ...state, activeTab: action.activeTab };
    case "setName":
      return { ...state, name: action.name };
    case "setDescription":
      return { ...state, description: action.description };
    case "setConversationType":
      return { ...state, type: action.conversationType };
    case "setAvatarUrl":
      return { ...state, avatarUrl: action.avatarUrl };
    case "toggleMember":
      return {
        ...state,
        memberIds: state.memberIds.includes(action.memberId)
          ? state.memberIds.filter((memberId) => memberId !== action.memberId)
          : [...state.memberIds, action.memberId],
      };
    case "setSearchQuery":
      return { ...state, searchQuery: action.searchQuery };
    case "startMemberSearch":
      return { ...state, isMemberSearching: true, memberSearchError: null };
    case "memberSearchSuccess":
      return { ...state, memberResults: action.users, isMemberSearching: false };
    case "memberSearchError":
      return {
        ...state,
        memberResults: [],
        isMemberSearching: false,
        memberSearchError: action.message,
      };
  }
}

function CreateConversationHeader({
  type,
  onBack,
}: {
  type: ConversationDraftType;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0 p-4 pb-0">
      <div>
        <button
          type="button"
          onClick={onBack}
          aria-label="Quay lại"
          className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border-none bg-transparent text-primary hover-surface text-subtitle-sm p-1.5 h-auto rounded-full transition-colors"
        >
          <span className="text-inherit">
            <BackIcon size={16} />
          </span>
        </button>
      </div>

      <span className="flex-1 text-sm font-medium text-primary py-1">
        {type === 2 ? "Tạo nhóm mới" : "Tạo kênh mới"}
      </span>
    </div>
  );
}

function CreateConversationTabs({
  activeTab,
  memberCount,
  onTabChange,
}: {
  activeTab: CreateConversationTab;
  memberCount: number;
  onTabChange: (tab: CreateConversationTab) => void;
}) {
  return (
    <div className="flex items-center gap-6 flex-shrink-0 border-b border-[rgb(var(--backgroundColor-state-enabled))] px-4">
      <div className="flex flex-1 relative">
        <div className="flex flex-1">
          <button
            type="button"
            onClick={() => onTabChange("info")}
            className={`relative flex-1 text-center px-1 pb-2.5 text-body-sm transition-colors ${activeTab === "info" ? "text-primary font-medium" : "text-secondary hover:text-primary"
              }`}
          >
            Thông tin
          </button>
        </div>
        <div className="flex flex-1">
          <button
            type="button"
            onClick={() => onTabChange("members")}
            className={`relative flex-1 text-center px-1 pb-2.5 text-body-sm transition-colors ${activeTab === "members" ? "text-primary font-medium" : "text-secondary hover:text-primary"
              }`}
          >
            Thành viên ({memberCount})
          </button>
        </div>
        <div
          className="absolute bottom-0 left-0 w-1/2 h-[3px] rounded-full bg-[rgb(var(--textColor-primary))] transition-transform duration-300 ease-out"
          style={{ transform: activeTab === "info" ? "translateX(0)" : "translateX(100%)" }}
        />
      </div>
    </div>
  );
}

function ConversationTypeToggle({
  type,
  onTypeChange,
}: {
  type: ConversationDraftType;
  onTypeChange: (type: ConversationDraftType) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs text-secondary font-medium">Loại</h3>
      <div
        role="radiogroup"
        className="relative flex p-0.5 rounded-[32px] bg-[rgb(var(--backgroundColor-surface-container)/.5)] backdrop-blur-[40px]"
      >
        <div
          className="absolute top-0.5 bottom-0.5 left-0.5 w-[calc(50%-0.125rem)] rounded-[32px] bg-[rgb(var(--backgroundColor-state-active))] transition-transform duration-300 ease-out"
          style={{ transform: type === 2 ? "translateX(0)" : "translateX(calc(100% + 0.25rem))" }}
        />
        <button
          type="button"
          role="radio"
          aria-checked={type === 2}
          onClick={() => onTypeChange(2)}
          className={`relative flex-1 px-2 py-2 rounded-[32px] text-sm font-medium cursor-pointer transition-colors z-10 text-center ${type === 2 ? "text-primary" : "text-secondary hover:text-primary"}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-primary">
              <UsersIcon size={18} />
            </span>
            Nhóm
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={type === 3}
          onClick={() => onTypeChange(3)}
          className={`relative flex-1 px-2 py-2 rounded-[32px] text-sm font-medium cursor-pointer transition-colors z-10 text-center ${type === 3 ? "text-primary" : "text-secondary hover:text-primary"}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-primary">
              <UserGroupIcon size={18} />
            </span>
            Kênh
          </span>
        </button>
      </div>
    </div>
  );
}

function ConversationDetailsFields({
  type,
  name,
  avatarUrl,
  description,
  onNameChange,
  onAvatarUrlChange,
  onDescriptionChange,
}: {
  type: ConversationDraftType;
  name: string;
  avatarUrl: string;
  description: string;
  onNameChange: (name: string) => void;
  onAvatarUrlChange: (avatarUrl: string) => void;
  onDescriptionChange: (description: string) => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h3 className="text-xs text-secondary font-medium">Tên và ảnh đại diện</h3>
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-full bg-[rgb(var(--backgroundColor-surface-container))] flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden border border-[rgb(var(--backgroundColor-state-enabled))]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={48}
                height={48}
                unoptimized
                className="size-12 object-cover"
              />
            ) : (
              <span className="text-secondary">
                <UserGroupIcon size={24} />
              </span>
            )}
          </div>
          <input
            placeholder={type === 2 ? "Tên nhóm..." : "Tên kênh..."}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-primary placeholder:text-[rgb(var(--textColor-secondary))] outline-none border-b border-transparent focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors py-2"
            type="text"
            name="groupName"
            autoComplete="off"
            aria-label={type === 2 ? "Tên nhóm" : "Tên kênh"}
          />
        </div>
        <input
          placeholder="URL ảnh đại diện (tùy chọn)"
          value={avatarUrl}
          onChange={(event) => onAvatarUrlChange(event.target.value)}
          className="w-full bg-transparent text-xs text-secondary placeholder:text-[rgb(var(--textColor-secondary))] outline-none border-b border-[rgb(var(--backgroundColor-state-enabled))] focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors py-1"
          type="url"
          name="groupAvatarUrl"
          autoComplete="off"
          aria-label="URL ảnh đại diện"
        />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-xs text-secondary font-medium">Mô tả</h3>
        <textarea
          placeholder="Thêm mô tả..."
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          className="w-full bg-[rgb(var(--backgroundColor-surface-container)/.3)] text-sm text-primary placeholder:text-[rgb(var(--textColor-secondary))] outline-none border border-[rgb(var(--backgroundColor-state-enabled))] rounded-xl p-3 min-h-[80px] resize-none focus:border-[rgb(var(--textColor-primary)/0.3)] transition-colors"
          name="groupDescription"
          aria-label="Mô tả nhóm hoặc kênh"
        />
      </div>
    </>
  );
}

function ConversationInfoPanel({
  isActive,
  state,
  onTypeChange,
  onNameChange,
  onAvatarUrlChange,
  onDescriptionChange,
}: {
  isActive: boolean;
  state: Pick<CreateConversationState, "type" | "name" | "avatarUrl" | "description">;
  onTypeChange: (type: ConversationDraftType) => void;
  onNameChange: (name: string) => void;
  onAvatarUrlChange: (avatarUrl: string) => void;
  onDescriptionChange: (description: string) => void;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col gap-4 overflow-y-auto hide-scrollbar py-2 px-4 transition-all duration-300 ease-in-out ${isActive ? "opacity-100 translate-x-0 z-10 pointer-events-auto" : "opacity-0 -translate-x-8 z-0 pointer-events-none"
        }`}
    >
      <ConversationTypeToggle type={state.type} onTypeChange={onTypeChange} />
      <ConversationDetailsFields
        type={state.type}
        name={state.name}
        avatarUrl={state.avatarUrl}
        description={state.description}
        onNameChange={onNameChange}
        onAvatarUrlChange={onAvatarUrlChange}
        onDescriptionChange={onDescriptionChange}
      />
    </div>
  );
}

function MemberSearchField({
  searchQuery,
  onSearchQueryChange,
}: {
  searchQuery: string;
  onSearchQueryChange: (searchQuery: string) => void;
}) {
  return (
    <div className="sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div
          className="
            search-box flex items-center p-2.5 rounded-full
            transition-colors duration-200 flex-1
            bg-[rgb(var(--backgroundColor-state-enabled)/.575)]
            backdrop-blur-[12px]
          "
        >
          <span className="pl-1 pr-2 text-[rgb(var(--textColor-secondary))]">
            <SearchIcon />
          </span>
          <input
            placeholder="Tìm kiếm người dùng..."
            className="w-full bg-transparent text-body-sm outline-none text-primary placeholder:text-[rgb(var(--textColor-secondary))]"
            type="text"
            name="memberSearch"
            autoComplete="off"
            aria-label="Tìm kiếm người dùng"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchQueryChange("")}
              aria-label="Xóa từ khóa tìm kiếm"
              className="text-secondary hover:text-primary pl-2"
            >
              <CloseIcon size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MemberSearchSkeleton() {
  return (
    <div className="flex flex-col gap-1">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-2 rounded-xl animate-pulse">
          <div className="size-10 rounded-full bg-[rgb(var(--backgroundColor-state-enabled)/.4)] flex-shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 w-24 rounded bg-[rgb(var(--backgroundColor-state-enabled)/.4)]" />
            <div className="h-2.5 w-36 rounded bg-[rgb(var(--backgroundColor-state-enabled)/.25)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberResultButton({
  user,
  isSelected,
  onToggleMember,
}: {
  user: SearchUser;
  isSelected: boolean;
  onToggleMember: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggleMember(user.id)}
      aria-pressed={isSelected}
      className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors text-left ${isSelected ? "bg-[rgb(var(--backgroundColor-state-active))]" : "hover-surface"
        }`}
    >
      <div className="relative">
        <div className="size-10 rounded-full bg-[rgb(var(--backgroundColor-surface-container))] overflow-hidden flex-shrink-0">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.username}
              width={40}
              height={40}
              unoptimized
              className="size-10 object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[rgb(var(--backgroundColor-state-enabled)/.4)] text-primary font-medium">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {isSelected ? (
          <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-[rgb(var(--colors-blue-700))] text-white rounded-full flex items-center justify-center border-2 border-[rgb(var(--backgroundColor-surface))]">
            <CheckIcon size={10} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-semibold text-primary truncate">{user.username}</span>
        <span className="text-xs text-secondary truncate">{user.bio || "Sẵn sàng trò chuyện"}</span>
      </div>
    </button>
  );
}

function MemberResults({
  users,
  selectedMemberIds,
  isMemberSearching,
  memberSearchError,
  searchQuery,
  onToggleMember,
}: {
  users: SearchUser[];
  selectedMemberIds: Set<string>;
  isMemberSearching: boolean;
  memberSearchError: string | null;
  searchQuery: string;
  onToggleMember: (id: string) => void;
}) {
  if (isMemberSearching) return <MemberSearchSkeleton />;

  if (memberSearchError) {
    return <div className="text-center text-sm text-secondary py-4">{memberSearchError}</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-center text-sm text-secondary py-4">
        {searchQuery.trim() ? "Không tìm thấy người dùng" : "Không có bạn bè nào"}
      </div>
    );
  }

  return users.map((user) => (
    <MemberResultButton
      key={user.id}
      user={user}
      isSelected={selectedMemberIds.has(user.id)}
      onToggleMember={onToggleMember}
    />
  ));
}

function ConversationMembersPanel({
  isActive,
  state,
  selectedMemberIds,
  onSearchQueryChange,
  onToggleMember,
}: {
  isActive: boolean;
  state: Pick<
    CreateConversationState,
    "searchQuery" | "memberResults" | "isMemberSearching" | "memberSearchError"
  >;
  selectedMemberIds: Set<string>;
  onSearchQueryChange: (searchQuery: string) => void;
  onToggleMember: (id: string) => void;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col gap-3 overflow-y-auto hide-scrollbar py-2 px-4 transition-all duration-300 ease-in-out ${isActive ? "opacity-100 translate-x-0 z-10 pointer-events-auto" : "opacity-0 translate-x-8 z-0 pointer-events-none"
        }`}
    >
      <MemberSearchField
        searchQuery={state.searchQuery}
        onSearchQueryChange={onSearchQueryChange}
      />

      <div className="flex flex-col gap-1 mt-2 pb-4">
        <MemberResults
          users={state.memberResults}
          selectedMemberIds={selectedMemberIds}
          isMemberSearching={state.isMemberSearching}
          memberSearchError={state.memberSearchError}
          searchQuery={state.searchQuery}
          onToggleMember={onToggleMember}
        />
      </div>
    </div>
  );
}

function CreateConversationFooter({
  type,
  canSave,
  onSave,
}: {
  type: ConversationDraftType;
  canSave: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-shrink-0 pt-3 pb-4 px-4 border-t border-[rgb(var(--backgroundColor-state-enabled))]">
      <div className="flex flex-1 flex-row flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="flex items-center justify-center gap-2 bg-clip-border focus-visible:outline-2 focus-visible:outline-current focus-visible:-outline-offset-2 border border-[rgb(var(--textColor-primary)/0.13)] shadow-sm enabled-hover-surface enabled:active:bg-[rgb(var(--backgroundColor-state-active))] disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-glass text-subtitle-md px-3 h-9 flex-1 min-w-24 rounded-[20px] bg-[rgb(var(--backgroundColor-state-enabled))] text-primary transition-colors"
        >
          <span className="font-medium text-sm">{type === 2 ? "Tạo nhóm" : "Tạo kênh"}</span>
        </button>
      </div>
    </div>
  );
}

export default function CreateConversationForm({
  onBack,
  initialType = 2,
  onSearchMembers,
  onCreateConversation,
}: CreateConversationFormProps) {
  const [state, dispatch] = useReducer(
    createConversationReducer,
    initialType,
    createInitialState,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef(0);
  const selectedMemberIds = useMemo(() => new Set(state.memberIds), [state.memberIds]);
  const canSave = state.name.trim().length > 0 && state.memberIds.length > 0;

  useEffect(() => {
    if (!onSearchMembers) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const requestId = ++latestRef.current;
    const query = state.searchQuery.trim();
    const delay = query === "" ? 0 : 300;

    debounceRef.current = setTimeout(async () => {
      dispatch({ type: "startMemberSearch" });

      try {
        const users = await onSearchMembers(query);
        if (latestRef.current === requestId) {
          dispatch({ type: "memberSearchSuccess", users });
        }
      } catch {
        if (latestRef.current === requestId) {
          dispatch({
            type: "memberSearchError",
            message: "Không thể tải danh sách người dùng",
          });
        }
      }
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state.searchQuery, onSearchMembers]);

  const toggleMember = useCallback((id: string) => {
    dispatch({ type: "toggleMember", memberId: id });
  }, []);

  const handleSave = useCallback(() => {
    if (!canSave) return;

    onCreateConversation?.({
      name: state.name.trim(),
      type: state.type,
      avatar_url: state.avatarUrl || undefined,
      description: state.description.trim() || undefined,
      member_user_ids: state.memberIds,
    });
  }, [canSave, onCreateConversation, state]);

  return (
    <div className="flex flex-1 flex-col gap-2 min-h-0 text-primary">
      <CreateConversationHeader type={state.type} onBack={onBack} />
      <CreateConversationTabs
        activeTab={state.activeTab}
        memberCount={state.memberIds.length}
        onTabChange={(activeTab) => dispatch({ type: "setActiveTab", activeTab })}
      />

      <div className="flex-1 relative min-h-0 overflow-hidden">
        <ConversationInfoPanel
          isActive={state.activeTab === "info"}
          state={state}
          onTypeChange={(conversationType) =>
            dispatch({ type: "setConversationType", conversationType })
          }
          onNameChange={(name) => dispatch({ type: "setName", name })}
          onAvatarUrlChange={(avatarUrl) => dispatch({ type: "setAvatarUrl", avatarUrl })}
          onDescriptionChange={(description) => dispatch({ type: "setDescription", description })}
        />
        <ConversationMembersPanel
          isActive={state.activeTab === "members"}
          state={state}
          selectedMemberIds={selectedMemberIds}
          onSearchQueryChange={(searchQuery) => dispatch({ type: "setSearchQuery", searchQuery })}
          onToggleMember={toggleMember}
        />
      </div>

      <CreateConversationFooter type={state.type} canSave={canSave} onSave={handleSave} />
    </div>
  );
}
