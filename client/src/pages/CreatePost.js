import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);
  async function createNewPost(ev) {
    ev.preventDefault();
    
    const data = new FormData();
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("files", files[0]);

    const response = await fetch('http://localhost:4000/post', {
      method: "POST",
      body: data,
      credentials: 'include',
    })
    
    if(response.ok) {
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  
  return (
    <div>
      <form className="create-post" onSubmit={createNewPost}>
        <input
          type="text"
          placeholder={"Title"}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          type="text"
          placeholder={"Summary"}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
        
        <input
          type="file"
          // value={files}
          onChange={(event) => setFiles(event.target.files)}
        />

        <div>
          <ReactQuill value={content} onChange={(value) => setContent(value)} />
          <button type="submit">Create Post</button>
        </div>
      </form>
    </div>
  );
}
