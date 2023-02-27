import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

export default function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services,clusterer&autoload=false`}
          strategy="beforeInteractive"
        />
      </body>
    </Html>
  );
}
