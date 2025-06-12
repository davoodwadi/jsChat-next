import "./globals.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { Layout2 } from "./layout2";

config.autoAddCss = false;

export const metadata = {
  title: "Spreed",
  description: "Non-linear LLM chat interface",
};

export default async function RootLayout({ params, children }) {
  return <Layout2>{children}</Layout2>;
}
