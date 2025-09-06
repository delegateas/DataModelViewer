import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { DatamodelViewProvider } from "@/contexts/DatamodelViewContext";

export const metadata: Metadata = {
  title: "Data Model Viewer",
  description: "Visualize your Dataverse Data Model",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <head>
        {/* Preload all fonts to prevent FOUT */}
        {/* PP Neue Machina Inktrap Fonts */}
        <link rel="preload" href="/fonts/PPNeueMachina-InktrapLight.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-InktrapLightItalic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-InktrapRegular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-InktrapRegularItalic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-InktrapUltrabold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-InktrapUltraboldItalic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        
        {/* PP Neue Machina Plain Fonts */}
        <link rel="preload" href="/fonts/PPNeueMachina-PlainLight.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-PlainLightItalic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-PlainRegular.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-PlainRegularItalic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-PlainUltrabold.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PPNeueMachina-PlainUltraboldItalic.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        
        {/* Neue Haas Grotesk Display Fonts */}
        <link rel="preload" href="/fonts/neuehaasgrotdisp-15xxthin-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-16xxthinitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-25xthin-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-26xthinitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-35thin-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-36thinitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-45light-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-46lightitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-55roman-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-56italic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-65medium-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-66mediumitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-75bold-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-76bolditalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-95black-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdisp-96blackitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        
        {/* Neue Haas Grotesk Display Round Fonts */}
        <link rel="preload" href="/fonts/neuehaasgrotdispround-15xxthin-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-16xxthinitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-25xthin-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-26xthinitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-35thin-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-36thinitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-45light-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-46lightitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-55roman-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-56italic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-65medium-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-66mediumitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-75bold-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-76bolditalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-95black-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrotdispround-96blackitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        
        {/* Neue Haas Grotesk Text Fonts */}
        <link rel="preload" href="/fonts/neuehaasgrottext-55roman-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottext-56italic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottext-65medium-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottext-66mediumitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottext-75bold-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottext-76bolditalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        
        {/* Neue Haas Grotesk Text Round Fonts */}
        <link rel="preload" href="/fonts/neuehaasgrottextround-55roman-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottextround-56italic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottextround-65medium-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottextround-66mediumitalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottextround-75bold-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/neuehaasgrottextround-76bolditalic-trial.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AuthProvider>
            <SettingsProvider>
              <DatamodelViewProvider>
                <SidebarProvider>
                  {children}
                </SidebarProvider>
              </DatamodelViewProvider>
            </SettingsProvider>
          </AuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
