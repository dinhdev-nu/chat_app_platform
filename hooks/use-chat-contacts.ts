"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/services/http";
import { userService } from "@/services/userService";
import type { PaginationMeta } from "@/types/api";
import { ContactStatus } from "@/types/user";
import type { ContactRequestStatusResponse, ContactUserResponse, SearchUser } from "@/types/user";

const DEFAULT_PAGE_LIMIT = 20;

interface LoadPageOptions {
  cursor?: string;
  append?: boolean;
  silent?: boolean;
}

interface UseChatContactsOptions {
  enabled?: boolean;
  limit?: number;
}

function addPendingId(ids: string[], id: string) {
  return ids.includes(id) ? ids : [...ids, id];
}

function removePendingId(ids: string[], id: string) {
  return ids.filter((itemId) => itemId !== id);
}

function toContactUser(user: SearchUser): ContactUserResponse {
  return {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
  };
}

function appendUniqueContact(contacts: ContactUserResponse[], contact: ContactUserResponse) {
  if (contacts.some((item) => item.id === contact.id)) return contacts;

  return [...contacts, contact].sort((left, right) => left.username.localeCompare(right.username));
}

function applyAcceptedStatus(user: SearchUser, userId: string): SearchUser {
  if (user.id !== userId) return user;

  return {
    ...user,
    outgoingStatus: ContactStatus.Accepted,
    incomingStatus: ContactStatus.Accepted,
  };
}

