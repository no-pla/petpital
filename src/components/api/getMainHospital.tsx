import { mainPetpitalList } from "@/share/atom";
import axios from "axios";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

export const useGetMainHospital = (page: number) => {
  const target = useRecoilValue(mainPetpitalList);
  const { data } = useQuery(
    ["getMainPetpital", target, page],
    () => {
      return axios.get(
        `https://dapi.kakao.com/v2/local/search/keyword.json?sort=accuracy&size=5&page=${page}&query=${target}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        },
      );
    },
    {
      keepPreviousData: true,
    },
  );
  return { data };
};
