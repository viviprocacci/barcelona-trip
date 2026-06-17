import { createContext, useCallback, useContext, useRef, type ReactNode } from "react";
import type { MapFocus, TabId } from "../types";

interface NavigationContextValue {
  askMateo: (message: string) => void;
  consumeMateoSeed: () => string | null;
  focusMap: (focus: MapFocus) => void;
  consumeMapFocus: () => MapFocus | null;
  setActiveTab: (tab: TabId) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({
  children,
  setActiveTab,
}: {
  children: ReactNode;
  setActiveTab: (tab: TabId) => void;
}) {
  const mateoSeedRef = useRef<string | null>(null);
  const mapFocusRef = useRef<MapFocus | null>(null);

  const askMateo = useCallback(
    (message: string) => {
      mateoSeedRef.current = message.trim();
      setActiveTab("chat");
    },
    [setActiveTab],
  );

  const consumeMateoSeed = useCallback(() => {
    const seed = mateoSeedRef.current;
    mateoSeedRef.current = null;
    return seed;
  }, []);

  const focusMap = useCallback(
    (focus: MapFocus) => {
      mapFocusRef.current = focus;
      setActiveTab("map");
    },
    [setActiveTab],
  );

  const consumeMapFocus = useCallback(() => {
    const focus = mapFocusRef.current;
    mapFocusRef.current = null;
    return focus;
  }, []);

  return (
    <NavigationContext.Provider
      value={{ askMateo, consumeMateoSeed, focusMap, consumeMapFocus, setActiveTab }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
