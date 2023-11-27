import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(false); // State to indicate successful registration

  async function register(ev) {
    ev.preventDefault();
    setError(null); // Reset error on new submission

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        setSuccess(true);
      } else {
        // Handle non-successful responses
        const errorMsg = await response.text();
        throw new Error(errorMsg || 'Registration failed');
      }
    } catch (err) {
      setError(err.message); // Set error message
      console.error('Registration error:', err);
    }
  }

  // Optionally redirect or display a success message upon successful registration
  if (success) {
    return <p>Registration successful! You can now log in.</p>;
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
      <input type="text"
             placeholder="username"
             value={username}
             onChange={ev => setUsername(ev.target.value)}/>
      <input type="password"
             placeholder="password"
             value={password}
             onChange={ev => setPassword(ev.target.value)}/>
      <button>Register</button>
    </form>
  );
}
