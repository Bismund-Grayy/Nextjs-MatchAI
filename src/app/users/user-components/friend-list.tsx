import React from "react";

// This component displays a list of the current user's friends or connections.
// It will query the Supabase 'friends' relationship table.
const FriendList = () => {
  return (
    <div>
      <h2>Friend List</h2>
      <ul>
        <li>Friend 1</li>
        <li>Friend 2</li>
      </ul>
    </div>
  );
};

export default FriendList;