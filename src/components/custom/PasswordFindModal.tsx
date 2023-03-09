import styled from "styled-components";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { modalState } from "../../share/atom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Children, useState } from "react";
import loginLogo from "public/loginLogo.jpg";
import Image from "next/image";

interface Props {
  width?: string;
  height?: string;
  children?: React.ReactNode;
}

const TopContainer = styled.div`
  /* background-color: red; */
  margin-top: 20px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  /* background-color: red; */
`;

const CreateAddModal = ({ children }: Props) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      alert("비밀번호 재설정 이메일을 보냈습니다");
      setEmail("");
    } catch (error) {
      console.error(error);
    }
  };

  const isOpenModal = useRecoilValue(modalState);
  const setIsOpenModal = useSetRecoilState(modalState);

  const handleClose = () => {
    setIsOpenModal(false);
  };

  return (
    <>
      {/* {isOpenModal && ( */}
      <Overlay>
        <ModalContainer>
          <TopContainer>
            {children}
            <Image src={loginLogo} alt="loginLogo" width={200} height={50} />
          </TopContainer>
          <label>
            비밀번호 재설정
            <form onSubmit={handleSubmit}>
              <label>
                Email :
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <button type="submit">비밀번호 재설정</button>
            </form>
          </label>

          {/* <button onClick={handleClose}>Close</button> */}
        </ModalContainer>
      </Overlay>
      {/* )} */}
    </>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div<Props>`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  max-width: 350px;
  width: ${(props) => props.width || "80%"};
  height: ${(props) => props.height || "80%"};
  max-height: 350px;
  overflow-y: auto;
  display: flex;
  /* justify-content: center; */
  align-items: center;

  flex-direction: column;
`;

export default CreateAddModal;
