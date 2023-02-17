import axios from "axios";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

export interface IReview {
  data: {
    title: string;
    contents: string;
    totalCost: string;
    rating: number;
    selectedColors: string[];
    downloadUrl: string;
    id: number;
  }[];
}

interface INewPetsult {
  data: {
    id: string;
    content: string;
    nickname: any;
    profileImg: any;
    createdAt: number;
  }[];
}

export const useGetReviews = () => {
  const { isLoading, data: recentlyReview } = useQuery<IReview>(
    "getrecentlyReview",
    () => {
      return axios.get("http://localhost:3001/posts");
    },
  );
  return { recentlyReview, isLoading };
};

export const useGetPetConsult = ({ id }: any) => {
  const router = useRouter();
  console.log(router.query.id, id);
  const { data: petConsult, isLoading: isLoadingPetConsult } =
    useQuery<INewPetsult>({
      queryKey: ["getPetsult", id],
      queryFn: () => {
        return axios.get(`http://localhost:3001/qna${id}`);
      },
    });
  return { isLoadingPetConsult, petConsult };
};
