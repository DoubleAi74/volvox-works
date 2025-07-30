import { Inter } from "next/font/google";
import "./globals.css";
// import "react-quill/dist/quill.snow.css"; // Import Quill CSS globally
import { AuthContextProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Personal Dashboard",
  description: "A Next.js personal dashboard application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContextProvider>{children}</AuthContextProvider>
      </body>
    </html>
  );
}
