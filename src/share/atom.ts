import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const mainPetpitalList = atom({
  key: "mainPetpital",
  default: "강남 동물병원",
});

export const hospitalData = atom({
  key: "hospitalPlaces",
  default: null,
  effects_UNSTABLE: [persistAtom],
});

export const currentUserUid = atom({
  key: "currentUserUid",
  default: null,
  effects_UNSTABLE: [persistAtom],
});
