import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, View, Text, PermissionsAndroid, Button} from 'react-native';
import Beacons from 'react-native-beacons-manager';
//@ts-ignore
import KalmanFilter from 'kalmanjs';
import styled from 'styled-components/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';
import Tts from 'react-native-tts';
import TestRssi from './TestRssi';
import { STRING } from '../assets/string';

const MAX = 8;
const MINORDEFAULT = 64000;
const dummyDistance = 1000;

const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "let's find beacons",
        message: '서비스 사용을 위해서 사용자의 위치 정보가 필요합니다. 위치 정보 추적을 허용하시겠습니까?',
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

const speakClosestDoor = (closestDoor : number) => {
  console.log(closestDoor)
  if(closestDoor === dummyDistance){
    Tts.speak('가까운 스크린 도어가 탐지되지 않습니다.')
  }else{
    const section = (closestDoor / 4).toFixed();
    const door = (closestDoor % 5);
    const sectionString = section.toString();
    const doorString = door.toString();
    console.log(sectionString + '-' + doorString );
    const closestDoorString = closestDoor.toString();
    Tts.speak(sectionString + '다시' + doorString + '가 가장 가깝습니다');
  }
}

const DetectBeacone = () => {
  let minDistance: number;
  const [nearestDoor, setNearestDoor] = useState<number>(0);
  // const region = { uuid :'iBeacon', identifier : '74278bda-b644-4520-8f0c-720eaf059935'};
  const navigation = useNavigation();
  
  const ttsSet = () => {
    Tts.setDefaultLanguage('ko-KR');
  }

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
      try{     
        const Beacons = data.beacons;
        // console.log(Beacons)
        // use Kalman Filter for accuracy
        Beacons.map((beacon: any) => {
          // console.log(beacon.minor, beacon.distance);
          let beaconIndex = beacon.minor - MINORDEFAULT;
          // console.log(beaconIndex)
          kalamanFilterDistance[beaconIndex] = parseFloat(
          beaconList[beaconIndex].filter(beacon.distance).toFixed(2)
        );
        })

        // console.log('kal dis: ',kalamanFilterDistance);
        minDistance = Math.min.apply(null, kalamanFilterDistance);
        // console.log('min dis: ',minDistance);

        kalamanFilterDistance.forEach((item, index) => {
          if (item !== undefined) {
            item === minDistance ? setNearestDoor(index + 1) : null;
          }
        })

      }
      catch(err)
      {
        console.log('-----------------------------------------------------------------------')
        console.log(err);
        console.log('-----------------------------------------------------------------------')
      }
      
    })

    requestLocationPermission();//.then(() => console.log('permission end'));

    return (
      () => {
        Beacons
        .stopRangingBeaconsInRegion( 'iBeacon',
        '74278bda-b644-4520-8f0c-720eaf059935',)
        .then(() => console.log('Beacons ranging stopped succesfully'))
        .catch(error => console.log(`Beacons ranging not stopped, error: ${error}`));
        DeviceEventEmitter.removeAllListeners();
      }
    )

  }, []);


  Beacons.detectIBeacons();
  RangingBeacon();
  return (
    <>
      <SafeAreaView>
        <InfoWrapper>
          <InfoText>{nearestDoor}</InfoText>
          <TouchableOpacity onPress={()=>speakClosestDoor(nearestDoor)}>
            <InfoText>get info</InfoText>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>navigation.navigate(STRING.NAVIGATION.TEST_BLE_DATA)}>
            <InfoText>go test</InfoText>
          </TouchableOpacity>
        </InfoWrapper>
      </SafeAreaView>
    </>
  );
};

const SafeAreaView = styled.SafeAreaView`
  flex: 1;
  background-color: white;
`;

const InfoWrapper = styled.View`
  height: 100%;
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
