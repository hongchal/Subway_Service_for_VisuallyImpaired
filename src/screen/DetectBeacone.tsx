import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, View, Text, PermissionsAndroid} from 'react-native';
import Beacons from 'react-native-beacons-manager';
import KalmanFilter from 'kalmanjs';
import styled from 'styled-components/native';

const DetectBeacone = () => {
  const MAX = 4;
  const MINORDEFAULT = 64000;
  const dummyDistance = 1000;
  let minDistance: number;
  const [nearestDoor, setNearestDoor] = useState<number>(0);
  useEffect(() => {}, [nearestDoor]);
  // const region = { uuid :'iBeacon', identifier : '74278bda-b644-4520-8f0c-720eaf059935'};

  useEffect(() => {
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
        console.log(Beacons)
        // use Kalman Filter for accuracy
        Beacons.map((beacon: any) => {
          console.log(beacon.minor, beacon.distance);
          let beaconIndex = beacon.minor - MINORDEFAULT;
          console.log(beaconIndex)
          kalamanFilterDistance[beaconIndex] = parseFloat(
          beaconList[beaconIndex].filter(beacon.distance).toFixed(2)

        );
        })

      console.log('kal dis: ',kalamanFilterDistance);
      minDistance = Math.min.apply(null, kalamanFilterDistance);
      console.log('min dis: ',minDistance);

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

    requestLocationPermission(); //.then(() => console.log('permission end'));

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
<<<<<<< HEAD:src/screen/DetectBeacon.tsx
=======
      // await Beacons.startRangingBeaconsInRegion('iBeacon');
      // await Beacons.startMonitoringForRegion({ identifier:'iBeacons', minor: 4460 ,major: 64001});
      //await Beacons.startRangingBeaconsInRegion();
      //console.log('Beacons ranging started successfully!');
>>>>>>> 1f6610342dfa4b74514b1ad4e5847294307d4b60:src/screen/DetectBeacone.tsx
    } catch (err) {
      console.log(`Beacons ranging not started, error: ${err}`);
    }
  };

<<<<<<< HEAD:src/screen/DetectBeacon.tsx
  
=======
  Beacons.detectIBeacons();
  RangingBeacon(); //.then(console.log('start ranging beacons'));
>>>>>>> 1f6610342dfa4b74514b1ad4e5847294307d4b60:src/screen/DetectBeacone.tsx

  Beacons.detectIBeacons();
  RangingBeacon();
  return (
    <>
      <SafeAreaView>
        <InfoWrapper>
          <InfoText>{nearestDoor}</InfoText>
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
