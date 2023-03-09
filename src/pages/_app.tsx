import type { AppProps } from "next/app";
import Layout from "../components/Layout/Layout";
import { QueryClient, QueryClientProvider } from "react-query";
import { RecoilRoot } from "recoil";
import { ReactQueryDevtools } from "react-query/devtools";
import "../styles/globals.css";
import PasswordFindModal from "../components/custom/PasswordFindModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      // notifyOnChangeProps: "tracked",
    },
  },
});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Layout>
          <Component {...pageProps} />
          {/* <PasswordFindModal /> */}
        </Layout>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </RecoilRoot>
  );
}
