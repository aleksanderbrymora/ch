import { Outlet } from "remix";

export default function SheetsRoute() {
  return (
    <main className="container px-1 mx-auto md:px-5">
      <Outlet />
    </main>
  );
}
