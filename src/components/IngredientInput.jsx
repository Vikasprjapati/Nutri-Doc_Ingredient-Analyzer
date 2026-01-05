import { useState } from "react";
import { analyseIngredients } from "../ai/reasoningEngine";
import ReasoningCard from "./ReasoningCard";

export default function IngredientInput() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  function handleAnalyse() {
    const output = analyseIngredients(text);
    setResult(output);
  }

  return (
    <>
      <textarea
        placeholder="Paste ingredients exactly as written on the packet…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={handleAnalyse}>Help me decide</button>

      {result && <ReasoningCard data={result} />}
    </>
  );
}
