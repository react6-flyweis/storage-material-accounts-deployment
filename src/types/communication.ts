export interface TeamAttachment {
  url: string;
  name: string;
  type: string;
  size?: number;
}

export interface TeamMessage {
  _id: string;
  messageId?: string;
  customerId?: string;
  channelType: "direct" | "group" | "customer";
  senderType?: "customer" | "admin" | "sales" | "account" | string;
  groupId?: string;
  directKey?: string;
  participants?: string[];
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  content: string;
  attachments?: TeamAttachment[];
  readBy?: string[];
  isReadByCustomer?: boolean;
  isReadByStaff?: boolean;
  createdAt: string;
  updatedAt?: string;
  isOptimistic?: boolean;
  status?: "pending" | "sent" | "failed";
}

export interface TeamTypingPayload {
  channelType: "direct" | "group";
  channelId: string;
}

export interface TeamTypingEvent {
  isTyping: boolean;
  name: string;
  channelType?: "direct" | "group";
  channelId?: string;
  userId?: string;
}

export interface TeamDmNotice {
  fromUserId: string;
  fromName: string;
  content: string;
}

export interface TeamGroupNotice {
  groupId: string;
  fromName: string;
  content: string;
}

export interface TeamMessagesReadEvent {
  by: string;
  channelType: "direct" | "group";
  channelId: string;
}

export interface GroupMembersUpdatedEvent {
  groupId: string;
  members: Array<{
    _id: string;
    name: string;
    email?: string;
    role?: string;
    avatar?: string;
  }>;
}

export interface SendTeamMessagePayload {
  channelType: "direct" | "group";
  channelId: string;
  content: string;
  attachments?: TeamAttachment[];
}

export interface ChatUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status?: "active" | "inactive";
  isOnline?: boolean;
}

export interface ChatConversation {
  type: "direct" | "group";
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  unreadCount?: number;
  lastMessage?: {
    content: string;
    senderId?: string;
    senderName?: string;
    createdAt: string;
  };
  otherUser?: ChatUser;
  participantsCount?: number;
  isOnline?: boolean;
}
