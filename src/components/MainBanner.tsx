import styled from "@emotion/styled";

export const MainBannerContiner = ({ children, backgroundImg }: any) => {
  return <MainBanner backgroundImg={backgroundImg}>{children}</MainBanner>;
};

const MainBanner = styled.div<{ backgroundImg: string }>`
  background-image: url(${(props) => props.backgroundImg});
  background-position: center;
  object-fit: cover;
  height: calc(min(40vh, 400px));
`;
