
# 1 Enable Firestore in the Firebase project
- 📄 SETUP TASK: Turn on Firestore in your Firebase project so a database actually exists.

## 1.1 CHECKPOINT Firestore console shows a created database in your chosen region
- You can visually see the Firestore Database page with the region badge.

### 1.1.1 STEP Create the database in test mode temporarily for the initial check
- This allows quick writes before locking down rules later.

#### 1.1.1.1 Instruction Ensure the Firestore Database page displays the database as enabled and reachable in your selected location.

# 2 Minimal connectivity check with SDK
- 📄 CREATE FILE: A temporary HTML page that writes a single document using the Firebase Web SDK to confirm connectivity.

## 2.1 CHECKPOINT A tiny test document appears in the console under a simple path
- You can expand collections and see a new document with fields.

### 2.1.1 STEP Use the Firebase Web SDK in a debug App Check environment
- This mirrors production behavior more closely than a REST test.

#### 2.1.1.1 Instruction Open the test page locally, verify it initializes Firebase, creates one test document under connectivity or chats slash connection check, and confirm the new doc appears in the Firestore console with a server write time.

# 3 Create Firebase initialization and Firestore setup files
- 📄 CREATE FILES: Add src slash lib slash firebase dot ts and src slash lib slash firestore dot ts to initialize Firebase, Firestore, and App Check.

## 3.1 CHECKPOINT The project runs locally and connects to Firestore successfully
- You can confirm that writes from your app appear in the Firestore console.

### 3.1.1 STEP Create src slash lib slash firebase dot ts with initialization logic
- Import initializeApp from firebase slash app, getFirestore from firebase slash firestore, and optionally initializeAppCheck with ReCaptchaV3Provider from firebase slash app check.

#### 3.1.1.1 Instruction 👁️ GATHER DATA: Copy your Firebase config object from Project Settings → Your Apps → Web App.  
Add this config into src slash lib slash firebase dot ts, initialize the app, initialize App Check using your ReCaptcha site key, and export both the Firebase app and Firestore instance.

### 3.1.2 STEP Create src slash lib slash firestore dot ts for chat message operations
- Define helper functions like saveMessage and loadSession to handle Firestore interactions.

#### 3.1.2.1 Instruction Ensure these helpers import firestore from firebase dot ts and perform writes to chats slash sessionId slash messages slash messageId following the defined data model.

### 3.1.3 STEP Update firebase dot json to include Firestore configuration
- Bundle all config updates together.

#### 3.1.3.1 Instruction Add a new firestore section:


"firestore": {
"rules": "firestore.rules",
"indexes": "firestore.indexes.json"
}



# 4 Define the data model for chat
- 📄 DESIGN CHANGE: Represent each chat as a document in chats slash sessionId, with one subcollection messages containing per-message documents.

## 4.1 CHECKPOINT Console shows chats slash sessionId with a messages subcollection
- You can click into a session and see individual message docs.

### 4.1.1 STEP Adopt the message document shape and avoid arrays for chat history
- Arrays rewrite the parent doc and scale poorly, so prefer subcollections.

#### 4.1.1.1 Instruction Verify at least one session document and one message document exist using the intended structure and fields for auditing.

# 5 Adopt the composite message ID
- 🔧 STRUCTURE: Use sessionId plus timestamp plus sender to keep IDs unique and ordered.

## 5.1 CHECKPOINT Message docs display IDs following the agreed pattern
- You can visually inspect IDs matching sessionId dash timestamp dash sender.

### 5.1.1 STEP Record sender text timestamp and sessionId fields on each message
- Keep the schema minimal and consistent across local and cloud storage.

#### 5.1.1.1 Instruction Confirm message documents include both the client timestamp and a serverTime field for accurate ordering in future admin views.

# 6 Write strategy fire and forget
- ⚙️ FLOW CHANGE: Keep UI instant locally and mirror to Firestore asynchronously.

## 6.1 CHECKPOINT Messages appear instantly in the UI and show up in Firestore shortly after
- You can see them locally immediately and in the console moments later.

### 6.1.1 STEP Persist locally first then enqueue each message to Firestore
- Do not block the interface while the network write occurs in the background.

#### 6.1.1.1 Instruction Validate that sending multiple messages rapidly still yields one document per message in the subcollection without duplication.

# 7 Read strategy and offline posture
- ⚙️ BEHAVIOR: Load locally for speed and use Firestore as durable storage and cache.

## 7.1 CHECKPOINT With persistence enabled later the app shows prior messages offline
- In offline mode the chat history still renders from the local cache.

### 7.1.1 STEP Enable Firestore offline persistence when wiring the SDK
- Web defaults to disabled so explicitly enable persistence for caching and queuing.

#### 7.1.1.1 Instruction Keep Local Storage as a temporary read-once fallback while Firestore persistence is validated, then remove Local Storage writes once proven stable.

# 8 Security rules baseline without end user login
- 📄 CREATE FILE: firestore dot rules to deny all reads and allow writes only when App Check is verified and schema fields are valid.

## 8.1 CHECKPOINT Anonymous clients cannot read any chat data but can write new messages
- A private window read fails while message creation still succeeds under allowed paths.

### 8.1.1 STEP Enforce write only to chats slash sessionId and its messages with field validation and require App Check
- Validate required fields and types and block all reads until admin area exists.

#### 8.1.1.1 Instruction Publish rules that deny reads globally and allow writes only when App Check is present and fields match the minimal schema, adding simple client-side throttling to limit spam.

# 9 Operational sanity and limits
- 🔧 PRACTICE: Stay within Firestore limits and only add indexes when prompted.

## 9.1 CHECKPOINT Console prompts for an index only when needed by a query
- You can see index build status and avoid premature indexing.

### 9.1.1 STEP Keep documents small and avoid packing many messages into one doc
- Respect the per document size limit and use subcollections to scale.

#### 9.1.1.1 Instruction Verify document sizes remain well below the documented maximum and that queries order by timestamp or serverTime succeed or prompt for an index.

# 10 Admin area later
- 🧩 ROADMAP: Plan for admin reads later with authenticated admins and read access limited to admins.

## 10.1 CHECKPOINT Admin console prototype lists sessions and shows ordered messages
- Admins can pick a chat by sessionId and review the chronological history.

### 10.1.1 STEP Add Firebase Auth for admins and a simple reader that queries by sessionId
- Restrict read access in rules to admin users with an admin claim when implemented.

#### 10.1.1.1 Instruction Document the intent to use Firebase Auth with custom claims for admins and update security rules to allow reads only for admin identities when the area ships.

