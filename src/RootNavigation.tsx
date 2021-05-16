import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {InputStartPoint} from './screen/InputStartPoint';
import {ShowRoute} from './screen/ShowRoute';
import DetectBeacone from './screen/DetectBeacone';
import {STRING} from './assets/string';
import ShowSubwayLocation from "./screen/ShowSubwayLocation";
import TestRssi from './screen/TestRssi';

export const RootNavigation = () => {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={' '}
          options={{
            headerStyle: {height: 0},
          }}>
          {() => (
            <Tab.Navigator>
              <Tab.Screen
                name={STRING.NAVIGATION.INPUT_START}
                component={InputStartPoint}
                options={{}}
              />
                <Tab.Screen name={STRING.NAVIGATION.SUBWAY_LOCATION} component={ShowSubwayLocation} />
              <Tab.Screen
                name={STRING.NAVIGATION.DETECT_BEACONE}
                component={DetectBeacone}
                options={{}}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
        <Stack.Screen
          name={STRING.NAVIGATION.SHOW_ROUTE}
          component={ShowRoute}
          options={{
            header: () => null,
          }}
        />
        <Stack.Screen
          name={'TestRssi'}
          component={TestRssi}
          options={{
            header: () => null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
