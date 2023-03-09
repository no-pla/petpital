import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useRouter } from "next/router";
import { JsxElement } from "typescript";

export default function Layout({ children }: any) {
  const router = useRouter();
  return (
    <>
      {router.pathname !== "/searchHospital" && <Header />}
      {children}
      {router.pathname !== "/searchHospital" && <Footer />}
    </>
  );
}
