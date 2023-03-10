import styled from "@emotion/styled";
import Image from "next/image";

export default function Footer() {
  return (
    <FooterContainer>
      <FooterItems>
        <Image
          width={30}
          height={40}
          alt="footermark"
          src="https://user-images.githubusercontent.com/115146172/223037617-d80cd8be-32b3-4f56-9e29-26f6b0a2a153.jpg"
        />
        <div style={{ display: "flex" }}>
          <FooterText>동물을 사랑한다면,</FooterText>
          <Image
            alt="footerlogo"
            width={150}
            height={60}
            src="https://user-images.githubusercontent.com/88391843/220821556-46417499-4c61-47b8-b5a3-e0ffc41f1df1.png"
            style={{
              objectFit: "contain",
              cursor: "pointer",
              marginRight: "24px",
            }}
          />
        </div>
      </FooterItems>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  width: 100%;
  height: 50px;
  background: white;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  z-index: 100;
  margin: 0 auto;
  @media screen and (max-width: 375px) {
    display: none;
  }
  padding: 40px 45px;
`;

const FooterItems = styled.div`
  width: 100%;
  height: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  margin: 0 auto;
  justify-content: space-between;
  padding-left: 60px;
  gap: 36px;
`;

const FooterText = styled.div`
  color: #15b5bf;
  font-size: 18px;
  font-weight: 700;
  margin-right: 10px;
  align-self: center;
  @media screen and (max-width: 565px) {
    display: none;
  }
`;
