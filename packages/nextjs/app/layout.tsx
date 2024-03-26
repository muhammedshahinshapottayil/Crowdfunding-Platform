import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import OwnerWithdrawalButton from "~~/components/OwnerWithdraw";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : `http://localhost:${process.env.PORT}`;
// const imageUrl = `${baseUrl}/thumbnail.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Crowdfunding Platform | Bring Your Ideas to Life",
    template: "Crowdfunding Platform | Bring Your Ideas to Life",
  },
  description: "Crowdfunding Platform | Bring Your Ideas to Life",

  icons: {
    icon: [{ url: "/favicon.ico", sizes: "32x32", type: "image/ico" }],
  },
};

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            {children}
            <OwnerWithdrawalButton />
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
