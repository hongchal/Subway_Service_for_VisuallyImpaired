import React, {useEffect, useState} from 'react';
import {DeviceEventEmitter, View, Text, PermissionsAndroid} from 'react-native';
import Beacons from 'react-native-beacons-manager';
import KalmanFilter from 'kalmanjs';
import styled from 'styled-components/native';

const DetectBeacon = () => {
  const MAX = 4;
  const MINORDEFAULT = 64000;
  const dummyDistance = 1000;
  let minDistance;
  // let nearestDoor = 5;
  const [nearestDoor, setNearestDoor] = useState(null);
  useEffect(() => {}, [nearestDoor]);

  useEffect(() => {
    let kalamanFilterDistance = new Array(MAX);
    let beaconList = new Array(MAX);
    for (let i = 0; i < MAX; i++) {
      beaconList[i] = new KalmanFilter();
    }
    kalamanFilterDistance.fill(dummyDistance);

    // Print a log of the detected iBeacons (1 per second)
    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      const Beacons = data.beacons;

      //use Kalman Filter for accuracy
      Beacons.map((beacon, index) => {
        console.log(beacon.minor, beacon.distance);
        let beaconIndex = beacon.minor - MINORDEFAULT;
        kalamanFilterDistance[beaconIndex] = parseFloat(
          beaconList[beaconIndex].filter(beacon.distance).toFixed(2),
        );
      });

      console.log(kalamanFilterDistance);
      minDistance = Math.min.apply(null, kalamanFilterDistance);
      console.log(minDistance);

      kalamanFilterDistance.forEach((item, index) => {
        if (item !== undefined) {
          // item === minDistance ? (nearestDoor = index + 1) : null;
          item === minDistance ? setNearestDoor(index + 1) : null;
        }
      });
    });

    requestLocationPermission().then(() => console.log('permission end'));

    return () => {
      DeviceEventEmitter.removeListener('beaconsDidRange');
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "let's find beacons",
          message: 'if you want start this project choose ok',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
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
      // await Beacons.startRangingBeaconsInRegion('iBeacon');
      // await Beacons.startMonitoringForRegion({ identifier:'iBeacons', minor: 4460 ,major: 64001});
      //await Beacons.startRangingBeaconsInRegion();
      console.log('Beacons ranging started successfully!');
    } catch (err) {
      console.log(`Beacons ranging not started, error: ${err}`);
    }
  };

  Beacons.detectIBeacons();
  RangingBeacon().then(console.log('start ranging beacons'));

  return (
    <>
      <SafeAreaView>
        <InfoWrapper>
          <InfoText>1-{nearestDoor}</InfoText>
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

export default DetectBeacon;
