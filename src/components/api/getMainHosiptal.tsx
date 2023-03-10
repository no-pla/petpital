import { mainPetpitalList } from "../../share/atom";
import axios from "axios";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

export const useGetMainHospital = (page: number) => {
  const target = useRecoilValue(mainPetpitalList);
  // console.log(target);
  const targetHospital = target + " 동물병원";
  const { data, refetch } = useQuery(
    ["getMainPetpital", target, page],
    () => {
      return axios.get(
        `https://dapi.kakao.com/v2/local/search/keyword.json?sort=accuracy&size=6&page=${page}&query=${targetHospital}`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`,
          },
        },
      );
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: true,
      select: (data) => data.data,
    },
  );
  return { data, refetch };
};
