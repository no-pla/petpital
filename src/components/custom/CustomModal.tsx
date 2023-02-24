import styled from "@emotion/styled";
import { Router, useRouter } from "next/router";
import { useState } from "react";

const CustomModal = ({
  modalText1,
  modalText2,
  children,
}: {
  modalText1: string;
  modalText2: string;
  children: any;
}) => {
  return (
    <>
      <Backdrop>
        <ModalContianer>
          <ModalTitle>
            {modalText1}
            <br />
            {modalText2}
          </ModalTitle>
          <ModalButtonContainer>{children}</ModalButtonContainer>
        </ModalContianer>
      </Backdrop>
    </>
  );
};

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 10;
  background: rgba(159, 159, 159, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContianer = styled.div`
  width: calc(min(60vw, 300px));
  background-color: #ffffff;
  border-radius: 4px;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  button:first-of-type {
    color: #9f9f9f;
  }
  button:nth-of-type(2) {
    color: #15b5bf;
  }
`;

export const ModalButton = styled.button`
  width: 50%;
  padding: 20px 0;
  background-color: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
`;

export const ModalTitle = styled.h2`
  font-weight: 300;
  font-size: 1.1rem;
  line-height: 1.5rem;
  text-align: center;
  padding: 20px;
`;
export default CustomModal;
