import { authService } from "../../firebase/firebase";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import CustomModal, { ModalButton } from "../custom/ErrorModal";
import Image from "next/image";
import { CiSearch } from "react-icons/ci";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Header() {
  const [openModalLogout, setOpenModalLogout] = useState(false);
  const router = useRouter();
  const targetHospital = useRef<HTMLInputElement>(null);
  const currentUser = useAuth();

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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value !== "") {
      router.push(
        {
          pathname: "/searchHospital",
          query: { target: targetHospital.current?.value + " 동물병원" },
        },
        undefined,
        { shallow: true },
      );
      return;
    }
  };

  const Input = () => {
    return (
      <div style={{ display: "flex" }}>
        <CiSearch
          style={{
            position: "absolute",
            marginLeft: "10px",
            marginTop: "10px",
            zIndex: 1,
          }}
          size={17}
        />
        <HeaderSearchInput
          ref={targetHospital}
          placeholder={"동물병원을 입력해 보세요."}
        />
      </div>
    );
  };

  const onLogOutClick = () => {
    authService.signOut();
    setOpenModalLogout(true);
    router.push("/", undefined, { shallow: true });
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
            onClick={() => router.push("/", undefined, { shallow: true })}
          />
          <Image
            width={14}
            height={20}
            alt="headermark"
            src="https://user-images.githubusercontent.com/115146172/223037617-d80cd8be-32b3-4f56-9e29-26f6b0a2a153.jpg"
            style={{
              marginLeft: -30,
            }}
          />
          <HeaderItem
            onClick={() =>
              router.push("/searchHospital", undefined, { shallow: true })
            }
          >
            병원리스트
          </HeaderItem>
          <HeaderItem
            onClick={() =>
              router.push("/petconsult", undefined, { shallow: true })
            }
          >
            질문 광장
          </HeaderItem>
          <HeaderForm onSubmit={onSubmit}>
            <Input />
          </HeaderForm>

          <Image
            onClick={() =>
              authService.currentUser === null
                ? router.push("/login", undefined, { shallow: true })
                : router.push("/mypage", undefined, { shallow: true })
            }
            src="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FFrame%20127.png?alt=media&token=ed8ea88e-6762-4f9c-be20-e8ed53624fe1"
            width={24}
            height={24}
            style={{
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              cursor: "pointer",
            }}
            alt="loginicon"
          />
          <HeaderItem
            onClick={() =>
              currentUser === null
                ? router.push("/login", undefined, { shallow: true })
                : onLogOutClick()
            }
          >
            {currentUser === null ? "로그인" : "로그아웃"}
          </HeaderItem>
        </HeaderItems>
      </HeaderContainer>
    </>
  );
}

const HeaderContainer = styled.header`
  width: 100vw;
  height: 80px;
  background: white;
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
  padding: 0 130px;
  gap: 36px;
`;

const HeaderLogo = styled.img`
  width: 90px;
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
  padding: 10px 0 10px 35px;
  background: rgba(255, 255, 255, 0.3);
  border: 0.4px solid #000000;
  border-radius: 4px;
`;
const GoToMyPage = styled.div`
  /* flex-grow: 1; */
`;
