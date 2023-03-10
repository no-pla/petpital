import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useRouter } from "next/router";
import { JsxElement } from "typescript";
import styled from "@emotion/styled";

export default function Layout({ children }: any) {
  const router = useRouter();
  return (
    <LayoutContainer>
      {router.pathname !== "/searchHospital" && <Header />}
      <ChildContainer>{children}</ChildContainer>
      {router.pathname !== "/searchHospital" && <Footer />}
    </LayoutContainer>
  );
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ChildContainer = styled.div`
  flex-grow: 1;
`;
