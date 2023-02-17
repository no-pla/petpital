import { useGetPetConsult } from "@/Hooks/useGetReviews";
import { useRouter } from "next/router";

const PetconsultDetail = () => {
  const router = useRouter();
  const { isLoadingPetConsult, petConsult } = useGetPetConsult({
    id: "?id=" + router.query.id,
  });

  return <></>;
};

export default PetconsultDetail;
