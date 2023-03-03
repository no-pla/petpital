import type { AppProps } from "next/app";
import Layout from "../components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import { ReactQueryDevtools } from "react-query/devtools";
import "../styles/globals.css";
import PasswordFindModal from "../components/custom/PasswordFindModal";

export default function App({ Component, pageProps }: AppProps) {
  const quertClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        notifyOnChangeProps: "tracked",
      },
    },
  });

  return (
    <RecoilRoot>
      <QueryClientProvider client={quertClient}>
        <Layout>
          <Component {...pageProps} />
          {/* <PasswordFindModal /> */}
        </Layout>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
