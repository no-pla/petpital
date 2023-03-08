import styled from "@emotion/styled";

export const LoginBottomImg = ({ children, backgroundImg }: any) => {
  return <LoginBottom backgroundImg={backgroundImg}>{children}</LoginBottom>;
};

const LoginBottom = styled.div<{ backgroundImg: string }>`
  background-image: url(${(props) => props.backgroundImg});
  background-position: center;
  object-fit: cover;
  height: 200px;
  width: 564px;
  margin: 30px 30px;
`;
