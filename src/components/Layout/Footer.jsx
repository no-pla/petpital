import styled from "@emotion/styled";

export default function Footer() {
  return (
    <FooterContainer>
      <FooterText>동물을 사랑한다면,</FooterText>
      <FooterLogo src="https://user-images.githubusercontent.com/88391843/220821556-46417499-4c61-47b8-b5a3-e0ffc41f1df1.png" />
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  z-index: 100;
  @media screen and (max-width: 375px) {
    display: none;
  }
`;

const FooterText = styled.div`
  color: #15b5bf;
  font-size: 20px;
  font-weight: 700;
`;

const FooterLogo = styled.img`
  width: 120px;
  object-fit: contain;
  cursor: pointer;
  margin-right: 24px;
`;
