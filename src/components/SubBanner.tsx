import styled from "@emotion/styled";

export const SubBanner = () => {
  return (
    <SubBannerContainer backgroundImg="https://coolthemestores.com/wp-content/uploads/2021/07/hamster-wallpaper-background.jpg">
      <SubBannerTitle>
        궁금한 점 없으셨나요?
        <br />
        무엇이든 물어보개~
      </SubBannerTitle>
      <SubBannerLogo>
        <SubBannerLogoImg src="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2F%E1%84%90%E1%85%A6%E1%86%A8%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9%20(1).png?alt=media&token=9171cde5-4ca1-4bfb-abf4-03cf00508dae" />
        <div>
          <b>팻피털</b>에서!
        </div>
      </SubBannerLogo>
    </SubBannerContainer>
  );
};

const SubBannerContainer = styled.div<{ backgroundImg: string }>`
  height: 25vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 24px 24px 24px;
  width: 80%;
  margin: 0 auto;
  justify-content: space-between;
  background-image: url(${(props) => props.backgroundImg});
  background-position: center;
`;

const SubBannerTitle = styled.h3`
  font-weight: normal;
  font-size: 1.6rem;
  color: #ffffff;
`;

const SubBannerLogo = styled.div`
  display: flex;
  object-fit: cover;
  justify-content: space-between;
  & div:nth-of-type(1) {
    color: white;
    font-size: 1.8rem;
  }
`;

const SubBannerLogoImg = styled.img`
  object-fit: scale-down;
`;
