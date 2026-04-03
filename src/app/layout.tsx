import type { Metadata } from "next";
import { Geist, Geist_Mono, Lato, Montserrat } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NextTopLoader from "nextjs-toploader";
import { PageTitleProvider } from "@/context/pageTitleContext";
import { AccountProvider } from "@/context/AccountContext/Account.provider";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

const fontLato = Lato({
  variable: "--font-lato",
  weight: ["100", "300", "400", "700", "900"], // choose weights you want
  subsets: ["latin"],
});

const fontMontserrat = Montserrat({
  variable: "--font-montserrat",
  weight: ["100", "300", "400", "700", "900", "200", "500", "600", "800"], // choose weights you want
  subsets: ["latin"],
});



// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Vedant Asset Mutual Fund",
  description: "Vedant Asset Mutual Fund",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontLato.variable} ${fontMontserrat.variable} antialiased`}
      >
        <NextTopLoader />
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 10000001 }} // Or a higher value than your modal
          toastClassName="!z-[10000001]" // Ensure individual toasts also get it
          className="!z-[10000001]" // For the container itself
        />
        <AccountProvider>
          <PageTitleProvider>{children}</PageTitleProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
