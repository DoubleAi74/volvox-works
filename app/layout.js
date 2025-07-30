import { Inter } from "next/font/google";
import "./globals.css";
import "react-quill/dist/quill.snow.css"; // Import Quill CSS globally
import Header from "@/components/Header"; // We will create this next

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Personal Dashboard",
  description: "A Next.js personal dashboard application.",
};

export default function RootLayout({ children }) {
  // In a real app, you would fetch user data here or in a provider
  const user = { loggedIn: true, name: "Demo User" };

  return (
    <html lang="en">
      <body className={inter.className}>
        {user.loggedIn && <Header />}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
