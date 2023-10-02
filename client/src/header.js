import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext} from "./UserContext";

export default function Header() {
  const {setUserInfo, userInfo} = useContext(UserContext);

  useEffect(() => {
    fetch(`http://localhost:4000/profile`, {
      credentials: "include",
    })
      .then((response) => {
        response.json().then((userInfo) => {
          setUserInfo(userInfo.username);
       });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  function logout() {
    fetch(`http://localhost:4000/logout`, {
      credentials: "include",
      method: "POST",
    })
      .then((response) => {
        response.json().then((userInfo) => {
          setUserInfo(null);
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        MyBlog
      </Link>
      <nav>
        {username && (
          <>
            <Link to="/create">Create Post</Link>
            <Link onClick={logout}>Logout</Link>
          </>
        )}
        {!username && (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </nav>
    </header>
  );
}