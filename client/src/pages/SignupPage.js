import React, { useState } from 'react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function register(ev) {
    ev.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        alert("Failed to register");
      } else {
        alert("Successfully registered");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <form className="register" action="Post" onSubmit={register}>
        <h1>Register</h1>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" value={username} onChange={(ev) => setUsername(ev.target.value)} />
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" value={password} onChange={(ev) => setPassword(ev.target.value)} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}