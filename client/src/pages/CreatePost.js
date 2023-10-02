import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useState } from "react";


export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");

 function createNewPost (ev){
  const data = new FormData();
  data.set("title", title);
  data.set("summary", summary);
  data.set("content", content);
  data.set("file", files[0]);
  ev.preventDefault();
  //fetch(`http://localhost:4000/posts`, {
    //method: "POST",
    //body: ,
  //})

 }
 

  return (
    <div>
      <form className="create-post" >
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
        <input type="file" value = {files} onChange={(event) => setFiles(event.target.files[0])} />
        <div>
          <ReactQuill value={content} onChange={(value) => setContent(value)} />
          <button type="submit">Create Post</button>
        </div>
      </form>
    </div>
  );
}
