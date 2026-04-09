import Image from "next/image";
import Display from "./display/display";
import Link from "next/link";


/*
I followed the recommendations from supabase

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

export default function Page() {
  const [todos, setTodos] = useState([])

  useEffect(() => {
    async function getTodos() {
      const { data: todos } = await supabase.from('todos').select()

      if (todos) {
        setTodos(todos)
      }
    }

    getTodos()
  }, [])

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}*/

export default function Home() {
  // This is the landing page of the application.
  // It displays the welcome message, the main Display component,
  // and navigation links to the user authentication pages.
  return (
    <main>
      { /* Home/Front page*/ }
      <h1>Welcome to MatchAI!</h1>
        <Display />
        <footer>
          <p>Contact us: support@matchai.com</p>
          <a href="https://youtube.com">YouTube</a>
          <a href="https://facebook.com">Facebook</a>
        </footer>
        <nav>
          {/* Link to the Login/Registration page */}
          <Link href="/users"><b style={{color: 'red'}}>Login/Register</b></Link>
        </nav>
        {/* Link to the Admin page (for admin users) temporary, just for development*/}
        <Link href="/admin">Admin</Link>
    </main>
  );
}
