import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

console.log("111111111111: ", process.env.NEXT_PUBLIC_KAKAO_API_KEY);
export default function Document() {
  return (
    <Html lang="ko">
      {/* <Head>
        <Script
          type="text/javascript"
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=97f2ca15e8a0381ec9375a793287ca4f&libraries=services,clusterer?autoload=false`}
          strategy="beforeInteractive"
        /> */}
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
