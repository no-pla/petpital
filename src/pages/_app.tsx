import type { AppProps } from "next/app";
import "../globals.css";
import Layout from "../components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "react-query";

export default function App({ Component, pageProps }: AppProps) {
  const quertClient = new QueryClient();

  return (
    <QueryClientProvider client={quertClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  );
}
