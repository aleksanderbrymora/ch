import { User } from "@prisma/client";
import { FC } from "react";
import { Link } from "remix";

const Nav: FC<{ user: User }> = ({ user }) => {
  return (
    <nav className="flex gap-3">
      <Link to="/">Home</Link>
      {user ? (
        <form action="/logout" method="post">
          <button type="submit" className="button">
            Logout
          </button>
        </form>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
};

export default Nav;
