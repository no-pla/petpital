import React, { useState } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import axios from "axios";

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

  const [page, setPage] = useState(1);
  const { data: petConsult, isLoading } = useQuery(
    ["pagnationCounsel", page],
    () => {
      return axios.get(
        `http://localhost:3001/qna?_sort=createdAt&_order=desc&limit=10&_page=${page}`,
      );
    },
    {
      keepPreviousData: true,
    },
  );

  const onClick = (id: string) => {
    router.push(`petconsult/${id}`);
  };

  return (
    <CounselContainer>
      {isLoading
        ? "로딩중"
        : petConsult?.data.map((counsel: any) => (
            <Counsel key={counsel.id}>
              <CounselTitle>{counsel.content}</CounselTitle>
              <CounselButton onClick={() => onClick(counsel.id)}>
                답변하러가기
              </CounselButton>
            </Counsel>
          ))}
      <div>
        <button
          disabled={page === 1 && true}
          onClick={() => setPage((prev) => prev - 1)}
        >
          이전
        </button>
        <button
          disabled={petConsult?.data.length !== 10 && true}
          onClick={() => setPage((prev) => prev + 1)}
        >
          다음
        </button>
      </div>
    </CounselContainer>
  );
}

export default Petconsult;
