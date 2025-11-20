# Messaging System Setup Guide

## Quick Setup (3 Steps)

### Step 1: Create the Messages Table

Navigate to the backend directory and run:

```bash
cd backend
python setup_messages.py
```

**Expected Output:**
```
Creating Flask app...
Creating messages table...
✅ Messages table created successfully!
```

### Step 2: Restart Your Backend Server

Stop your current Flask server (Ctrl+C) and restart it:

```bash
cd backend
python -m flask run
```

**OR** if you use a virtual environment:

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

python -m flask run
```

### Step 3: Test the Messaging System

1. Open your browser and login to the application
2. Navigate to any dashboard (Admin, Buyer, or Farmer)
3. Click on the **"Messages"** tab
4. Click **"New Message"** to start messaging!

---

## How to Use the Messaging System

### As Admin:

1. **Login** as admin
2. Go to **Messages** tab
3. Click **"New Message"**
4. Select **Buyer** or **Farmer** using radio buttons
5. Choose the specific user from the dropdown
   - For Buyers: Shows Name - Email (City, State)
   - For Farmers: Shows Name - Farm Name (Location)
6. Enter subject (optional) and message
7. Click **"Send Message"**

### As Buyer or Farmer:

1. **Login** as buyer or farmer
2. Go to **Messages** tab
3. Click **"New Message"**
4. Select **Admin** from dropdown
5. Enter subject (optional) and message
6. Click **"Send Message"**

### Viewing and Replying to Messages:

1. Go to **Messages** tab
2. See all conversations listed
3. **Unread messages** have a green badge showing count
4. Click on any conversation to open the full thread
5. Type your reply in the text box at the bottom
6. Click the send button to reply

---

## Features

✅ **Bidirectional Messaging**
- Admin ↔ Buyer
- Admin ↔ Farmer
- Buyers/Farmers can only message Admin
- Admin can message any Buyer or Farmer

✅ **Message Threading**
- All messages grouped by conversation
- Reply to any message in the thread
- See full conversation history

✅ **Unread Tracking**
- Unread count badge on Messages tab
- Green highlight on unread conversations
- Messages marked as read when opened

✅ **Visual Indicators**
- ✓✓ Double checkmark for read messages
- 🕐 Clock icon for unread messages
- Role badges (admin/buyer/farmer)
- Relative timestamps ("5m ago", "2h ago")

✅ **User Selection (Admin)**
- Radio buttons to switch between Buyers/Farmers
- Dropdown with detailed user information
- Search through all active users

---

## Troubleshooting

### Problem: "no such table: messages"

**Solution:**
```bash
cd backend
python setup_messages.py
```

### Problem: "ModuleNotFoundError: No module named 'flask'"

**Solution:** Activate your virtual environment first:
```bash
cd backend
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Then run setup
python setup_messages.py
```

### Problem: Messages not loading

**Solution:**
1. Check backend server is running
2. Check browser console for errors
3. Verify messages table exists:
   ```bash
   cd backend
   python -c "from app import create_app, db; app = create_app(); app.app_context().push(); print(db.engine.table_names())"
   ```

### Problem: Can't select users to message

**Solution:**
- **Admin:** Make sure buyers/farmers exist in the database
- **Buyer/Farmer:** Admin user (ID: 1) should exist
- Restart backend server after creating users

---

## Database Schema

The messages table structure:

```sql
messages
├── id (Primary Key)
├── sender_id (Foreign Key → users.id)
├── receiver_id (Foreign Key → users.id)
├── subject (VARCHAR 200)
├── message (TEXT)
├── thread_id (VARCHAR 100, indexed)
├── parent_message_id (Foreign Key → messages.id, nullable)
├── is_read (BOOLEAN, default: false, indexed)
├── read_at (DATETIME, nullable)
└── created_at (DATETIME, indexed)

Indexes:
- ix_messages_sender_id
- ix_messages_receiver_id
- ix_messages_thread_id
- ix_messages_is_read
- ix_messages_created_at
```

---

## API Endpoints

All endpoints require JWT authentication:

```
POST   /api/messages/send              - Send a new message
GET    /api/messages/inbox             - Get received messages
GET    /api/messages/sent              - Get sent messages
GET    /api/messages/conversations     - Get all conversation threads
GET    /api/messages/thread/<id>       - Get specific conversation
GET    /api/messages/<id>              - Get specific message
PATCH  /api/messages/<id>/read         - Mark message as read
GET    /api/messages/unread-count      - Get unread message count
DELETE /api/messages/<id>              - Delete message
GET    /api/messages/users/buyers      - Get all buyers (admin only)
GET    /api/messages/users/farmers     - Get all farmers (admin only)
```

---

## Files Created/Modified

### Backend Files:
- ✅ `backend/app/models/message.py` - Message model
- ✅ `backend/app/routes/messages.py` - Message API routes
- ✅ `backend/app/__init__.py` - Registered messages blueprint
- ✅ `backend/setup_messages.py` - Setup script
- ✅ `backend/create_messages_table.sql` - SQL script (alternative)

### Frontend Files:
- ✅ `frontend/src/components/Messages.jsx` - Reusable Messages component
- ✅ `frontend/src/pages/admin/Dashboard.jsx` - Added Messages tab
- ✅ `frontend/src/pages/buyer/Dashboard.jsx` - Added Messages tab
- ✅ `frontend/src/pages/farmer/Dashboard.jsx` - Added Messages tab

---

## Testing the System

### Test Scenario 1: Admin → Buyer

1. Login as admin
2. Go to Messages → New Message
3. Select "Buyer" radio button
4. Choose a buyer from dropdown
5. Send: "Hi, how can I help you?"
6. Logout and login as that buyer
7. See message in Messages tab
8. Reply to the admin

### Test Scenario 2: Farmer → Admin

1. Login as farmer
2. Go to Messages → New Message
3. Select "Admin"
4. Send: "I need help with my product listing"
5. Logout and login as admin
6. See message with unread badge
7. Click conversation and reply

### Test Scenario 3: Thread Continuation

1. Continue replying in existing conversation
2. All messages grouped together
3. Messages show as read/unread
4. Timestamps update correctly

---

## Next Steps

After setup is complete:

1. ✅ Create test messages between different user types
2. ✅ Verify unread counts work correctly
3. ✅ Test message threading (multiple replies)
4. ✅ Check read receipts update properly
5. ✅ Verify admin can see all buyers and farmers

---

## Support

If you encounter any issues:

1. Check backend server logs for errors
2. Check browser console for frontend errors
3. Verify database table exists
4. Ensure all files are properly saved
5. Restart both frontend and backend servers

---

**Your messaging system is ready to use! 🎉**
