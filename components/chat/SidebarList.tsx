"use client";

import React from "react";
import ProjectItem from "./ProjectItem";
import ContactItem from "./ContactItem";
import { ConversationListItem } from "./conversation-data";
import { ContactUserResponse } from "./contact-data";

type Props = {
    activeTab: "all" | "friends";
    conversations: ConversationListItem[];
    contacts: ContactUserResponse[];
    activeConversationId?: string;
    onSelectConversation?: (conv: ConversationListItem) => void;
};

export default function SidebarList({
    activeTab,
    conversations,
    contacts,
    activeConversationId,
    onSelectConversation,
}: Props) {
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
                >
                    <ul>
                        {conversations.map((conversation) => (
                            <ProjectItem
                                key={conversation.id}
                                conversation={conversation}
                                isActive={conversation.id === activeConversationId}
                                onSelect={onSelectConversation}
                            />
                        ))}
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
                >
                    <ul>
                        {contacts.map((contact) => (
                            <ContactItem key={contact.id} contact={contact} />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
