import axios from "axios";

const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
const Kakao = axios.create({
  baseURL: "https://dapi.kakao.com", // 공통 요청 경로를 지정해준다.
  headers: {
    Authorization: `KakaoAK ${REST_API_KEY}`,
  },
});

// search image api
export const imageSearch = (params) => {
  return Kakao.get("/v2/search/image", { params });
};
