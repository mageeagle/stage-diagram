"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { type ReactNode } from "react";

interface ZustandProviderProps {
  children: ReactNode;
}

export function ZustandProvider({ children }: ZustandProviderProps) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
