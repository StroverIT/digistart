"use client";
import React, { createContext, useContext } from "react";
import { PageTransitionContextType } from "./types";

const PageTransitionContext = createContext<
  PageTransitionContextType | undefined
>(undefined);

export const usePageTransition = () => {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider"
    );
  }
  return context;
};

export { PageTransitionContext };
