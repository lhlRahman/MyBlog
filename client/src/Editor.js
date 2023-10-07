import ReactQuill from "react-quill";

export default function Editor({ value, onChange }) {
  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
    ],
  };

  
  return <ReactQuill value={value} onChange={onChange} modules={modules} />;
}
