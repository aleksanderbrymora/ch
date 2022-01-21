import { Outlet } from "remix";

export default function SheetsRoute() {
  return (
    <main className="container mx-auto">
      <Outlet />
    </main>
  );
}
