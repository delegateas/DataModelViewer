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
