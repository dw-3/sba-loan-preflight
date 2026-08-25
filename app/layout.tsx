import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sba-loan-preflight.hello643869.chatgpt.site"),
  title: "SBA Loan Preflight",
  description: "A privacy-first repayment preflight for small-business borrowers. Model DSCR with transparent arithmetic—without sending or storing your inputs.",
  openGraph: {
    title: "SBA Loan Preflight",
    description: "Model repayment. See the relationship. Keep your numbers private.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "SBA Loan Preflight — Model repayment. See the relationship. Keep your numbers private." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SBA Loan Preflight",
    description: "Model repayment. See the relationship. Keep your numbers private.",
    images: ["/og.jpg"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