export function useChatContacts({ enabled = true, limit = DEFAULT_PAGE_LIMIT }: UseChatContactsOptions = {}) {
  const [contacts, setContacts] = useState<ContactUserResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<SearchUser[]>([]);
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [contactsPagination, setContactsPagination] = useState<PaginationMeta | null>(null);
  const [incomingPagination, setIncomingPagination] = useState<PaginationMeta | null>(null);
  const [hasRequestedIncomingRequests, setHasRequestedIncomingRequests] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingIncoming, setIsLoadingIncoming] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [incomingError, setIncomingError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [contactActionError, setContactActionError] = useState<string | null>(null);
  const [pendingContactActionIds, setPendingContactActionIds] = useState<string[]>([]);
  const latestSearchRequestId = useRef(0);

  const loadContacts = useCallback(
    async ({ cursor, append = false, silent = false }: LoadPageOptions = {}) => {
      if (!enabled) return;
      if (!silent) setIsLoadingContacts(true);
      setContactsError(null);

      try {
        const result = await userService.getContacts({ cursor, limit });

        setContacts((currentContacts) =>
          append ? [...currentContacts, ...result.data] : result.data,
        );
        setContactsPagination(result.pagination);
      } catch (error) {
        setContactsError(getApiErrorMessage(error));
      } finally {
        if (!silent) setIsLoadingContacts(false);
      }
    },
    [enabled, limit],
  );

  const loadIncomingRequests = useCallback(
    async ({ cursor, append = false, silent = false }: LoadPageOptions = {}) => {
      if (!enabled) return;
      if (!silent) setIsLoadingIncoming(true);
      setIncomingError(null);
      if (!append) setHasRequestedIncomingRequests(true);

      try {
        const result = await userService.getIncomingContactRequests({ cursor, limit });

        setIncomingRequests((currentRequests) =>
          append ? [...currentRequests, ...result.data] : result.data,
        );
        setIncomingPagination(result.pagination);
      } catch (error) {
        setIncomingError(getApiErrorMessage(error));
      } finally {
        if (!silent) setIsLoadingIncoming(false);
      }
    },
    [enabled, limit],
  );

  useEffect(() => {
    if (!enabled) return;

    const timeoutId = window.setTimeout(() => {
      void loadContacts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, loadContacts]);

  const searchUsers = useCallback(
    async (query: string) => {
      const trimmedQuery = query.trim();
      const requestId = latestSearchRequestId.current + 1;
      latestSearchRequestId.current = requestId;

      if (!enabled || !trimmedQuery) {
        setSearchResults([]);
        setSearchError(null);
        setIsSearchingUsers(false);
        return [];
      }

      setIsSearchingUsers(true);
      setSearchError(null);

      try {
        const result = await userService.searchUsers({ q: trimmedQuery, limit });

        if (latestSearchRequestId.current === requestId) {
          setSearchResults(result.data);
        }

        return result.data;
      } catch (error) {
        if (latestSearchRequestId.current === requestId) {
          setSearchResults([]);
          setSearchError(getApiErrorMessage(error));
        }

        return [];
      } finally {
        if (latestSearchRequestId.current === requestId) {
          setIsSearchingUsers(false);
        }
      }
    },
    [enabled, limit],
  );

  const sendContactRequest = useCallback(
    async (targetUserId: string): Promise<ContactRequestStatusResponse | undefined> => {
      if (!enabled) return undefined;

      setPendingContactActionIds((ids) => addPendingId(ids, targetUserId));
      setContactActionError(null);
      setSearchError(null);

      try {
        const result = await userService.sendContactRequest(targetUserId);
        const targetUser = searchResults.find((user) => user.id === targetUserId);

        setSearchResults((currentResults) =>
          currentResults.map((user) => {
            if (user.id !== targetUserId) return user;

            if (result.status === "accepted") {
              return applyAcceptedStatus(user, targetUserId);
            }

            return {
              ...user,
              outgoingStatus: ContactStatus.Pending,
            };
          }),
        );

        if (result.status === "accepted" && targetUser) {
          setContacts((currentContacts) => appendUniqueContact(currentContacts, toContactUser(targetUser)));
        }

        return result;
      } catch (error) {
        const message = getApiErrorMessage(error);
        setSearchError(message);
        setContactActionError(message);
        throw error;
      } finally {
        setPendingContactActionIds((ids) => removePendingId(ids, targetUserId));
      }
    },
    [enabled, searchResults],
  );

  const acceptContactRequest = useCallback(
    async (senderUserId: string) => {
      if (!enabled) return;

      const acceptedUser =
        incomingRequests.find((user) => user.id === senderUserId) ??
        searchResults.find((user) => user.id === senderUserId);

      setPendingContactActionIds((ids) => addPendingId(ids, senderUserId));
      setContactActionError(null);
      setIncomingError(null);
      setSearchError(null);

      try {
        await userService.acceptContactRequest(senderUserId);

        setIncomingRequests((currentRequests) =>
          currentRequests.filter((request) => request.id !== senderUserId),
        );
        setSearchResults((currentResults) =>
          currentResults.map((user) => applyAcceptedStatus(user, senderUserId)),
        );

        if (acceptedUser) {
          setContacts((currentContacts) => appendUniqueContact(currentContacts, toContactUser(acceptedUser)));
        }

      } catch (error) {
        const message = getApiErrorMessage(error);
        setIncomingError(message);
        setContactActionError(message);
        throw error;
      } finally {
        setPendingContactActionIds((ids) => removePendingId(ids, senderUserId));
      }
    },
    [enabled, incomingRequests, searchResults],
  );

  const loadMoreContacts = useCallback(async () => {
    if (!contactsPagination?.hasNext || !contactsPagination.nextCursor) return;

    await loadContacts({ cursor: contactsPagination.nextCursor, append: true });
  }, [contactsPagination, loadContacts]);

  const loadMoreIncomingRequests = useCallback(async () => {
    if (!incomingPagination?.hasNext || !incomingPagination.nextCursor) return;

    await loadIncomingRequests({ cursor: incomingPagination.nextCursor, append: true });
  }, [incomingPagination, loadIncomingRequests]);

  return {
    contacts: enabled ? contacts : [],
    incomingRequests: enabled ? incomingRequests : [],
    searchResults: enabled ? searchResults : [],
    contactsPagination: enabled ? contactsPagination : null,
    incomingPagination: enabled ? incomingPagination : null,
    hasRequestedIncomingRequests: enabled ? hasRequestedIncomingRequests : false,
    isLoadingContacts: enabled ? isLoadingContacts : false,
    isLoadingIncoming: enabled ? isLoadingIncoming : false,
    isSearchingUsers: enabled ? isSearchingUsers : false,
    contactsError: enabled ? contactsError : null,
    incomingError: enabled ? incomingError : null,
    searchError: enabled ? searchError : null,
    contactActionError: enabled ? contactActionError : null,
    pendingContactActionIds: enabled ? pendingContactActionIds : [],
    acceptContactRequest,
    loadContacts,
    loadIncomingRequests,
    loadMoreContacts,
    loadMoreIncomingRequests,
    searchUsers,
    sendContactRequest,
  };
}
