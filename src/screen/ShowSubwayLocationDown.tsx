import React, {useEffect, useRef, useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {
  isClientDepartDestinationState,
  isClientRideState,
} from '../recoilState';
import axios from 'axios';
import styled from 'styled-components/native';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  Vibration,
} from 'react-native';
import SUBWAYDATA from '../assets/subwayData';
import {useNavigation, useRoute} from '@react-navigation/native';
import Tts from 'react-native-tts';
import {STRING} from '../assets/string';

const ShowSubwayLocationDown = () => {
  const navigation = useNavigation();
  const subwayLine = useRoute().params.lineNumber;
  const startPoint = useRoute().params.startPoint;
  const endPoint = useRoute().params.endPoint;
  const [endPointIndex, setEndPointIndex] = useState<number>(0);
  const [ridingTrainNo, setRidingTrainNo] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [downLine, setDownLine] = useState<Array<any>>([]);
  const [subwayStations, setSubwayStations] = useState<Array<any>>([]);
  const [isClientDepart, setIsClientDepart] = useRecoilState(
    isClientDepartDestinationState,
  );

  const leftTwoStationsCount = useRef<number>(0);
  const leftOneStationCount = useRef<number>(0);

  const getSubwayNumber = () => {
    subwayStations.map((item) => {
      downLine.map((nowStation) => {
        // console.log('now', nowStation.statnNm);
        if (
          nowStation.statnNm.includes(item.station_nm) &&
          nowStation.statnNm.includes(startPoint)
        ) {
          if (ridingTrainNo === '') {
            setRidingTrainNo(nowStation.trainNo);
            Tts.speak(nowStation.trainNo + '번 열차를 탑승하였습니다.');
          }
        }
      });
    });
  };

  const getSubwayStations = () => {
    const subwayData = SUBWAYDATA.DATA;
    const res = subwayData
      .filter((data) => data.line_num === subwayLine)
      .sort(function (a, b) {
        return a.station_cd - b.station_cd;
      });
    setSubwayStations(res);
    getIndexOfEndPoint(res);
  };
  const getIndexOfEndPoint = (subwayStations: Array<any>) => {
    subwayStations.map((data, index) => {
      if (data.station_nm === endPoint) {
        setEndPointIndex(index);
      }
    });
  };
  const getSubwayLocation = async () => {
    const apiSubwayLine = subwayLine.slice(1);

    await axios
      .get(
        `http://swopenAPI.seoul.go.kr/api/subway/725864484a6a77363533536c565973/json/realtimePosition/0/40/${apiSubwayLine}/`,
      )
      .then((res) => {
        const dnLineRes = res.data.realtimePositionList.filter(
          (data) => data.updnLine == 1,
        );
        setDownLine(dnLineRes);
      })
      .catch((e) => console.error(e));
  };

  const timeRef = useRef<null | NodeJS.Timeout>(null);

  const fetchData = async () => {
    await getSubwayStations();
    // await getIndexOfEndPoint();
    await getSubwayLocation();
  };
  useEffect(() => {
    subwayStations.length > 0 && downLine.length > 0 && getSubwayNumber();
  }, [subwayStations, downLine]);

  useEffect(() => {
    fetchData();
    timeRef.current = setInterval(() => {
      if (ridingTrainNo === '') {
        getSubwayNumber();
      }
      getSubwayLocation();
    }, 10000);

    setIsLoaded(true);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = null;
      }
      leftOneStationCount.current = 0;
      leftTwoStationsCount.current = 0;
    };
  }, []);

  useEffect(() => {
    if (isClientDepart) {
      Tts.speak(`${endPoint} 도착입니다.`);
      navigation.navigate(STRING.NAVIGATION.HOME, {departDestination: true});
    }
  }, [isClientDepart]);

  return (
    <Wrapper>
      {isLoaded && endPointIndex ? (
        <FlatList
          data={subwayStations}
          keyExtractor={(item) => item.station_nm}
          renderItem={({item, index}) => {
            let isDown = false;
            let downTrainStatus = 1;
            let downTrainNo = '';
            downLine.map((nowStation, idx) => {
              if (nowStation.statnNm.includes(item.station_nm)) {
                isDown = true;
                downTrainStatus = nowStation.trainSttus;
                downTrainNo = nowStation.trainNo;
              }
            });
            if (ridingTrainNo.length > 0 && downTrainNo === ridingTrainNo) {
              console.log('탑승열차:', ridingTrainNo);
              console.log('end:', endPointIndex);
              console.log('idx', index);
              if (endPointIndex - index < 3 && endPointIndex - index >= 0) {
                Vibration.vibrate();
                const leftStations = endPointIndex - index;
                switch (leftStations) {
                  case 0:
                    setIsClientDepart(true);
                    break;
                  case 1:
                    leftTwoStationsCount.current < 3 &&
                      Tts.speak(`${endPoint} 도착 한 개 역 전입니다.`);
                    leftTwoStationsCount.current++;
                    break;
                  case 2:
                    leftOneStationCount.current < 3 &&
                      Tts.speak(`${endPoint} 도착 두 개 역 전입니다.`);
                    leftOneStationCount.current++;
                    break;
                }
              }
            }
            return (
              <FlatListSubwayBox key={item.station_nm}>
                <DownItem trainStatus={downTrainStatus}>
                  {isDown && (
                    <Text>
                      {downTrainNo} :
                      {downTrainStatus === 0
                        ? '진입'
                        : downTrainStatus === 1
                        ? '도착'
                        : '출발'}
                    </Text>
                  )}
                </DownItem>
                <SubwayItem>
                  <Text>{item.station_nm}</Text>
                </SubwayItem>
              </FlatListSubwayBox>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ActivityIndicator size={'large'} color={'#000000'} />
      )}
    </Wrapper>
  );
};
//todo: 특정 구간에서 API끼리 name이 다른 경우 처리
const Wrapper = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  align-items: center;
`;
const FlatListSubwayBox = styled.View`
  flex-direction: row;
`;
const SubwayItem = styled.View`
  height: 40px;
  width: 150px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  margin-bottom: 2px;
  background-color: white;
`;
const DownItem = styled.View<{trainStatus: number}>`
  height: 40px;
  width: 100px;
  justify-content: ${(props) =>
    props.trainStatus === 0
      ? 'flex-start'
      : props.trainStatus === 1
      ? 'center'
      : 'flex-end'};
  align-items: center;
`;

export default ShowSubwayLocationDown;
