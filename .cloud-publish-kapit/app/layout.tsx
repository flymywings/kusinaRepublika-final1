import "./globals.css";

export const metadata = {
  title: "Kapit Design Build",
  description: "Interactive Kapit community-help prototype for LPU Cavite.",
  icons: {
    icon: "/kapit-logo.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
