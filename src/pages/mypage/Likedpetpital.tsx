import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  useAddCounsel,
  useGetCounselTarget,
  useGetPetConsult,
} from "../../hooks/usePetsult";
import { useQuery } from "react-query";
import axios from "axios";
import { authService } from "../../firebase/firebase";
import { useRouter } from "next/router";
import { CounselItem } from "@/components/custom/CounselItem";
import { onAuthStateChanged } from "firebase/auth";

function useAuth() {
  const [currentUser, setCurrentUser] = useState<any>();
  useEffect(() => {
    const unsub = onAuthStateChanged(authService, (user) =>
      setCurrentUser(user),
    );
    return unsub;
  }, []);

  return currentUser;
}

const Likedpetpital = () => {
  const currentUser = useAuth();
  const { isLoadingPetConsult, petConsult } = useGetPetConsult({
    limit: `&uid=${currentUser?.uid}`,
  });
  const router = useRouter();

  return (
    <MyCounsel>
      <WriteNewCounsel
        onClick={() =>
          router.push("/petconsult/new", undefined, { shallow: true })
        }
      >
        궁금한 점 물어보러 가기
      </WriteNewCounsel>
      <CounselList>
        {!isLoadingPetConsult &&
          petConsult?.data?.map((counsel, index) => (
            <CounselItem key={counsel.id} counsel={counsel} index={index} />
          ))}
      </CounselList>
    </MyCounsel>
  );
};

//counsel, index, page

export default Likedpetpital;

const MyCounsel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
  min-height: 100vh;
  gap: 12px;
  /* width: 440px; */
  margin: 0 auto;
`;

const WriteNewCounsel = styled.button`
  width: 90%;
  padding: 12px 0;
  background: #15b5bf;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  margin-bottom: 36px;
  border: 1px solid #afe5e9;
  margin: 20px 0;
  cursor: pointer;
`;

const CounselList = styled.div`
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  justify-content: center;
  /* justify-items: stretch; */
  justify-items: center;

  @media screen and (max-width: 880px) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin: 0 12px;

    margin-top: 20px;
  }
`;

const Counsel = styled.div`
  margin-top: 30px;
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
