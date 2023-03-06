import { useGetReviews } from "@/hooks/useGetReviews";
import { mainPetpitalList } from "@/share/atom";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import {
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Map,
  MapMarker,
  MapTypeControl,
  Roadview,
  ZoomControl,
} from "react-kakao-maps-sdk";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import { hospitalData, modalState } from "../share/atom";
import CreatePostModal from "../components/custom/CreatePostModal";

interface IHospital {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
}

/* 
  1. 로드뷰
  2. 내 위치 표시
  3. 스카이뷰 지도 전환 컨트롤
  4. 페이지네이션
*/

export function getServerSideProps({ query }: any) {
  // if query object was received, return it as a router prop:
  if (query.id) {
    return { props: { router: { query } } };
  }
  // obtain candidateId elsewhere, redirect or fallback to some default value:
  /* ... */
  return { props: { router: { query: { target: "target", placeId: "id" } } } };
}

const SearchHospital = () => {
  const router = useRouter();
  const {
    query: { target, hospitalName, placeId, hospitalAddress },
  } = router;
  const [place, setPlace] = useState<string | string[]>("");
  const [info, setInfo] = useState<any>();
  const [markers, setMarkers] = useState<any>([]);
  const [map, setMap] = useState<any>();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [hospitalList, setHospitalList] = useState<any>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [targetHospitalData, setTargetHospitalData] =
    useRecoilState<any>(hospitalData);
  const targetHospital = useRef<HTMLInputElement>(null);
  const { recentlyReview, isLoading, recentlyRefetch } = useGetReviews("");
  console.log("recentlyReview", recentlyReview);
  const setNewSearch = useSetRecoilState(mainPetpitalList); //최근 검색된 데이터
  const HospitalData = targetHospitalData;

  // 바깥으로 빼라!
  const Input = () => {
    return (
      <SearchInput
        ref={targetHospital}
        placeholder="찾으실 동물병원의 (시)도 + 구 + 읍(면,동)을 입력하세요"
        type="text"
        autoFocus
        defaultValue={place}
      />
    );
  };

  useEffect(() => {
    // 상세 페이지 열면 hospitalId => 병원 공유 통해서 들어왔을 때 or 병원 클릭 시
    if (hospitalName) {
      setPlace(hospitalName);
    }
  }, []);

  useEffect(() => {
    if (target) {
      console.log(target);
      // 메인 화면 병원 클릭 / 리뷰 클릭 시 / 헤더 통한 검색 / 검색 => target
      // 검색 데이터가 존재하면 place에 저장
      setPlace(target);
    }
    if (!map) return;
    const ps = new kakao.maps.services.Places();
    // 키워드에 맞는 동물병원 표시
    ps.keywordSearch(place + " 동물병원", (data, status, pagination) => {
      if (data.length === 0) {
        setHospitalList([]);
        setPlace("");
      }

      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds();
        let markers: {
          position: { lat: string; lng: string };
          content: string;
        }[] = [];

        const tempArray: any = [];

        data.forEach((marker) => {
          tempArray.push(marker);
          markers.push({
            position: {
              lat: marker.y,
              lng: marker.x,
            },
            content: marker.place_name,
          });
          bounds.extend(new kakao.maps.LatLng(+marker.y, +marker.x));
        });
        setMarkers(markers);
        setHospitalList(tempArray);
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      }
    });
  }, [target, place, map]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value === "") {
      alert("비어있음"); // 추후 모달로 수정 예정
      return;
    } else if (targetHospital.current?.value !== undefined) {
      setIsDetailOpen(false);
      setPlace(targetHospital.current?.value);
      router.push({
        pathname: "/searchHospital",
        query: {
          target: targetHospital.current?.value,
        },
      });
    }
  };

  const onClick = (targetHospital: IHospital) => {
    // 병원 이름만 적으려 했으나 동일 이름의 병원이 존재해 placeName=[병원이름]&id[placeId]로 설정
    router.push(
      {
        pathname: "/searchHospital",
        query: {
          hospitalName: targetHospital.place_name,
          placeId: targetHospital.id,
        },
      },
      undefined,
      { shallow: true },
    );
    setCreateModalOpen(false);
    setIsDetailOpen(true);
    setTargetHospitalData(targetHospital);
  };

  const onClickWriteButton = () => {
    console.log(placeId);
    setCreateModalOpen(true);
  };

  return (
    <>
      {createModalOpen && (
        <CreatePostModal setCreateModalOpen={setCreateModalOpen} />
      )}
      <MapContainer>
        <Map // 로드뷰를 표시할 Container
          center={{
            lat: 37.566826,
            lng: 126.9786567,
          }}
          style={{
            width: "100%",
            height: "100vh",
          }}
          level={3}
          onCreate={setMap}
        >
          <BoardContainer>
            <DashBoard>
              <SearchForm onSubmit={onSubmit}>
                <Input />
              </SearchForm>
              {hospitalList.length > 0
                ? // 1번째 대시보드
                  hospitalList.map((hospital: IHospital) => {
                    return (
                      <div key={hospital.id} onClick={() => onClick(hospital)}>
                        {hospital.place_name}
                      </div>
                    );
                  })
                : "데이터가 없습니다."}
            </DashBoard>
            {isDetailOpen && (
              // 2번째 대시보드
              <DashBoard>
                {/* <div>{targetHospitalData.place_name}</div> */}
                <Roadview // 로드뷰를 표시할 Container
                  position={{
                    // 지도의 중심좌표
                    lat: targetHospitalData.y,
                    lng: targetHospitalData.x,
                    radius: 50,
                  }}
                  style={{
                    // 지도의 크기
                    width: "100%",
                    height: "200px",
                  }}
                />
                <HospitalInfoWrap>
                  <HospitalInfoTopWrap>
                    <div style={{ fontWeight: "bold" }}>{hospitalName}</div>
                  </HospitalInfoTopWrap>
                </HospitalInfoWrap>
                <ReviewInfoWrap>
                  <div style={{ color: "#15B5BF" }}>영수증리뷰</div>
                  <div style={{ color: "lightgray", marginLeft: "10px" }}>
                    최신순
                  </div>
                </ReviewInfoWrap>
                <button onClick={onClickWriteButton}>리뷰 참여하기</button>
                {!isLoading &&
                  recentlyReview?.data
                    .filter(
                      (target) => target.hospitalId === targetHospitalData.id,
                    )
                    .map((review) => {
                      return (
                        <div key={review.id}>
                          <div key={review.id}>{review.title}</div>
                        </div>
                      );
                    })
                    .reverse()}
              </DashBoard>
            )}
          </BoardContainer>
          {/* 마커 표시 */}
          {markers.map(
            (marker: {
              content:
                | string
                | number
                | boolean
                | ReactElement<any, string | JSXElementConstructor<any>>
                | ReactFragment
                | ReactPortal
                | null
                | undefined;
              position: { lat: any; lng: any };
            }) => (
              <MapMarker
                key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
                position={marker.position}
                onClick={() => setInfo(marker)}
              >
                {info && info.content === marker.content && (
                  <div style={{ color: "#000" }}>{marker.content}</div>
                )}
              </MapMarker>
            ),
          )}
        </Map>
      </MapContainer>
    </>
  );
};

const ViewContreoler = styled.div`
  margin-top: 800px;
`;

const DashBoard = styled.div`
  width: 375px;
  height: 100vh;
  background-color: white;
  box-shadow: 4px 0px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid gray;
  padding-top: 60px;
  /* display: none; */
`;

const BoardContainer = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  z-index: 50;
`;

const MapContainer = styled.div`
  position: relative;
`;

const SearchForm = styled.form`
  top: 0;
  z-index: 100;
  padding: 8px;
  background-color: #15b5bf;
`;

const SearchInput = styled.input`
  border: 0.4px solid #000000;
  border-radius: 2px;
  padding: 12px 40px 12px 10px;
  width: 100%;
`;

// ----- 리뷰 css -----
const HospitalInfoWrap = styled.div`
  /* background-color: blue; */
`;
const HospitalInfoTopWrap = styled.div`
  /* background-color: red; */
  height: 60px;
  padding: 10px;
`;
const ReviewInfoWrap = styled.div`
  /* background-color: purple; */
  display: flex;
  align-items: center;
  height: 40px;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
  padding: 10px;
`;

export default SearchHospital;
//
