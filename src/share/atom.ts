import { atom } from "recoil";
import { recoilPersist } from "recoil-persist";

const { persistAtom } = recoilPersist();

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
