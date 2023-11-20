import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "./Editor";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [file, setFiles] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(null); // New state for error messages

  async function createNewPost(ev) {
    ev.preventDefault();
    setError(null); // Reset error on new submission

    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    if (file && file.length > 0) {
      data.set("file", file[0]);
    }
    console.log("data", data);
    try {
      const response = await fetch("http://20.121.128.76/post", {
        method: "POST",
        body: data,
        credentials: "include",
      });

      if (!response.ok) {
        const errorMsg = await response.text(); // Assumes error message is in text format
        throw new Error(errorMsg || "Error creating post");
      }

      setRedirect(true);
    } catch (err) {
      setError(err.message); // Set error message
      console.error("Error creating post:", err);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form className="create-post" onSubmit={createNewPost}>
      {error && <p className="error-message">{error}</p>} {/* Display error message */}
      <input
        type="title"
        placeholder={"Title"}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(event) => setSummary(event.target.value)}
      />
      <input
        type="file"
        onChange={(event) => setFiles(event.target.files)}
      />
      <Editor onChange={setContent} value={content} />
      <button type="submit">Create Post</button>
    </form>
  );
}


//test