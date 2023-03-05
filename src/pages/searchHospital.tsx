import { useGetReviews } from "@/hooks/useGetReviews";
import { mainPetpitalList } from "@/share/atom";
import { REVIEW_SERVER } from "@/share/server";
import styled from "@emotion/styled";
import axios from "axios";
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
import { useSetRecoilState } from "recoil";

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
  return {
    props: {
      router: {
        query: {
          target: "target",
          placeId: "id",
          hospitalName: "hospitalName",
        },
      },
    },
  };
}

const SearchHospital = () => {
  const router = useRouter();
  const {
    query: { target, hospitalName, placeId, search },
  } = router;
  const [place, setPlace] = useState<string | string[]>("");
  const [info, setInfo] = useState<any>();
  const [markers, setMarkers] = useState<any>([]);
  const [map, setMap] = useState<any>();

  const [hospitalList, setHospitalList] = useState<any>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [targetHospitalData, setTargetHospitalData] = useState<any>([]);
  const [hospitalRate, setHospitalRate] = useState<any[]>([]);
  const targetHospital = useRef<HTMLInputElement>(null);
  const { recentlyReview, isLoading } = useGetReviews("");
  const [state, setState] = useState({
    center: {
      lat: 33.450701,
      lng: 126.570667,
    },
    errMsg: null,
    isLoading: true,
  });

  const setNewSearch = useSetRecoilState(mainPetpitalList); //최근 검색된 데이터

  useEffect(() => {
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            center: {
              lat: position.coords.latitude, // 위도
              lng: position.coords.longitude, // 경도
            },
            isLoading: false,
          }));
        },
        (err) => {
          setState((prev: any) => ({
            ...prev,
            errMsg: err.message,
            isLoading: false,
          }));
        },
      );
    } else {
      // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
      setState((prev: any) => ({
        ...prev,
        errMsg: "geolocation을 사용할수 없어요..",
        isLoading: false,
      }));
    }
  }, []);

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
    if (hospitalName && placeId) {
      setPlace(hospitalName);
      setIsDetailOpen(true);
    }

    if (!map) return;
    if (!hospitalName) return;
    const ps = new kakao.maps.services.Places();
    // 키워드에 맞는 동물병원 표시
    ps.keywordSearch(hospitalName, (data, status, pagination) => {
      if (data.length === 0) {
        setHospitalList([]);
        setPlace("");
      } else if (data.length === 1) {
        setTargetHospitalData(data[0]);
      } else if (data.length > 1) {
        setTargetHospitalData(
          data.filter((target: any) => target.id === placeId)[0],
        );
        // setTargetHospitalData();
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
  }, [map]);

  useEffect(() => {
    // 병원을 검색했을 때 실행
    if (target) {
      setPlace(target);
    }
    if (!place) return;
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

  useEffect(() => {
    const tempArray: any[] = [];
    const tempDataArray: any[] = [];
    // 병원 아이디 가져오기

    hospitalList.map((hospital: IHospital) => {
      tempArray.push(hospital.id);
    });

    // 병원 데이터 가져오기
    const promises = tempArray.map(async (hospital) => {
      const costArray: any[] | PromiseLike<any[]> = [];
      await axios
        .get(`${REVIEW_SERVER}posts?hospitalId=${hospital}`)
        .then((res) => {
          if (res.data) {
            costArray.push(...res.data);
          } else {
            costArray.push(...[]);
          }
        });
      return costArray;
    });

    Promise.all(promises).then(async (results) => {
      const tempArray: any[] = [];
      const tempCostArray: any[] = [];
      // console.log(results);
      results.forEach((hospital: any) => {
        const tempDataArray: any[] = [];
        if (hospital.length > 0) {
          hospital.forEach((element: any) => {
            tempDataArray.push(element.rating);
          });
        } else {
          tempDataArray.push("데이터없음");
        }
        tempArray.push(...tempDataArray);
      });

      if (!tempArray.includes("데이터없음")) {
        tempCostArray.push(
          (
            tempArray.reduce((acc, cur) => acc + cur, 0) / tempArray.length
          ).toFixed(2),
        );
      } else {
        tempCostArray.push("데이터없음");
      }
      setHospitalRate(tempCostArray);
    });
  }, [hospitalList, place]);

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
    setIsDetailOpen(true);
    setTargetHospitalData(targetHospital);
  };

  const onClickWriteButton = () => {
    console.log(placeId);
  };

  return (
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
                hospitalList.map((hospital: IHospital, index: number) => {
                  return (
                    <div key={hospital.id} onClick={() => onClick(hospital)}>
                      {hospital.place_name}
                      <div>{hospitalRate[index]}</div>
                    </div>
                  );
                })
              : "데이터가 없습니다."}
          </DashBoard>
          {isDetailOpen && (
            // 2번째 대시보드
            <DashBoard>
              <div>{targetHospitalData.place_name}</div>
              <Roadview // 로드뷰를 표시할 Container
                position={{
                  // 지도의 중심좌표
                  lat: targetHospitalData.y,
                  lng: targetHospitalData.x,
                  radius: 100,
                }}
                style={{
                  // 지도의 크기
                  width: "100%",
                  height: "250px",
                }}
              />
              <button onClick={onClickWriteButton}>댓글 달기</button>
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
                  })}
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
        {/* 현재 접속 위치 표시 */}
        {!state.isLoading && (
          <MapMarker position={state.center}>
            <div style={{ padding: "5px", color: "#000" }}>
              {state.errMsg ? state.errMsg : "여기에 계신가요?!"}
            </div>
          </MapMarker>
        )}
      </Map>
    </MapContainer>
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

export default SearchHospital;
//
