"use client";

import { ReactNode } from "react";
import { GvtewayAppLayout } from "../../components/app-layout";

export default function Layout({ children }: { children: ReactNode }) {
  return <GvtewayAppLayout variant="consumer-auth">{children}</GvtewayAppLayout>;
}
