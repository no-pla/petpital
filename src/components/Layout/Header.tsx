import { authService } from "../../firebase/firebase";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import CustomModal, { ModalButton } from "../custom/CustomModal";

export default function Header() {
  const [openModalLogout, setOpenModalLogout] = useState(false);
  const router = useRouter();
  const targetHospital = useRef<HTMLInputElement>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value !== "") {
      router.push({
        pathname: "/searchMap",
        query: { target: targetHospital.current?.value },
      });
      return;
    }
  };

  const Input = () => {
    return (
      <HeaderSearchInput
        ref={targetHospital}
        placeholder="동물병원을 입력해 보세요."
      />
    );
  };

  const onLogOutClick = () => {
    authService.signOut();
    setOpenModalLogout(true);
    router.push("/");
  };

  const onLogOutClose = () => {
    setOpenModalLogout(false);
  };

  return (
    <>
      {openModalLogout && (
        <CustomModal modalText1={"로그아웃성공"} modalText2={""}>
          <ModalButton onClick={onLogOutClose}>확인</ModalButton>
        </CustomModal>
      )}
      <HeaderContainer>
        <HeaderItems>
          <HeaderLogo
            src="https://user-images.githubusercontent.com/88391843/220821556-46417499-4c61-47b8-b5a3-e0ffc41f1df1.png"
            onClick={() => router.push("/")}
          />
          <HeaderItem onClick={() => router.push("/searchMap")}>
            병원리스트
          </HeaderItem>
          <HeaderItem onClick={() => router.push("/petconsult")}>
            질문 광장
          </HeaderItem>
          <HeaderForm onSubmit={onSubmit}>{/* <Input /> */}</HeaderForm>
          <HeaderItem
            onClick={() =>
              authService.currentUser === null
                ? router.push("/login")
                : router.push("/searchMap")
            }
          >
            리뷰 쓰기
          </HeaderItem>
          <HeaderItem
            onClick={() =>
              authService.currentUser === null
                ? router.push("/login")
                : onLogOutClick()
            }
          >
            {authService.currentUser === null ? "회원가입/로그인" : "로그아웃"}
          </HeaderItem>
          <GoToMyPage
            onClick={() =>
              authService.currentUser === null
                ? router.push("/login")
                : router.push("/mypage")
            }
          />
        </HeaderItems>
      </HeaderContainer>
    </>
  );
}

const HeaderContainer = styled.header`
  width: 100vw;
  height: 60px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  z-index: 100;
`;

const HeaderItems = styled.div`
  width: 100%;
  height: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  margin: 0 auto;
  justify-content: space-between;
  padding: 0 20px;
  gap: 36px;
`;

const HeaderLogo = styled.img`
  width: 120px;
  object-fit: contain;
  cursor: pointer;
`;

const HeaderForm = styled.form`
  flex-grow: 2;
`;

const HeaderItem = styled.div`
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  /* background-color: red; */
`;

const HeaderSearchInput = styled.input`
  width: 100%;
  padding: 10px 0 10px 10px;
  background: rgba(255, 255, 255, 0.3);
  border: 0.4px solid #000000;
  border-radius: 4px;
`;
const GoToMyPage = styled.div`
  /* flex-grow: 1; */
  background-repeat: no-repeat;
  width: 24px;
  height: 24px;
  background-position: center;
  background-image: url("https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FFrame%20127.png?alt=media&token=ed8ea88e-6762-4f9c-be20-e8ed53624fe1");
  cursor: pointer;
`;
