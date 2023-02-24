import React from "react";
import styled from "styled-components";

type AuthModalProp = {
  children?: React.ReactNode;
};

const AuthModal = ({ children }: AuthModalProp) => {
  return (
    <AuthModalWrap>
      <Modal>
        <div>{children}</div>
      </Modal>
    </AuthModalWrap>
  );
};

export default AuthModal;

const AuthModalWrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 9999999;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 24px;
  border-radius: 4px;
  color: #000;
  background-color: #fff;
  padding: 24px 36px;
  min-width: 300px;
  min-height: 80px;
  > div {
    margin: 4px 0;
    > p {
      margin: 8px 0 16px 0;
      font-size: 14px;
    }
  }
`;

export const AuthTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #dd0000;
`;
