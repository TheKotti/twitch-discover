"use client";

import { Suspense } from "react";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import Everything from "./everything";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function Home() {
  return (
    <Suspense>
      <ThemeProvider theme={darkTheme}>
        <Everything />
      </ThemeProvider>
    </Suspense>
  );
}
