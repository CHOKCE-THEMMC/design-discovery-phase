# Admin Messaging, Broadcasts & Contact Inbox

Three connected features sharing one messaging backbone.

## 1. WhatsApp-style Admin ↔ User Chat

A real-time 1-to-1 conversation system between admins and any approved user.

**UI**
- New page `/messages` (users) and a "Messages" tab in Admin Dashboard.
- Two-pane layout: left = conversation list (avatar, name, last message, unread badge, time), right = chat thread (message bubbles, own = right/primary, other = left/muted, timestamps, read ticks).
- Sticky composer with textarea + Send. Enter sends, Shift+Enter newline.
- Mobile: list collapses to full screen, tap opens thread; back button returns.
- Unread count badge on Navbar bell/messages icon.

**Behavior**
- Users see only their own conversation (auto-created with "Admins" on first message).
- Admins see all conversations, can open any, reply, and mark read.
- Live updates via Supabase Realtime.

## 2. Admin Unicast & Broadcast

In Admin Dashboard → new "Messaging" tab:
- **Unicast:** pick a user (searchable list filterable by role/program/year) → opens that conversation.
- **Broadcast:** compose a message + audience filter (All users / Students only / By program / By year level). On send, fan-out creates a notification + an inbox message for each recipient. Shows recipient count preview before sending.

## 3. Fully Functional Contact Section

The existing `/contact` page currently fakes submission. Wire it to the database:
- Save submissions to `contact_messages` table (already exists).
- Admin Dashboard → "Contact Inbox" tab: list messages (name, email, subject, snippet, time, status), open to read full message, reply via email link (mailto) or mark resolved/archived.
- Email notification to admin on new contact submission (uses existing Resend setup).

---

## Technical Details

**New tables (migration):**
- `conversations` (id, user_id, last_message_at, unread_for_user, unread_for_admin)
  - One row per user; admins share access via role.
- `messages` (id, conversation_id, sender_id, sender_role 'user'|'admin', body, read_at, created_at)
- `broadcasts` (id, sender_id, body, audience jsonb, recipient_count, created_at) — audit log.

**RLS:**
- `conversations`: user can SELECT/UPDATE their own row; admins SELECT/UPDATE all.
- `messages`: user can SELECT/INSERT where conversation belongs to them; admins SELECT/INSERT all.
- `contact_messages`: already exists — add admin SELECT/UPDATE policy if missing.

**Realtime:** enable on `messages` and `conversations`.

**Edge function `broadcast-message`:** admin-only, validates JWT + admin role, expands audience filter via service role, inserts messages into each recipient's conversation (creating if missing), records broadcast row, optionally emits notifications.

**Contact wiring:**
- `Contact.tsx` posts to `contact_messages` (anon INSERT policy) and triggers `send-notification-email` to admin.
- New `ContactInbox.tsx` admin component.

**Files to add:**
- `src/pages/Messages.tsx`
- `src/components/messaging/ConversationList.tsx`
- `src/components/messaging/ChatThread.tsx`
- `src/components/messaging/MessageComposer.tsx`
- `src/components/admin/AdminMessaging.tsx` (unicast + broadcast)
- `src/components/admin/ContactInbox.tsx`
- `src/hooks/use-messages.tsx`
- `supabase/functions/broadcast-message/index.ts`

**Files to edit:**
- `src/App.tsx` (route)
- `src/components/layout/Navbar.tsx` (Messages link + unread badge)
- `src/pages/admin/AdminDashboard.tsx` (Messaging + Contact Inbox tabs)
- `src/pages/Contact.tsx` (real submit)
- `supabase/config.toml` (register new function)

---

## Open questions

1. For broadcasts, should each recipient get a **personal copy** (separate conversation thread, can reply 1-to-1) or a **read-only announcement** (notification only, no reply)? Personal copy = more like WhatsApp, heavier; announcement = simpler.
2. Should non-students (lecturers, mods) also receive broadcasts by default, or students only unless explicitly chosen?
3. Attachments (images/files) in chat — include now or text-only v1?
