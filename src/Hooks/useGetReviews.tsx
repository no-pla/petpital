import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { REVIEW_SERVER } from "../share/server";

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
    userId: any;
    profileImage: string;
    displayName: string;
    date: string;
    hospitalAddress: string;
    hospitalName: string;
  }[];
}

export const useGetReviews = (limit: string) => {
  const {
    isLoading,
    data: recentlyReview,
    refetch: recentlyRefetch,
  } = useQuery<IReview>(["getrecentlyReview", limit], async () => {
    const res = await axios.get(`${REVIEW_SERVER}posts${limit}`);
    console.log("res", res);
    return res;
  });
  console.log("eee", recentlyReview);

  return { recentlyReview, isLoading, recentlyRefetch };
};
