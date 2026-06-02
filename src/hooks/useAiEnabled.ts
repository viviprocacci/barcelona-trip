import { useEffect, useState } from "react";
import { checkAiStatus } from "../services/ai";

export function useAiEnabled() {
  const [enabled, setEnabled] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  useEffect(() => {
    checkAiStatus().then((s) => {
      setEnabled(s.enabled);
      setWebSearch(s.webSearch);
    });
  }, []);

  return { enabled, webSearch };
}
