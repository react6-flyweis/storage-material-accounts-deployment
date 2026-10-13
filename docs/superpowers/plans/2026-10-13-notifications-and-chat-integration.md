# Notifications & Chat Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate real-time notifications and team + customer direct communication into the Accounts Panel matching the design and functional standard of the Sales Panel.

**Architecture:** Connect to the backend `/admin` socket namespace with user auth token to handle real-time messaging, typing, and notifications; implement Redux Toolkit Query API slices for notifications, team chat, customer direct chat, and file uploads; replace static mock screens with rich, interactive UI components and dropdown menus.

**Tech Stack:** React 19, TypeScript, Redux Toolkit Query, Socket.io-client 4.8.4, Tailwind CSS v4, Lucide-react, React Router v7.

**Spec:** `docs/superpowers/specs/2026-10-13-notifications-and-chat-integration-design.md`

## Global Constraints
- Must use existing Redux store at `src/redux/store.ts` for auth state and API slice registration.
- Sockets must connect to `${VITE_API_BASE_URL}/admin` with auth token from `auth.accessToken`.
- Relative timestamps and notifications formatting must handle invalid date inputs gracefully.
- Responsive design: side panels and chat drawers must not overflow or break on mobile and desktop viewports.
- Maintain consistent visual styling with the Accounts Panel palette (`#1D51A4`, `#E5ECFF`, Tailwind v4).

## Review Focus
1. Sockets connection drop/reconnection: ensure listeners are cleaned up and reconnect without leaking event listeners.
2. Unread notification count when count exceeds 99: ensure pill renders "99+" without layout breaking.
3. Chat thread switching: ensure channel leave is properly emitted for the old chat before joining the new one.
4. Large or non-image file uploads: ensure presigned URL upload catches errors and formats attachment objects properly.
5. Empty state handling: gracefully handle empty notification lists, empty chat conversations, or search queries yielding zero results.

---

### Task 1: Sockets Foundation & Types

**Files:**
- Create: `src/lib/socket.ts`
- Create: `src/types/communication.ts`
- Create: `src/context/socketContextInstance.ts`
- Create: `src/context/SocketContext.tsx`
- Create: `src/context/useSocket.ts`

**Interfaces:**
- Produces:
  - `createAdminSocket(accessToken: string | null | undefined): Socket | null`
  - `useSocket(): SocketContextValue`
  - `SocketProvider: React.FC<{ children: ReactNode }>`
  - Types: `TeamMessage`, `TeamAttachment`, `ChatUser`, `ChatConversation`, `CustomerDirectMessage`, etc.

- [ ] **Step 1: Create `src/lib/socket.ts`**
  Implement socket factory connecting to `${VITE_API_BASE_URL}/admin` with `polling` fallback and token auth.

- [ ] **Step 2: Create `src/types/communication.ts`**
  Define message, attachment, typing, user, and notice types matching the backend socket payloads.

- [ ] **Step 3: Create `src/context/socketContextInstance.ts`, `SocketContext.tsx`, and `useSocket.ts`**
  Provide React Context with state for `socket`, `isConnected`, `joinChannel`, `leaveChannel`, `sendTypingStart`, `sendTypingStop`, `sendMessage`, `joinCustomerDirect`, and `leaveCustomerDirect`.

- [ ] **Step 4: Verify socket files compile**
  Run: `pnpm exec tsc --noEmit src/context/useSocket.ts` or project typecheck.

---

### Task 2: Notifications API Slice & Utilities

**Files:**
- Create: `src/modules/notifications/notifications.types.ts`
- Create: `src/modules/notifications/notifications.utils.ts`
- Create: `src/redux/api/notificationsApi.ts`
- Modify: `src/redux/store.ts`

**Interfaces:**
- Consumes: `baseQueryWithReauth` from `src/redux/api/baseQueryWithReauth.ts`
- Produces:
  - `useGetNotificationsQuery`
  - `useGetUnreadCountQuery`
  - `useMarkAsReadMutation`
  - `useMarkAllAsReadMutation`
  - `useDeleteNotificationMutation`
  - `formatNotificationTime`, `getNotificationTypeConfig`, `getNotificationRoute`

- [ ] **Step 1: Create `src/modules/notifications/notifications.types.ts`**
  Define `NotificationItem`, `NotificationStats`, `NotificationsData`, `NotificationsQueryParams`.

- [ ] **Step 2: Create `src/modules/notifications/notifications.utils.ts`**
  Implement `formatNotificationTime` (relative minutes/hours/days), `getNotificationTypeConfig` (icons and colors for task, delivery, drawing, payment, chat, etc.), and `getNotificationRoute`.

