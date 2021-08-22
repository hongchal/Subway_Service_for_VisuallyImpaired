import React, {useEffect, useRef, useState} from 'react';
import {
  DeviceEventEmitter,
  View,
  Text,
  PermissionsAndroid,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
} from 'react-native';
import Beacons from 'react-native-beacons-manager';
//@ts-ignore
import KalmanFilter from 'kalmanjs';
import styled from 'styled-components/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Tts from 'react-native-tts';
import {isClientRideState} from '../recoilState';

import BleManager from 'react-native-ble-manager';
import {useSetRecoilState} from 'recoil';
import {STRING} from '../assets/string';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const MAX = 40;
const MINORDEFAULT = 64000;
const dummyDistance = 100;

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "let's find beacons",
        message:
          '서비스 사용을 위해서 사용자의 위치 정보가 필요합니다. 위치 정보 추적을 허용하시겠습니까?',
        buttonNeutral: '다음에 하겠습니다',
        buttonNegative: '취소',
        buttonPositive: '앱 사용중에 허용',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('granted');
    } else {
      console.log('permission denied');
    }
  } catch (err) {
    console.log(err);
  }
};

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

const speakClosestDoor = (closestDoor: number, minDistance: number) => {
  if (minDistance === dummyDistance) {
    Tts.speak('백 미터 이내에 가까운 스크린 도어가 탐지되지 않습니다.');
  } else {
    const section = Math.floor(closestDoor / 4) + 1;
    const door = (closestDoor % 4) + 1;
    const sectionString = section.toString();
    const doorString = door.toString();
    // console.log(sectionString + '-' + doorString);
    // const closestDoorString = closestDoor.toString();
    Tts.speak(sectionString + '다시' + doorString + '가 가장 가깝습니다');
  }
};

const DetectBeacone: React.FC = () => {
  let minDistance: number = dummyDistance;
  const [nearestDoor, setNearestDoor] = useState<number>(0);
  // const region = { uuid :'iBeacon', identifier : '74278bda-b644-4520-8f0c-720eaf059935'};
  const navigation = useNavigation();
  const [isScanning, setIsScanning] = useState(false);
  const refCount = useRef(0);
  const [isIntervalEnd, setIsIntervalEnd] = useState<boolean>(false);
  const clientResponse = useRef(false);
  const responseTimeCount = useRef(0);
  const [minDistanceState, setMinDistanceState] = useState<number>(minDistance);
  // const peripherals = new Map();
  // const [list, setList] = useState([]);
  // const [device, setDevice] = useState<any>(null);

  const route = useRoute();

  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 3, true)
        .then((results) => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleDiscoverPeripheral = (peripheral: any) => {
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    } else if (peripheral.name === 'SAMPLE') {
      console.log('detect ble');
      refCount.current++;
      console.log('..................', refCount.current);
      // setDevice(peripheral);
      // console.log('Got ble peripheral', peripheral);
      // console.log(peripheral.advertising.manufacturerData.bytesRead);
      // testPeripheral(peripheral);
    }
    // console.log(peripheral.name);
    // peripherals.set(peripheral.id, peripheral);
    // setList(Array.from(peripherals.values()));
  };

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  useEffect(() => {
    Tts.speak('스크린 도어 정보 기능을 제공합니다.');
    Tts.speak('스크린 도어 정보를 알고싶다면 화면을 터치해주세요.');
  }, []);

  useEffect(() => {
    BleManager.start({showAlert: false});

    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);

    return () => {
      console.log('unmount');
      bleManagerEmitter.removeListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoverPeripheral,
      );
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
    };
  }, []);

  useEffect(() => {
    console.log('ref:', refCount.current);
    if (refCount.current === 0) {
      const isRideSubway = setInterval(() => {
        if (refCount.current > 5) {
          console.log('stop');
          clearInterval(isRideSubway);
          setIsIntervalEnd(true);
        } else {
          startScan();
        }
      }, 6000);
    }
  }, [refCount.current]);

  useEffect(() => {
    if (isIntervalEnd) {
      Tts.speak('지하철 탑승이 인식되었습니다.');
      Tts.speak('지하철을 탑승하신게 맞다면 화면을 한번 터치해주세요');

      const responseInterval = setInterval(() => {
        responseTimeCount.current++;
        console.log(responseTimeCount.current);
        if (clientResponse.current) {
          Tts.speak('지하철 탑승을 확인했습니다.');
          Tts.speak('지하철 하차 두 정거장 전에 알려드립니다.');
          clearInterval(responseInterval);
          navigation.navigate(STRING.NAVIGATION.SUBWAY_LOCATION, {
            screen: STRING.NAVIGATION.SUBWAY_LOCATION_SCREEN,
            params: route.params,
          });
        } else {
          if (responseTimeCount.current >= 15) {
            setIsIntervalEnd(false);
            refCount.current = 0;
            Tts.speak('장시간 반응이 없어 지하철 탑승 인식을 재실행합니다.');
            Tts.speak('스크린 도어의 정보를 얻고 싶다면 화면을 터치해주세요.');
            responseTimeCount.current = 0;
            clearInterval(responseInterval);
          }
        }
      }, 1000);
    }
  }, [isIntervalEnd]);

  const checkClientResponse = async () => {
    console.log('yes');
    clientResponse.current = true;
  };

  const ttsSet = () => {
    Tts.setDefaultLanguage('ko-KR');
  };

  useEffect(() => {}, [nearestDoor]);

  useEffect(() => {
    ttsSet();

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
        console.log(Beacons);
        // use Kalman Filter for accuracy
        Beacons.map((beacon: any) => {
          // console.log(beacon.minor, beacon.distance);
          let beaconIndex = beacon.minor - MINORDEFAULT;
          console.log('beacon index: ', beaconIndex);
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

    requestLocationPermission(); //.then(() => console.log('permission end'));

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
      {isIntervalEnd ? (
        <InfoWrapper onPress={() => checkClientResponse()}>
          <InfoText>지하철 탑승을 확인해주세요</InfoText>
        </InfoWrapper>
      ) : (
        <InfoWrapper
          onPress={() => speakClosestDoor(nearestDoor, minDistanceState)}>
          <InfoText>{nearestDoor}</InfoText>
        </InfoWrapper>
      )}

      <InfoWrapper
        onPress={() =>
          navigation.navigate(STRING.NAVIGATION.DETECT_BEACON_WHEN_QUIT)
        }>
        <InfoText>'하차 테스트'</InfoText>
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

export default DetectBeacone;
