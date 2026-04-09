import React, { useState, useEffect, useRef } from "react";
import { supabase, logActivity } from "../../../../utils/supabase";

// This component handles the interactive chat session between users.
// It uses Supabase for message storage and real-time updates.
const ChatInterface = ({ friend, onBack }: { friend: any, onBack: () => void }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user || !friend) return;

    // 1. Create the channel for this specific private chat
    const channelId = [user.id, friend.id].sort().join('-');
    const channel = supabase.channel(`chat:${channelId}`);

    // 2. Set up Realtime listeners BEFORE calling subscribe()
    channel
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${user.id}` 
        },
        async (payload) => {
          if (payload.new.sender_id === friend.id) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      );

    // 3. Now call subscribe()
    channel.subscribe();

    // 4. Fetch initial message history
    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) setMessages(data);
    };

    fetchHistory();

    // 5. Cleanup: Use removeChannel for a more thorough cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, friend?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !friend) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); 

    const { data, error } = await supabase.from('messages').insert([
      {
        content: messageContent,
        sender_id: user.id,
        receiver_id: friend.id,
      },
    ]).select().single();

    if (error) {
      console.error("Error sending message:", error.message);
      alert("Failed to send message.");
    } else if (data) {
      setMessages((prev) => [...prev, data]);
      await logActivity(user.id, "chat_message_sent", { receiver_id: friend.id });
    }
  };

  if (!friend) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No friend selected for chat.</p>
        <button onClick={onBack}>Back to Friends</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>←</button>
        <h3>Chat with {friend.username}</h3>
      </header>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', margin: '1rem 0', backgroundColor: '#f9f9f9', minHeight: '300px' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Say hi to {friend.username}!</p>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div 
                key={msg.id || index} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem' 
                }}
              >
                <div style={{ 
                  background: isMe ? '#007bff' : '#e9ecef', 
                  color: isMe ? 'white' : 'black', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '12px',
                  maxWidth: '80%',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.2rem' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.7rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '0.7rem 1.5rem', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;