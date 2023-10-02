import {formatISO9075} from "date-fns"
export default function Post({title, summary, cover, content, createdAt, author}) {
  return (
    <div className="post">
      <div className="image">
        <img src="https://www.aljazeera.com/wp-content/uploads/2023/09/AP23255206144648-1695649321.jpg?resize=770%2C513&quality=80" alt="post" />
      </div>
      <div className="text">
        <h2>{title}</h2>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">
          {summary}
        </p>
      </div>
    </div>
  );
}
// 2:33:02 / 3:32:09