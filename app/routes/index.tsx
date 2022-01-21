import { MetaFunction } from "remix";

export const meta: MetaFunction = () => {
  return {
    title: "Cheat sheets",
    description: "Create your own cheat sheets",
  };
};

export default function Index() {
  return (
    <main className="container mx-auto">
      <h1>Need to think of some content here</h1>
      <p>todo</p>
    </main>
  );
}
