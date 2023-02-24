import React from "react";
import styled from "@emotion/styled";
import {
  useAddCounsel,
  useGetCounselList,
  useGetCounselTarget,
  useGetPetConsult,
} from "../../hooks/usePetsult";
import { useQuery } from "react-query";
import axios from "axios";
import { authService } from "../../firebase/firebase";
import { useRouter } from "next/router";

const Likedpetpital = () => {
  const { isLoadingPetConsult, petConsult } = useGetPetConsult({
    limit: "&_limit=3",
  });
  const router = useRouter();

  const myId = authService.currentUser?.uid;

  return (
    <>
      {!isLoadingPetConsult &&
        petConsult?.data
          .filter((counsel) => myId === counsel.uid)
          .map((counsel) => (
            <CounselList key={counsel.uid}>
              <Counsel onClick={() => router.push(`petconsult/${counsel.id}`)}>
                <CounselTitle>{counsel.content}</CounselTitle>
              </Counsel>
            </CounselList>
          ))}
    </>
  );
};

export default Likedpetpital;

const CounselList = styled.div`
  display: flex;
  justify-content: center;
`;

const Counsel = styled.div`
  margin-top: 50px;
  width: 80%;
  border: 1px solid;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.25);
  cursor: pointer;
`;

const CounselTitle = styled.h3`
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
