import { useState, useEffect, useRef } from 'react';
import { Mail, Send, Inbox, MessageSquare, ArrowLeft, Clock, CheckCheck } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function Messages() {
  const { user } = useAuthStore();
  const [view, setView] = useState('conversations'); // 'conversations', 'thread', 'compose'
  const [conversations, setConversations] = useState([]);
  const [currentThread, setCurrentThread] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Compose message state
  const [receiverId, setReceiverId] = useState('');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [userType, setUserType] = useState('buyer'); // 'buyer' or 'farmer' for admin

  // Refs for auto-focus
  const replyTextareaRef = useRef(null);
  const composeTextareaRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
    if (user.role === 'admin') {
      fetchBuyers();
      fetchFarmers();
    } else {
      fetchAdminUsers();
    }
  }, []);

  // Auto-focus textarea when view changes
  useEffect(() => {
    if (view === 'thread' && replyTextareaRef.current) {
      setTimeout(() => replyTextareaRef.current?.focus(), 100);
    } else if (view === 'compose' && composeTextareaRef.current) {
      setTimeout(() => composeTextareaRef.current?.focus(), 100);
    }
  }, [view, threadMessages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/messages/unread-count');
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      // For now, we'll just set a placeholder admin ID
      // In a real app, you might have an endpoint to get admin users
      setAdminUsers([{ id: 1, name: 'Admin' }]);
    } catch (error) {
      console.error('Failed to load admin users:', error);
    }
  };

  const fetchBuyers = async () => {
    try {
      const response = await api.get('/messages/users/buyers');
      setBuyers(response.data.buyers || []);
    } catch (error) {
      console.error('Failed to load buyers:', error);
    }
  };

  const fetchFarmers = async () => {
    try {
      const response = await api.get('/messages/users/farmers');
      setFarmers(response.data.farmers || []);
    } catch (error) {
      console.error('Failed to load farmers:', error);
    }
  };

  const fetchThread = async (threadId) => {
    setLoading(true);
    try {
      const response = await api.get(`/messages/thread/${threadId}`);
      setThreadMessages(response.data.messages || []);
      setView('thread');

      // Refresh conversations to update unread counts
      fetchConversations();
      fetchUnreadCount();
    } catch (error) {
      console.error('Failed to load thread:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!receiverId || !messageText) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/messages/send', {
        receiver_id: receiverId,
        subject: subject || 'No Subject',
        message: messageText
      });

      toast.success('Message sent successfully');
      setReceiverId('');
      setSubject('');
      setMessageText('');
      setView('conversations');
      fetchConversations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const replyToMessage = async (e) => {
    e.preventDefault();

    if (!messageText) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const firstMessage = threadMessages[0];
      const otherUserId = firstMessage.sender_id === user.id ? firstMessage.receiver_id : firstMessage.sender_id;

      await api.post('/messages/send', {
        receiver_id: otherUserId,
        subject: firstMessage.subject,
        message: messageText,
        parent_message_id: threadMessages[threadMessages.length - 1].id
      });

      toast.success('Reply sent successfully');
      setMessageText('');

      // Refresh thread
      fetchThread(currentThread);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reply');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Conversations List View
  const ConversationsView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        <button
          onClick={() => setView('compose')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Send className="h-4 w-4" />
          <span>New Message</span>
        </button>
      </div>

      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">You have {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading conversations...</div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No messages yet</p>
          <button
            onClick={() => setView('compose')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Send your first message
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.thread_id}
              onClick={() => {
                setCurrentThread(conv.thread_id);
                fetchThread(conv.thread_id);
              }}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow ${
                conv.unread_count > 0 ? 'border-l-4 border-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-800">{conv.other_user_name}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {conv.other_user_role}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        {conv.unread_count} new
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {conv.last_message.message}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-500">{formatDate(conv.last_message.created_at)}</span>
                  {conv.last_message.is_read ? (
                    <CheckCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Thread View
  const ThreadView = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => {
            setView('conversations');
            setCurrentThread(null);
            setThreadMessages([]);
          }}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Conversation</h2>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Messages */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {threadMessages.map((msg) => {
            const isSent = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md ${isSent ? 'bg-green-100' : 'bg-gray-100'} rounded-lg p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-sm">{msg.sender_name}</span>
                    <span className="text-xs text-gray-500">{formatDate(msg.created_at)}</span>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Form */}
        <form onSubmit={replyToMessage} className="border-t p-4">
          <div className="flex space-x-2">
            <textarea
              ref={replyTextareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your reply..."
              rows="3"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
              minLength={1}
              autoFocus
              dir="ltr"
              style={{ textAlign: 'left', direction: 'ltr' }}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 self-end"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Compose Message View
  const ComposeView = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setView('conversations')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">New Message</h2>
      </div>

      <form onSubmit={sendMessage} className="bg-white rounded-lg shadow p-6 space-y-4">
        {user.role === 'admin' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message To</label>
              <div className="flex space-x-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="buyer"
                    checked={userType === 'buyer'}
                    onChange={(e) => {
                      setUserType(e.target.value);
                      setReceiverId('');
                    }}
                    className="mr-2"
                  />
                  Buyer
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="farmer"
                    checked={userType === 'farmer'}
                    onChange={(e) => {
                      setUserType(e.target.value);
                      setReceiverId('');
                    }}
                    className="mr-2"
                  />
                  Farmer
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {userType === 'buyer' ? 'Buyer' : 'Farmer'}
              </label>
              <select
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select {userType === 'buyer' ? 'buyer' : 'farmer'}...</option>
                {userType === 'buyer' ? (
                  buyers.map((buyer) => (
                    <option key={buyer.id} value={buyer.id}>
                      {buyer.name} - {buyer.email} ({buyer.city}, {buyer.state})
                    </option>
                  ))
                ) : (
                  farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name} - {farmer.farm_name} ({farmer.farm_location})
                    </option>
                  ))
                )}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
            <select
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select recipient...</option>
              {adminUsers.map((admin) => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject (optional)"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            ref={composeTextareaRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            rows="6"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            required
            minLength={1}
            autoFocus
            dir="ltr"
            style={{ textAlign: 'left', direction: 'ltr' }}
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Send Message
          </button>
          <button
            type="button"
            onClick={() => setView('conversations')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {view === 'conversations' && <ConversationsView />}
      {view === 'thread' && <ThreadView />}
      {view === 'compose' && <ComposeView />}
    </div>
  );
}
