"use client";

import React, { useEffect, useRef, useCallback } from "react";
import ConversationItem from "./ConversationItem";
import ContactItem from "./ContactItem";
import { ConversationListItem } from "./conversation-data";
import { ContactUserResponse } from "./contact-data";

type Props = {
    activeTab: "all" | "friends";
    conversations: ConversationListItem[];
    contacts: ContactUserResponse[];
    activeConversationId?: string;
    onSelectConversation?: (conv: ConversationListItem) => void;
    onSelectContact?: (contact: ContactUserResponse) => void;
    isContactsLoading?: boolean;
    contactsError?: string | null;
    onLoadMoreConversations?: () => void;
    hasMoreConversations?: boolean;
};

function SidebarList({
    activeTab,
    conversations,
    contacts,
    activeConversationId,
    onSelectConversation,
    onSelectContact,
    isContactsLoading = false,
    contactsError,
    onLoadMoreConversations,
    hasMoreConversations,
}: Props) {
    const observer = useRef<IntersectionObserver | null>(null);

    const lastConversationElementRef = useCallback(
        (node: HTMLElement | null) => {
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMoreConversations && onLoadMoreConversations) {
                    onLoadMoreConversations();
                }
            });

            if (node) observer.current.observe(node);
        },
        [hasMoreConversations, onLoadMoreConversations],
    );

    return (
        <div className="relative w-full overflow-hidden">
            <div
                className="flex"
                style={{
                    width: "200%",
                    transform: activeTab === "all" ? "translateX(0%)" : "translateX(-50%)",
                    transition: "transform 520ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                <div
                    style={{
                        width: "50%",
                        transition: "opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
                        opacity: activeTab === "all" ? 1 : 0.92,
                        transform: activeTab === "all" ? "translateY(0px)" : "translateY(2px)",
                    }}
                    className="px-0"
                    aria-hidden={activeTab !== "all"}
                    inert={activeTab !== "all"}
                >
                    <ul>
                        {conversations.length > 0 ? (
                            conversations.map((conversation, index) => {
                                const isLast = index === conversations.length - 1;
                                return (
                                    <div key={conversation.id} ref={isLast ? lastConversationElementRef : null}>
                                        <ConversationItem
                                            conversation={conversation}
                                            isActive={conversation.id === activeConversationId}
                                            onSelect={onSelectConversation}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <li className="px-3 py-8 text-center text-sm text-secondary">
                                Chưa có hội thoại
                            </li>
                        )}
                    </ul>
                </div>

                <div
                    style={{
                        width: "50%",
                        transition: "opacity 420ms cubic-bezier(0.16, 1, 0.3, 1), transform 420ms cubic-bezier(0.16, 1, 0.3, 1)",
                        opacity: activeTab === "friends" ? 1 : 0.92,
                        transform: activeTab === "friends" ? "translateY(0px)" : "translateY(2px)",
                    }}
                    className="px-0"
                    aria-hidden={activeTab !== "friends"}
                    inert={activeTab !== "friends"}
                >
                    <ul>
                        {isContactsLoading && contacts.length === 0 ? (
                            <li className="px-3 py-8 text-center text-sm text-secondary">
                                Đang tải bạn bè...
                            </li>
                        ) : contactsError ? (
                            <li className="px-3 py-8 text-center text-sm text-[rgb(var(--textColor-danger))]" role="alert">
                                {contactsError}
                            </li>
                        ) : contacts.length > 0 ? (
                            contacts.map((contact) => (
                                <ContactItem
                                    key={contact.id}
                                    contact={contact}
                                    onSelect={onSelectContact}
                                />
                            ))
                        ) : (
                            <li className="px-3 py-8 text-center text-sm text-secondary">
                                Chưa có bạn bè
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default React.memo(SidebarList);
