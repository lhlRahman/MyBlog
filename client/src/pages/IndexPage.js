import Post from "./Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null); // State to store error messages

  useEffect(() => {
    fetch('https://whoishabib.wiki/post')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch posts'); // Throw an error if response is not ok
        }
        return response.json();
      })
      .then(posts => {
        setPosts(posts);
      })
      .catch(err => {
        setError(err.message); // Catch and set any errors encountered during fetch
        console.error('Error fetching posts:', err);
      });
  }, []);

  // Display error message if there is an error
  if (error) {
    return <p>Failed to load posts: {error}</p>;
  }

  // Render posts if available
  return (
    <>
      {posts.length > 0 ? (
        posts.map(post => <Post key={post._id} {...post} />) // Use post._id as key for each Post
      ) : (
        <p>No posts available.</p> // Message to display if no posts are present
      )}
    </>
  );
}
