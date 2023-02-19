import { atom } from "recoil";

export const mainPetpitalList = atom({
  key: "mainPetpital",
  default: "강남 동물병원",
});
export const toggleModal = atom({
  key: "toggleModal",
  default: false,
});
