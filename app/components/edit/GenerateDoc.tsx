import { useLoaderData } from "remix";
import { generateDoc } from "~/utils/doc/docx";
import { WordListLoaderData } from "~/utils/validators";

const GenerateDoc = () => {
  const { sheet } = useLoaderData<WordListLoaderData>();

  const generate = async () => {
    await generateDoc(sheet);
  };

  return (
    <button
      onClick={generate}
      className="bg-zinc-100 hover:bg-zinc-200 transition-colors px-3 py-4 font-bold text-lg text-zinc-800 rounded-xl"
    >
      Generate Cheat Sheet
    </button>
  );
};

export default GenerateDoc;
