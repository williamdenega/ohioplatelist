import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BuckeyePlates",
  description: "Explore available Ohio license plates quickly and easily with BuckeyePlates. Our user-friendly platform allows you to search and check the availability of Ohio license plates in real-time. Whether you're looking for a personalized tag or just want to browse, BuckeyePlates is your go-to resource for all things Ohio plates. Start your search today and find the perfect plate for your vehicle!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
