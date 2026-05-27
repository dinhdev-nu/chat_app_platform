import { messageService } from "@/services/messageService";
import { wsService } from "@/services/wsService";

const sentReadMarkers = new Set<string>();

function getReadMarker(conversationId: string, lastReadMessageId: string) {
  return `${conversationId}:${lastReadMessageId}`;
}

export async function markConversationRead(
  conversationId: string,
  lastReadMessageId?: string | null,
) {
  if (!conversationId || !lastReadMessageId || lastReadMessageId.startsWith("local_")) {
    return false;
  }

  const readMarker = getReadMarker(conversationId, lastReadMessageId);
  if (sentReadMarkers.has(readMarker)) return true;

  const sentByWs = wsService.sendRead(conversationId, lastReadMessageId);
  if (sentByWs) {
    sentReadMarkers.add(readMarker);
    return true;
  }

  try {
    await messageService.markAsRead(conversationId, lastReadMessageId);
    sentReadMarkers.add(readMarker);
    return true;
  } catch {
    return false;
  }
}
