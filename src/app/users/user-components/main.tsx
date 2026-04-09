"use client";

import React, { useState, useEffect } from "react";
import ChatInterface from "./chat-interface";
import Feed from "./feed";
import FriendList from "./friend-list";
import Logout from "./logout";
import MessageRequest from "./message-request";
import Profile from "./profile";
import ProfileSetup from "./profile-setup";
import { supabase } from "../../../../utils/supabase";

//Here is the main page/hub for users

type ActiveView = 'feed' | 'profile' | 'friends' | 'messages' | 'chat' | 'setup';

export default function Main() {
  // state to track which view is currently active in the main hub
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [user, setUser] = useState<any>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [selectedChatFriend, setSelectedChatFriend] = useState<any>(null);

  useEffect(() => {
    // 1. Create the channel synchronously
    const channel = supabase.channel('online-users');

    // 2. Setup listeners and subscribe synchronously
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('Online users synced:', channel.presenceState());
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            // Mark user as online in the real-time channel
            await channel.track({
              online_at: new Date().toISOString(),
              user_id: currentUser.id,
            });

            // Also update the 'last_seen_at' in the database
            await supabase
              .from('profiles')
              .update({ last_seen_at: new Date().toISOString() })
              .eq('id', currentUser.id);
          }
        }
      });

    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Check if user has completed their profile setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('id', currentUser.id)
          .single();
        
        if (!profile || !profile.is_profile_complete) {
          setActiveView('setup');
          setIsProfileComplete(false);
        } else {
          setIsProfileComplete(true);
        }
      }
    };

    getUser();

    // 3. Cleanup: Use removeChannel for a more thorough cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // helper function to render the appropriate component based on state
  const renderContent = () => {
    if (activeView === 'setup') {
      return <ProfileSetup onComplete={() => {
        setIsProfileComplete(true);
        setActiveView('feed');
      }} />;
    }

    switch (activeView) {
      case 'feed':
        return <Feed />;
      case 'profile':
        return <Profile />;
      case 'friends':
        return <FriendList onChat={(friend) => {
          setSelectedChatFriend(friend);
          setActiveView('chat');
        }} />;
      case 'messages':
        return <MessageRequest />;
      case 'chat':
        return <ChatInterface friend={selectedChatFriend} onBack={() => setActiveView('friends')} />;
      default:
        return <Feed />;
    }
  };

  // dynamic styling for sidebar navigation items based on active status
  const navItemStyle = (view: ActiveView) => ({
    padding: '0.5rem 0',
    cursor: 'pointer',
    color: activeView === view ? '#007bff' : 'inherit',
    fontWeight: activeView === view ? 'bold' : 'normal',
    listStyleType: 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>MatchAI User Hub</h1>
        {/* Sign out functionality provided by the Logout component */}
        <Logout />
      </header>
      
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation sidebar for the User Hub - Hidden during setup */}
        {isProfileComplete && (
          <nav style={{ width: '200px', borderRight: '1px solid #ccc', padding: '1rem' }}>
            <h3>Navigation</h3>
            <ul style={{ padding: 0 }}>
              {/* Click handlers to update the active view */}
              <li style={navItemStyle('feed')} onClick={() => setActiveView('feed')}>Feed</li>
              <li style={navItemStyle('profile')} onClick={() => setActiveView('profile')}>Profile</li>
              <li style={navItemStyle('friends')} onClick={() => setActiveView('friends')}>Friends</li>
              <li style={navItemStyle('messages')} onClick={() => setActiveView('messages')}>Message Requests</li>
            </ul>
          </nav>
        )}

        {/* Primary content area where components are rendered */}
        <main style={{ flex: 1, padding: '1rem' }}>
          {isProfileComplete === null ? <p>Loading profile...</p> : renderContent()}
        </main>
      </div>
    </div>
  );
}
