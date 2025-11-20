-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    thread_id VARCHAR(100) NOT NULL,
    parent_message_id INTEGER,
    is_read BOOLEAN NOT NULL DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id),
    FOREIGN KEY (receiver_id) REFERENCES users (id),
    FOREIGN KEY (parent_message_id) REFERENCES messages (id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ix_messages_sender_id ON messages (sender_id);
CREATE INDEX IF NOT EXISTS ix_messages_receiver_id ON messages (receiver_id);
CREATE INDEX IF NOT EXISTS ix_messages_thread_id ON messages (thread_id);
CREATE INDEX IF NOT EXISTS ix_messages_is_read ON messages (is_read);
CREATE INDEX IF NOT EXISTS ix_messages_created_at ON messages (created_at);
