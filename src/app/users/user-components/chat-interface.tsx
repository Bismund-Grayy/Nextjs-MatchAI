import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../utils/supabase";

// This component handles the interactive chat session between users.
// It uses Supabase for message storage and real-time updates.
const ChatInterface = () => {
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
    // 1. Create the channel synchronously
    const channel = supabase.channel('chat-room');

    // 2. Set up Realtime listeners synchronously
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          // When a new message arrives, fetch its sender's info
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', payload.new.sender_id)
            .single();

          const messageWithProfile = {
            ...payload.new,
            profiles: profileData
          };
          
          setMessages((prev) => [...prev, messageWithProfile]);
        }
      )
      .subscribe();

    const loadData = async () => {
      // 3. Get current user session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 4. Fetch initial message history
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (username)
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) setMessages(data);
    };

    loadData();

    // 5. Cleanup: Use removeChannel for a more thorough cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Insert message into Supabase
    const { error } = await supabase.from('messages').insert([
      {
        content: newMessage,
        sender_id: user.id,
        // receiver_id is left null for Global Chat
      },
    ]);

    if (error) {
      console.error("Error sending message:", error.message);
    } else {
      setNewMessage("");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '1rem', backgroundColor: '#f9f9f9' }}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{ marginBottom: '0.8rem', textAlign: msg.sender_id === user?.id ? 'right' : 'left' }}>
              <small style={{ fontWeight: 'bold', display: 'block' }}>
                {msg.profiles?.username || "Unknown User"}
              </small>
              <span style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '12px',
                backgroundColor: msg.sender_id === user?.id ? '#007bff' : '#e9ecef',
                color: msg.sender_id === user?.id ? 'white' : 'black',
                marginTop: '0.2rem'
              }}>
                {msg.content}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;