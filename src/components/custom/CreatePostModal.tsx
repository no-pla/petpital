import styled from "styled-components";

interface Props {
  width?: string;
  height?: string;
  children?: React.ReactNode;
}

const Modal: React.FC<Props> = ({ width, height, children }) => {
  return (
    <>
      <Container>
        <ModalContainer width={width} height={height}>
          {children}
        </ModalContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
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
  max-width: 500px;
  width: ${(props) => props.width || "80%"};
  height: ${(props) => props.height || "80%"};
  max-height: 500px;
  overflow: hidden;
`;

export default Modal;
