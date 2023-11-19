import Header from "./Header"
import {Outlet} from "react-router-dom";

export default function Layout() {
  console.log("we in jhere")
  return (
    <main>
      <Header />
      <Outlet />
    </main>
  );
}