- [ ] **Step 3: Create `src/redux/api/notificationsApi.ts`**
  Implement RTK Query slice with endpoints:
  - `getNotifications`: `GET /api/notifications`
  - `getUnreadCount`: `GET /api/notifications/unread-count`
  - `markAsRead`: `PUT /api/notifications/:id/read`
  - `markAllAsRead`: `PUT /api/notifications/read-all`
  - `deleteNotification`: `DELETE /api/notifications/:id`
  Configured with `Notifications` and `UnreadCount` tag invalidation.

- [ ] **Step 4: Register `notificationsApi` in `src/redux/store.ts`**
  Add reducer and middleware to Redux store.

- [ ] **Step 5: Verify build with typecheck**
  Run: `pnpm exec tsc --noEmit`

---

### Task 3: Header Notification Menu Dropdown

**Files:**
- Create: `src/components/notification-menu.tsx`
- Modify: `src/components/common_components/Header.tsx:96-110`

**Interfaces:**
- Consumes:
  - `useGetNotificationsQuery`, `useGetUnreadCountQuery`, `useMarkAsReadMutation`, `useMarkAllAsReadMutation`
  - `getNotificationTypeConfig`, `formatNotificationTime`, `getNotificationRoute`
- Produces:
  - `<NotificationMenu />` exported component for Header.

- [ ] **Step 1: Implement `src/components/notification-menu.tsx`**
  Create notification dropdown menu:
  - Bell button trigger with unread badge counter (red pill, "99+" if > 99).
  - Dropdown content positioned cleanly (`absolute right-0 top-full mt-2 w-80`).
  - Header: "Notifications", unread count, and "Mark all read" button.
  - List: 5 most recent notifications with type icon, title, 2-line snippet, unread indicator dot, and relative time.
  - On click item: call `markAsRead(item._id)` and navigate to target route.
  - Footer: "View all notifications" link to `/notification`.
  - Handle outside click dismiss.

- [ ] **Step 2: Integrate `NotificationMenu` into `src/components/common_components/Header.tsx`**
  Replace static bell icon button with `<NotificationMenu />`.

- [ ] **Step 3: Test Header rendering**
  Verify the dropdown toggles on click and closes on outside click.

---

### Task 4: Notifications Full Page Upgrade

**Files:**
- Modify: `src/components/notifications/NotificationsView.tsx`

**Interfaces:**
- Consumes: `useGetNotificationsQuery`, `useMarkAsReadMutation`, `useMarkAllAsReadMutation`

- [ ] **Step 1: Connect `NotificationsView.tsx` to `useGetNotificationsQuery`**
  Remove mock notifications array.
  Bind active filter (All, Unread, Tasks, Chats, Meetings, Escalation, etc.) to API query params (`read`, `type`, `page`).

- [ ] **Step 2: Implement Stat Cards with live data**
  Display `Total`, `Unread`, `High Priority`, and `Today` from API `stats` response.

- [ ] **Step 3: Implement notification items & actions**
  Render items with type icon, title, body, priority badge, relative timestamp, and inline "Mark Read" button.
  Add "Mark all as read" button in the page header.

- [ ] **Step 4: Implement Pagination Controls**
  Add previous / next controls when total pages > 1.

- [ ] **Step 5: Verify NotificationsView page**
  Verify typecheck and clean empty state when no notifications exist.

---

### Task 5: Team Chat, Customer Direct Chat APIs & Upload Helper

**Files:**
- Create: `src/redux/api/teamChatApi.ts`
- Create: `src/redux/api/customerDirectChatApi.ts`
- Create: `src/modules/customer-direct-chat/customer-direct-chat.types.ts`
- Create: `src/lib/upload.ts`
- Modify: `src/redux/store.ts`

**Interfaces:**
- Produces:
  - `teamChatApi`: `useGetUsersQuery`, `useGetConversationsQuery`, `useGetDirectMessagesQuery`, `useGetGroupMessagesQuery`, `useGetGroupDetailsQuery`, `useUpdateGroupMembersMutation`, `useGetUnreadCountQuery`
  - `customerDirectChatApi`: `useGetCustomerDirectConversationsQuery`, `useGetCustomerDirectMessagesQuery`, `useSendCustomerDirectMessageMutation`
  - `uploadFileToS3(file: File, folder?: string, onProgress?: (percent: number) => void): Promise<string>`

- [ ] **Step 1: Implement `src/modules/customer-direct-chat/customer-direct-chat.types.ts`**
  Define customer chat conversation, customer message, and attachments interfaces.

