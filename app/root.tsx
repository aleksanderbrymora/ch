import { User } from "@prisma/client";
import {
  LinksFunction,
  LoaderFunction,
  Meta,
  MetaFunction,
  Scripts,
  useCatch,
  useLoaderData,
} from "remix";
import { Links, LiveReload, Outlet } from "remix";
import Nav from "./components/Nav";
import globalStylesUrl from "./index.css";
import { getUser } from "./utils/session.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: globalStylesUrl }];
};

const Document = ({
  children,
  title = `Cheat Sheets`,
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        {process.env.NODE_ENV === "development" ? <LiveReload /> : null}
      </body>
    </html>
  );
};

type LoaderData = {
  user: Pick<User, "id" | "username"> | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  const data: LoaderData = { user };
  return data;
};

export default () => {
  const { user } = useLoaderData<LoaderData>();
  return (
    <Document>
      <Nav userId={user?.id || null} />
      <Outlet />
    </Document>
  );
};

export const CatchBoundary = () => {
  const caught = useCatch();
  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
};

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
};

export const meta: MetaFunction = () => {
  const description = `stuff`;
  return {
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary_large_image",
    "twitter:creator": "@remix_run",
    "twitter:site": "@remix_run",
    "twitter:title": "Remix Jokes",
    "twitter:description": description,
  };
};
