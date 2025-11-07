# 1 Enable Firestore in the Firebase project
- Turn on Firestore in your project so a database actually exists.

## 1.1 CHECKPOINT Firestore console shows a created database in your chosen region
- You can visually see the Firestore Database page with the region badge.

### 1.1.1 STEP Create the database in test mode temporarily for the initial check
- This allows quick writes before locking down rules later.

#### 1.1.1.1 Instruction Ensure the Firestore Database page displays the database as enabled and reachable in your selected location.

# 2 Minimal connectivity check via REST
- Prove your project accepts Firestore writes without touching the app code.

## 2.1 CHECKPOINT A tiny test document appears in the console under a simple path
- You can expand collections and see a new document with fields.

### 2.1.1 STEP Use a single authenticated REST call to create one test document
- Obtain an access token, call the Firestore REST endpoint, and target your project.

#### 2.1.1.1 Instruction Confirm a new document exists at a simple path like connectivity or chats slash connection check with a visible field and server write time.

# 3 Define the data model for chat
- Use a session document and a messages subcollection with one document per message.

## 3.1 CHECKPOINT Console shows chats slash sessionId with a messages subcollection
- You can click into a session and see individual message docs.

### 3.1.1 STEP Adopt the message document shape and avoid arrays for chat history
- Arrays rewrite the parent doc and scale poorly, so prefer subcollections.

#### 3.1.1.1 Instruction Verify at least one session document and one message document exist using the intended structure and fields for auditing.

# 4 Adopt the composite message ID
- Use sessionId plus timestamp plus sender to keep IDs unique and ordered.

## 4.1 CHECKPOINT Message docs display IDs following the agreed pattern
- You can visually inspect IDs matching sessionId dash timestamp dash sender.

### 4.1.1 STEP Record sender text timestamp and sessionId fields on each message
- Keep the schema minimal and consistent across local and cloud storage.

#### 4.1.1.1 Instruction Confirm message documents sort correctly by timestamp and the ID format is consistently applied for user and bot messages.

# 5 Write strategy fire and forget
- Keep UI instant locally and mirror to Firestore asynchronously.

## 5.1 CHECKPOINT Messages appear instantly in the UI and show up in Firestore shortly after
- You can see them locally immediately and in the console moments later.

### 5.1.1 STEP Persist locally first then enqueue each message to Firestore
- Do not block the interface while the network write occurs in the background.

#### 5.1.1.1 Instruction Validate that sending multiple messages rapidly still yields one document per message in the subcollection without duplication.

# 6 Read strategy and offline posture
- Load locally for speed and use Firestore as durable storage and cache.

## 6.1 CHECKPOINT With persistence enabled later the app shows prior messages offline
- In offline mode the chat history still renders from the local cache.

### 6.1.1 STEP Enable Firestore offline persistence when wiring the SDK
- Web defaults to disabled so explicitly enable persistence for caching and queuing.

#### 6.1.1.1 Instruction Confirm that turning off network in developer tools still shows the last loaded messages and newly sent messages queue until online.

# 7 Security rules baseline
- Move off test mode and restrict access to each user’s own chats.

## 7.1 CHECKPOINT Unauthorized reads or writes are denied with a clear error
- In a private window the same path returns a permission denied message.

### 7.1.1 STEP Write rules tying chats and messages access to the authenticated user
- Ensure owners can read and write their sessions and others cannot.

#### 7.1.1.1 Instruction Publish rules then validate that only signed in owners can read and write their session documents and message documents.

# 8 Operational sanity and limits
- Stay within Firestore limits and only add indexes when prompted.

## 8.1 CHECKPOINT Console prompts for an index only when needed by a query
- You can see index build status and avoid premature indexing.

### 8.1.1 STEP Keep documents small and avoid packing many messages into one doc
- Respect the per document size limit and use subcollections to scale.

#### 8.1.1.1 Instruction Verify document sizes remain well below the documented maximum and that queries order by timestamp succeed or prompt for an index.
