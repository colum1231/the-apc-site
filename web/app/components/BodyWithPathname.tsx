"use client";
import { usePathname } from "next/navigation";
import React from "react";

export default function BodyWithPathname({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <body className={`apc-body bg-${pathname}`}>{children}</body>;
}
