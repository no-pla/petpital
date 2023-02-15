import type { AppProps } from "next/app";
import Layout from "../components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import "../styles/globals.css";

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
