import type { AppProps } from "next/app";
import Layout from "../components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import { ReactQueryDevtools } from "react-query/devtools";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const quertClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });

  return (
    <RecoilRoot>
      <QueryClientProvider client={quertClient}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
