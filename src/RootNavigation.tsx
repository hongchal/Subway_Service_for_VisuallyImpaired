import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {InputStartPoint} from './screen/InputStartPoint';
import {ShowRoute} from './screen/ShowRoute';
import DetectBeacon from './screen/DetectBeacon';
import {STRING} from './assets/string';

export const RootNavigation = () => {
  const Stack = createStackNavigator();
  const Tab = createBottomTabNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={STRING.NAVIGATION.SHOW_ROUTE}
          component={ShowRoute}
          options={{
            header: () => null,
          }}
        />
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
              <Tab.Screen
                name={STRING.NAVIGATION.DETECT_BEACONE}
                component={DetectBeacon}
                options={{}}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