- [ ] **Step 2: Implement `src/lib/upload.ts`**
  Implement S3 presigned URL retrieval from `/api/upload/presigned-url` and binary PUT to S3 with upload progress callback.

- [ ] **Step 3: Implement `src/redux/api/teamChatApi.ts`**
  Create RTK Query slice for users, conversations, direct messages, group messages, group details, and unread counts.

- [ ] **Step 4: Implement `src/redux/api/customerDirectChatApi.ts`**
  Create RTK Query slice for customer direct conversations and direct messages.

- [ ] **Step 5: Register both API slices in `src/redux/store.ts`**
  Add reducers and middleware to Redux store.

- [ ] **Step 6: Verify build typecheck**
  Run: `pnpm exec tsc --noEmit`

---

### Task 6: Communication UI Subcomponents

**Files:**
- Create: `src/components/communication/types.ts`
- Create: `src/components/communication/types.tsx`
- Create: `src/components/communication/ChatHeader.tsx`
- Create: `src/components/communication/ChatInputBar.tsx`
- Create: `src/components/communication/ChatMessageList.tsx`
- Create: `src/components/communication/ChatSidebar.tsx`
- Create: `src/components/communication/ChatDrawer.tsx`
- Create: `src/components/communication/ChatEmptyState.tsx`
- Create: `src/components/communication/NewChatModal.tsx`

**Interfaces:**
- Consumes: Socket methods, types from `src/types/communication.ts`
- Produces:
  - Reusable chat subcomponents for `CommunicationView`

- [ ] **Step 1: Implement `types.ts` and `types.tsx`**
  Define `ActiveChatState` supporting channel types (`direct`, `group`, `customer_direct`).

- [ ] **Step 2: Implement `ChatSidebar.tsx`**
  Sidebar with tabs for "Departments" / "Direct" (under Team) and Customer list (under Customers).
  Includes search, unread badge indicators, online presence, and "New Chat" modal launcher.

- [ ] **Step 3: Implement `ChatHeader.tsx`**
  Top bar displaying recipient name, avatars, participant count, and drawer toggle button.

- [ ] **Step 4: Implement `ChatMessageList.tsx`**
  Message thread supporting grouping by date, sender avatar, attachment cards (images, PDFs, documents), message status receipts, and typing indicators.

- [ ] **Step 5: Implement `ChatInputBar.tsx`**
  Text input area, attachment file button, upload preview chips, send button, keyboard Enter handling, and typing event dispatches.

- [ ] **Step 6: Implement `ChatDrawer.tsx`, `ChatEmptyState.tsx`, and `NewChatModal.tsx`**
  Drawer showing group info/members and shared files; empty state placeholder; modal to search and initiate chats with team members.

- [ ] **Step 7: Verify all communication components compile**
  Run: `pnpm exec tsc --noEmit`

---

### Task 7: Communication View & Global Socket Provider Integration

**Files:**
- Modify: `src/components/communication/CommunicationView.tsx`
- Modify: `src/App.tsx` or `src/components/layout/main-layout.tsx`

**Interfaces:**
- Consumes: All communication subcomponents, `useSocket`, `teamChatApi`, `customerDirectChatApi`, Redux user state
- Produces: Complete real-time communication experience at `/communication`.

- [ ] **Step 1: Mount `SocketProvider` in `src/App.tsx`**
  Wrap router inside `<SocketProvider>` so socket connection is live across the entire authenticated session.

- [ ] **Step 2: Implement full `CommunicationView.tsx`**
  Assemble main screen with:
  - Top tab switcher: "Team" vs "Customers".
  - Active channel joining/leaving via socket.
  - Message sending (socket `team_message` or REST `sendCustomerDirectMessage`).
  - Handling real-time incoming events (`new_team_message`, `customer_direct_message`, `team_typing`, `team_messages_read`).
  - Attachment uploading via `uploadFileToS3`.

- [ ] **Step 3: Wire navigation links and route paths**
  Confirm `/communication` and `/notification` routes and sidebar items work seamlessly.

---

### Task 8: Verification & End-to-End Build Test

**Files:**
- Verify all modified and created files

- [ ] **Step 1: Run TypeScript compiler check**
  Run: `pnpm exec tsc -b`
  Expected: Clean compilation with 0 errors.

- [ ] **Step 2: Run Vite build**
  Run: `pnpm exec vite build`
  Expected: Successful bundle generation with 0 errors.

- [ ] **Step 3: Verify dev server status**
  Confirm the running `pnpm dev` process is healthy with no runtime module errors.
