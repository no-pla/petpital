import axios from "axios";
import { useQuery } from "react-query";
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
    uid: any;
  }[];
}

export const useGetReviews = (limit: string) => {
  const { isLoading, data: recentlyReview } = useQuery<IReview>(
    "getrecentlyReview",
    () => {
      return axios.get(`${REVIEW_SERVER}posts${limit}`);
    },
  );
  return { recentlyReview, isLoading };
};
