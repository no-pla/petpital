import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

export const mainPetpitalList = atom({
  key: "mainPetpital",
  default: "강남 동물병원",
  effects_UNSTABLE: [persistAtom],
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

export const isModalOpenState = atom({
  key: "isModalOpenState",
  default: false,
  effects_UNSTABLE: [persistAtom],
});

// 모달을 전역으로 관리해라!
