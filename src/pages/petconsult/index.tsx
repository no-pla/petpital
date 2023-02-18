import React from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useGetPetConsult } from "@/Hooks/usePetsult";

// 고민 상담 스타일
const CounselContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
`;

export const CounselList = styled.div`
  margin-bottom: 180px;
  display: flex;
  gap: 12px;
`;

export const CounselTitle = styled.h3`
  margin-bottom: 50px;
  display: flex;
  font-size: 1.1rem;
  &::before {
    content: "Q";
    color: #c5c5c5;
    font-size: 47px;
    margin: 0 10px 0 15px;
  }
`;

export const Counsel = styled.div`
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px;
  width: 40vw;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const CounselButton = styled.button`
  background: #65d8df;
  padding: 12px 8px;
  gap: 8px;
  color: white;
  border: none;
  border-radius: 0px 0px 4px 4px;
  font-size: 1rem;
  cursor: pointer;
`;

function Petconsult() {
  const router = useRouter();

  const { petConsult } = useGetPetConsult({
    limit: "",
  });

  const onClick = (id: string) => {
    router.push(`petconsult/${id}`);
  };

  return (
    <CounselContainer>
      {petConsult?.data.map((counsel: any) => (
        <Counsel key={counsel.id}>
          <CounselTitle>{counsel.content}</CounselTitle>
          <CounselButton onClick={() => onClick(counsel.id)}>
            답변하러가기
          </CounselButton>
        </Counsel>
      ))}
    </CounselContainer>
  );
}

export default Petconsult;
