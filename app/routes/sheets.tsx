import { Outlet } from "remix";

export default function SheetsRoute() {
  return (
    <main className="container mx-auto px-1 md:px-5">
      <Outlet />
    </main>
  );
}
