import React from "react";
import styled from "styled-components";

const ConfirmModal = ({
  message,
  onCancel,
  onConfirm,
}: {
  message: string;
  onCancel: any;
  onConfirm: any;
}) => {
  return (
    <Modal>
      <ModalContent>
        <p>{message}</p>
        <ModalButtons>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </ModalButtons>
      </ModalContent>
    </Modal>
  );
};

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

export default ConfirmModal;
