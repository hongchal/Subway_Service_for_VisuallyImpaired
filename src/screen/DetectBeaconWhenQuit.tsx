import React, {useEffect, useRef, useState} from 'react';
import Tts from 'react-native-tts';
import Beacons from 'react-native-beacons-manager';
import KalmanFilter from 'kalmanjs';
import {DeviceEventEmitter} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';
import {useSetRecoilState} from 'recoil';
import {isClientRideState} from '../recoilState';

const MAX = 40;
const MINORDEFAULT = 64000;
const dummyDistance = 100;
const ExitInfo = [10, 20];

const RangingBeacon = async () => {
  try {
    await Beacons.startRangingBeaconsInRegion(
      'iBeacon',
      '74278bda-b644-4520-8f0c-720eaf059935',
    );
  } catch (err) {
    console.log(`Beacons ranging not started, error: ${err}`);
  }
};

const findNearestExit = async (closestDoor: number) => {
  let nearestDistance = dummyDistance;
  let exitClosest = dummyDistance;
  await ExitInfo.forEach((exitInfoItem) => {
    // console.log(
    //   'info: ',
    //   exitInfoItem,
    //   closestDoor,
    //   exitInfoItem - closestDoor,
    // );
    // console.log('nearestDistance: ', nearestDistance);
    if (Math.abs(exitInfoItem - closestDoor) < Math.abs(nearestDistance)) {
      nearestDistance = exitInfoItem - closestDoor;
      exitClosest = exitInfoItem;
    }
  });

  return [nearestDistance, exitClosest];
};

const speakClosestDoor = async (closestDoor: number, minDistance: number) => {
  if (minDistance === dummyDistance) {
    Tts.speak('스크린 도어 정보를 읽지 못했습니다. 다시 한 번 시도해주세요.');
  } else {
    const section = Math.floor(closestDoor / 4) + 1;
    const door = (closestDoor % 4) + 1;
    const sectionString = section.toString();
    const doorString = door.toString();

    const nearestExitInfo = await findNearestExit(closestDoor);
    const exitSection = Math.floor(nearestExitInfo[1] / 4) + 1;
    const exitDoor = (nearestExitInfo[1] % 4) + 1;
    const exitSectionString = exitSection.toString();
    const exitDoorString = exitDoor.toString();

    // console.log(nearestExitInfo[0], nearestExitInfo[1]);
    // console.log(sectionString + '-' + doorString);
    // const closestDoorString = closestDoor.toString();
    Tts.speak(
      '현재' + sectionString + '다시' + doorString + '에 위치해 있습니다',
    );
    Tts.speak(
      '가장 가까운 출구는' +
        exitSectionString +
        '다시' +
        exitDoorString +
        '에 있습니다',
    );
    if (nearestExitInfo[0] < 0) {
      Tts.speak('왼쪽으로 이동해주세요');
    } else if (nearestExitInfo[0] > 0) {
      Tts.speak('오른쪽으로 이동해주세요');
    } else if (nearestExitInfo[0] === 0) {
      Tts.speak('출구 계단과 가장 가까운 스크린 도어에 위치해 있습니다');
    }
  }
};

const DetectBeaconWhenQuit: React.FC = () => {
  let minDistance: number = dummyDistance;
  const [minDistanceState, setMinDistanceState] = useState<number>(minDistance);
  const [nearestDoor, setNearestDoor] = useState<number>(0);
  // const region = { uuid :'iBeacon', identifier : '74278bda-b644-4520-8f0c-720eaf059935'};
  const [isScanning, setIsScanning] = useState(false);
  const navigation = useNavigation();

  const ttsSet = () => {
    Tts.setDefaultLanguage('ko-KR');
  };

  useEffect(() => {
    ttsSet();
    Tts.speak('하차 역에 도착하여 하차 안내를 시작합니다.');
    Tts.speak('화면을 터치하여 출구 방향 정보를 알 수 있습니다.');

    let kalamanFilterDistance = new Array(MAX);
    let beaconList = new Array(MAX);
    for (let i = 0; i < MAX; i++) {
      beaconList[i] = new KalmanFilter();
    }
    kalamanFilterDistance.fill(dummyDistance);

    // Print a log of the detected iBeacons (1 per second)
    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      try {
        const Beacons = data.beacons;
        // console.log(Beacons);
        // use Kalman Filter for accuracy
        Beacons.map((beacon: any) => {
          // console.log(beacon.minor, beacon.distance);
          let beaconIndex = beacon.minor - MINORDEFAULT;
          // console.log('beacon index: ', beaconIndex);
          kalamanFilterDistance[beaconIndex] = parseFloat(
            beaconList[beaconIndex].filter(beacon.distance).toFixed(2),
          );
        });

        // console.log('kal dis: ',kalamanFilterDistance);
        minDistance = Math.min.apply(null, kalamanFilterDistance);
        setMinDistanceState(minDistance);

        kalamanFilterDistance.forEach((item, index) => {
          if (item !== undefined) {
            item === minDistance ? setNearestDoor(index) : dummyDistance;
          }
        });
      } catch (err) {
        console.log(
          '-----------------------------------------------------------------------',
        );
        console.log(err);
        console.log(
          '-----------------------------------------------------------------------',
        );
      }
    });

    return () => {
      Beacons.stopRangingBeaconsInRegion(
        'iBeacon',
        '74278bda-b644-4520-8f0c-720eaf059935',
      )
        .then(() => console.log('Beacons ranging stopped succesfully'))
        .catch((error) =>
          console.log(`Beacons ranging not stopped, error: ${error}`),
        );
      DeviceEventEmitter.removeAllListeners();
    };
  }, []);

  Beacons.detectIBeacons();
  RangingBeacon();

  return (
    <React.Fragment>
      <SafeAreaView />

      <InfoWrapper
        onPress={() => speakClosestDoor(nearestDoor, minDistanceState)}>
        <InfoText>{nearestDoor}</InfoText>
      </InfoWrapper>
    </React.Fragment>
  );
};

const SafeAreaView = styled.SafeAreaView`
  flex: 0;
  background-color: white;
`;

const InfoWrapper = styled.TouchableOpacity`
  flex: 1;
  background-color: white;
  border-width: 1px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const InfoText = styled.Text`
  color: black;
  font-size: 30px;
  font-weight: bold;
`;

export default DetectBeaconWhenQuit;
