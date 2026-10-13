# Design Document: Notifications & Communication Integration (Accounts Panel)

## 1. Overview & Goals
Integrate comprehensive real-time notifications and communications into `mr-storage-accounts-panel`, porting and aligning with the architecture established in `the-steel-sales-panel`.

### Goals:
- **Notifications**:
  - Integrate `/api/notifications` and `/api/notifications/unread-count`.
  - Add a live `NotificationMenu` in the top header (`Header.tsx`) showing live unread count badges, formatted relative timestamps, quick read-state toggles, and links to full notifications.
  - Upgrade the `/notification` route (`NotificationsView.tsx`) from mock data to live data with key metrics (Total, Unread, High Priority, Today), multi-category filtering, priority badges, and pagination.
- **Communication**:
  - Connect to the backend `/admin` socket namespace with the logged-in user's token (`socket.io-client`).
  - Provide both **Team Chats** (Department channels & 1-on-1 team direct messages) and **Customer Direct Chats** (conversations with customers).
  - Enable file and media attachment uploads through S3 presigned URLs (`/api/upload/presigned-url`).
  - Real-time events for message sending/receiving, typing indicators, read receipts, and member management drawers.

---

## 2. Architecture & Data Flow

### 2.1 Backend Contract
- **Notifications**:
  - `GET /api/notifications` (query params: `page`, `limit`, `type`, `priority`, `read`)
  - `GET /api/notifications/unread-count`
  - `PUT /api/notifications/:id/read`
  - `PUT /api/notifications/read-all`
  - `DELETE /api/notifications/:id`
- **Team Chat**:
  - `GET /api/team-chat/users` (search users)
  - `GET /api/team-chat/conversations` (team conversations)
  - `GET /api/team-chat/unread-count` (team chat unread count)
  - `GET /api/team-chat/direct/:userId/messages`
  - `GET /api/team-chat/groups/:groupId/messages`
  - `GET /api/team-chat/groups/:groupId`
  - `PUT /api/team-chat/groups/:groupId/members`
  - `POST /api/team-chat/groups`
- **Customer Direct Chat**:
  - `GET /api/customer-direct-chat/conversations`
  - `GET /api/customer-direct-chat/:customerId/messages`
  - `POST /api/customer-direct-chat/:customerId/messages`
- **File Upload**:
  - `POST /api/upload/presigned-url` -> upload directly to S3 via PUT

### 2.2 Sockets & Real-Time Sync
- Single socket instance created in `src/lib/socket.ts` connecting to `${VITE_API_BASE_URL}/admin` with `auth: { token: accessToken }`.
- `SocketContext` provides:
  - `isConnected`, `socket`
  - `joinChannel`, `leaveChannel`, `sendTypingStart`, `sendTypingStop`, `sendMessage`
  - `joinCustomerDirect`, `leaveCustomerDirect`
  - Global listeners for `new_team_dm_notice`, `new_team_group_message_notice`, `new_team_group`, `group_members_updated`, `customer_direct_chat_updated`.

### 2.3 State Management
- RTK Query API slices registered in Redux:
  - `notificationsApi`: manages notifications queries and mutations with tag invalidation.
  - `teamChatApi`: manages team chat conversations, users, messages, group details.
  - `customerDirectChatApi`: manages customer conversations and direct messages.
  - `uploadApi` / helper: handles presigned URL generation and direct S3 uploads.
- Socket context wraps the main app/layout with access to the persisted Redux auth state.

---

## 3. UI/UX Structure

### 3.1 Header Notification Menu (`src/components/notification-menu.tsx`)
- Trigger button with bell icon and red unread counter badge.
- Floating dropdown containing:
  - Header with total unread count and "Mark all read" button.
  - Scrollable notification list (latest 5) with priority icon styling, body preview, and time elapsed.
  - Clicking an item marks it read and navigates to the target entity or `/notification`.
  - Bottom action link: "View all notifications" -> `/notification`.

### 3.2 Notifications View (`src/components/notifications/NotificationsView.tsx`)
- Stat Cards: Total Notifications, Unread, High Priority, Today.
- Filter toolbar: All, Unread, Tasks, Chats, Meetings, Escalations, System, Payments.
- List view: Dynamic type icons, priority badges (`High`, `Medium`, `Low`), bold unread indicators, individual "Mark Read" buttons.
- Pagination bar with prev/next controls.

### 3.3 Communication View (`src/components/communication/CommunicationView.tsx`)
- Top tabs: "Team" vs "Customers".
- Sub-tabs under Team: "Departments" vs "Direct".
- Left Sidebar (`ChatSidebar`):
  - Search input.
  - Conversation items with avatars, names, roles, unread badges, and last message snippet.
  - "New Chat" button to initiate direct team conversations.
- Main Area:
  - `ChatHeader`: Conversation name, participant avatars/count, info drawer toggle.
  - `ChatMessageList`: Bubble list with grouped dates, sender avatars, attachments preview, read status, and real-time typing indicator.
  - `ChatInputBar`: Text input, attachment file picker, file progress, emoji / send button.
- Details Drawer (`ChatDrawer`):
  - Shows group members, admin statuses, options to add members (for group chats), and shared media/files.
- Modals:
  - `NewChatModal`: Search team members to start a new chat.

---

## 4. Constraints & Conventions
- Maintain compatibility with React 19 and Tailwind CSS v4.
- Follow existing color variables (`var(--button-bg-primary-color)`, `#1D51A4`, `#E5ECFF`).
- Clean error fallbacks and empty states when sockets are reconnecting or data is empty.
