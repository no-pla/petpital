import React from "react";
import styled from "@emotion/styled";
import { Counsel, CounselTitle, CounselButton } from "./index.tsx";

const CounselList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 2fr));
  /* gap: 20px 24px; */
`;

export default function petconsult() {
  return (
    <div>
      <CounselList>
        <Counsel>
          <CounselTitle>강아지 털관리 다들 어떻게 하시나요?</CounselTitle>
          <CounselButton>답변하러가기</CounselButton>
        </Counsel>
        <Counsel>
          <CounselTitle>강아지 털관리 다들 어떻게 하시나요?</CounselTitle>
          <CounselButton>답변하러가기</CounselButton>
        </Counsel>
        <Counsel>
          <CounselTitle>강아지 털관리 다들 어떻게 하시나요?</CounselTitle>
          <CounselButton>답변하러가기</CounselButton>
        </Counsel>
        <Counsel>
          <CounselTitle>강아지 털관리 다들 어떻게 하시나요?</CounselTitle>
          <CounselButton>답변하러가기</CounselButton>
        </Counsel>
        <Counsel>
          <CounselTitle>강아지 털관리 다들 어떻게 하시나요?</CounselTitle>
          <CounselButton>답변하러가기</CounselButton>
        </Counsel>
      </CounselList>
    </div>
  );
}
