import { createContext, useContext, useState, type ReactNode } from "react";

export interface FeishuConfig {
  appId: string;
  appSecret: string;
  oauthUrl: string;
  authorized: boolean;
}

interface FeishuContextValue {
  config: FeishuConfig | null;
  setConfig: (cfg: FeishuConfig | null) => void;
}

const FeishuContext = createContext<FeishuContextValue>({
  config: null,
  setConfig: () => {},
});

export function FeishuProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<FeishuConfig | null>(null);
  return (
    <FeishuContext.Provider value={{ config, setConfig }}>
      {children}
    </FeishuContext.Provider>
  );
}

export function useFeishu() {
  return useContext(FeishuContext);
}
