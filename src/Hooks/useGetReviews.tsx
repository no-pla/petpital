import axios from "axios";
import { useQuery } from "react-query";

interface IReview {
  data: {
    title: string;
    contents: string;
    totalCost: string;
    rating: number;
    selectedColors: string[];
    downloadUrl: string;
    hospitalId: string;
    id: number;
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
