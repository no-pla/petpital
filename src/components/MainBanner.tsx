import styled from "@emotion/styled";

export const MainBannerContiner = ({ children, backgroundImg }: any) => {
  return <MainBanner backgroundImg={backgroundImg}>{children}</MainBanner>;
};

const MainBanner = styled.div<{ backgroundImg: string }>`
  padding-top: 30px;
  background-image: url(${(props) => props.backgroundImg});
  background-position: center;
  object-fit: cover;
  height: 480px;
  padding-top: 60px;
`;
