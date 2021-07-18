import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {InputStartPoint} from './screen/InputStartPoint';
import {ShowRoute} from './screen/ShowRoute';
import DetectBeacone from './screen/DetectBeacone';
import {STRING} from './assets/string';
import TestRssi from './screen/TestRssi';
import ShowSubwayLocationUp from './screen/ShowSubwayLocationUp';
import ShowSubwayLocationDown from './screen/ShowSubwayLocationDown';
import ShowSubwayLocation from './screen/ShowSubwayLocation';
import Home from './screen/Home';
import DetectBeaconWhenQuit from './screen/DetectBeaconWhenQuit';

const ShowSubwayNavigation = () => {
  const ShowSubwayStack = createStackNavigator();
  return (
    <ShowSubwayStack.Navigator>
      <ShowSubwayStack.Screen
        name={STRING.NAVIGATION.SUBWAY_LOCATION_SCREEN}
        component={ShowSubwayLocation}
      />
      <ShowSubwayStack.Screen
        name={STRING.NAVIGATION.SUBWAY_LOCATION_UP}
        component={ShowSubwayLocationUp}
      />
      <ShowSubwayStack.Screen
        name={STRING.NAVIGATION.SUBWAY_LOCATION_DOWN}
        component={ShowSubwayLocationDown}
      />
    </ShowSubwayStack.Navigator>
  );
};

export const RootNavigation = () => {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={STRING.NAVIGATION.HOME} component={Home} />
        <Stack.Screen
          name={STRING.NAVIGATION.INPUT_START}
          component={InputStartPoint}
          options={{
            header: () => null,
          }}
        />

        <Stack.Screen
          name={STRING.NAVIGATION.SUBWAY_LOCATION}
          component={ShowSubwayNavigation}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name={STRING.NAVIGATION.SHOW_ROUTE}
          component={ShowRoute}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name={STRING.NAVIGATION.DETECT_BEACON}
          component={DetectBeacone}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name={STRING.NAVIGATION.DETECT_BEACON_WHEN_QUIT}
          component={DetectBeaconWhenQuit}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name={STRING.NAVIGATION.TEST_BLE_DATA}
          component={TestRssi}
          options={{
            header: () => null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
