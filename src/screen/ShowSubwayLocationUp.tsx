import React, {useEffect, useRef, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {subwayLineState} from '../recoilState';
import axios from 'axios';
import styled from 'styled-components/native';
import {ActivityIndicator, FlatList, Text, Vibration} from 'react-native';
import SUBWAYDATA from '../assets/subwayData';
import {useRoute} from '@react-navigation/native';

const ShowSubwayLocationUp = () => {
  const subwayLine: string = useRoute().params.lineNumber;
  const startPoint = useRoute().params.startPoint;
  const endPoint = useRoute().params.endPoint;
  const [endPointIndex, setEndPointIndex] = useState<number>(0);
  const [ridingTrainNo, setRidingTrainNo] = useState<string>('7182');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [upLine, setUpLine] = useState<Array<any>>([]);
  const [subwayStations, setSubwayStations] = useState<Array<any>>([]);

  const getSubwayStations = () => {
    const subwayData = SUBWAYDATA.DATA;
    const res = subwayData
      .filter((data) => data.line_num === subwayLine) //todo: subwayLine으로
      .sort(function (a, b) {
        return b.station_cd - a.station_cd;
      });
    setSubwayStations(res);
  };
  const getIndexOfEndPoint = () => {
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
        const upLineRes = res.data.realtimePositionList.filter(
          (data) => data.updnLine == 0,
        );
        setUpLine(upLineRes);
      })
      .catch((e) => console.error(e));
  };

  const timeRef = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    getSubwayStations();
    getIndexOfEndPoint();
    getSubwayLocation();
    timeRef.current = setInterval(() => {
      getSubwayLocation();
    }, 10000);

    setIsLoaded(true);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = null;
      }
    };
  }, []);

  return (
    <Wrapper>
      {isLoaded ? (
        <FlatList
          data={subwayStations}
          keyExtractor={(item) => item.station_nm}
          renderItem={({item, index}) => {
            let isUp = false;
            let upTrainStatus = 1;
            let upTrainNo = '';
            upLine.map((nowStation, idx) => {
              if (nowStation.statnNm === item.station_nm) {
                isUp = true;
                upTrainStatus = nowStation.trainSttus;
                upTrainNo = nowStation.trainNo;
              }
            });
            if (upTrainNo === ridingTrainNo) {
              if (endPointIndex - index === 0 || endPointIndex - index === 1) {
                Vibration.vibrate();
              }
            }
            return (
              <FlatListSubwayBox key={item.station_nm}>
                <UpItem trainStatus={upTrainStatus}>
                  {isUp && (
                    <Text>
                      {upTrainNo}:
                      {upTrainStatus === 0
                        ? '진입'
                        : upTrainStatus === 1
                        ? '도착'
                        : '출발'}
                    </Text>
                  )}
                </UpItem>
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
const UpItem = styled.View<{trainStatus: number}>`
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

export default ShowSubwayLocationUp;