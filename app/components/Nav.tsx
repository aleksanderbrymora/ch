import { FC } from "react";
import { Link } from "remix";

const Nav: FC<{ userId: string | null }> = ({ userId }) => {
  return (
    <nav className="flex justify-between container mx-auto my-5 px-1 md:px-5">
      <div className="flex gap-5 items-center">
        <Link to="/">Home</Link>
        <Link to="/sheets">Sheets</Link>
      </div>
      <div className="flex gap-10 items-center">
        {userId ? (
          <>
            <Link
              className="p-2 bg-white text-black rounded-md font-bold hover:bg-zinc-200 transition-colors"
              to="/sheets/new"
            >
              Create your own
            </Link>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="underline underline-offset-8 font-bold transition-all hover:underline-offset-4"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;
