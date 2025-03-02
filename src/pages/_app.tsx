import type { AppProps } from "next/app";
import { JetBrains_Mono } from "next/font/google";

import { Provider } from "@/components/ui/provider";

import { WagmiProvider } from 'wagmi';

import { Toaster } from "@/components/ui/toaster";
import "@/styles/index.css";
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Session } from "next-auth";

import {
  createAuthenticationAdapter,
  darkTheme,
  getDefaultConfig,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { useEffect, useState } from "react";
import { createSiweMessage } from 'viem/siwe';

const config = getDefaultConfig({
  appName: 'SonicHash',
  projectId: 'bbe53af9f57348a7280f124e1f4c1d66',
  chains: [
    {
      id: 998,
      name: "Sonic",
      nativeCurrency: {
        name: "S",
        symbol: "S",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://rpc.soniclabs.com"]
        }
      },
      blockExplorers: {
        default: {
          name: "SonicScan",
          url: "https://sonicscan.org/",
        },
      },
    }
  ],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

const font = JetBrains_Mono({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
});

const authenticationAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    const response = await fetch('/api/auth/nonce');
    return await response.text();
  },

  createMessage: ({ nonce, address, chainId }) => {
    return createSiweMessage({
      domain: window.location.host,
      address,
      statement: 'Sign in with Ethereum to the app.',
      uri: window.location.origin,
      version: '1',
      chainId,
      nonce,
    });
  },

  verify: async ({ message, signature }) => {
    const verifyRes = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, signature }),
    });

    if (verifyRes.ok) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authMessage', window.btoa(message));
      localStorage.setItem('authSignature', signature);
    } else {
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('authMessage');
      localStorage.removeItem('authSignature');
    }

    return Boolean(verifyRes.ok);
  },

  signOut: async () => {
    console.log('signing out');
    // localStorage.removeItem('isAuthenticated');
    // localStorage.removeItem('authMessage');
    // localStorage.removeItem('authSignature');
  },
});


export default function App({ Component, pageProps }: AppProps<{ session: Session }>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(isAuthenticated);

    const interval = setInterval(() => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuthenticated);
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  return <>
    <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
      `}</style>

    <Provider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitAuthenticationProvider adapter={authenticationAdapter} status={isAuthenticated ? "authenticated" : "unauthenticated"}>
            <RainbowKitProvider theme={darkTheme()} modalSize="compact" appInfo={{
              appName: 'SonicHash',
              learnMoreUrl: 'https://sonichash.xyz',
            }}>  
              <Component {...pageProps} />
            </RainbowKitProvider>
          </RainbowKitAuthenticationProvider>
        </QueryClientProvider>
      </WagmiProvider>
      <Toaster />
    </Provider>
  </>
}
