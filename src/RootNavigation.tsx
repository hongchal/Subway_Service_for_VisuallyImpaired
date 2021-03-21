import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {InputStartPoint} from './screen/InputStartPoint';
import {ShowRoute} from './screen/ShowRoute';
import DetectBeacon from './screen/DetectBeacon';
import {STRING} from './assets/string';

export const RootNavigation = () => {
  const Stack = createStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={STRING.NAVIGATION.INPUT_START}
          component={InputStartPoint}
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
          name={STRING.NAVIGATION.DETECT_BEACONE}
          component={DetectBeacon}
          options={{
            header: () => null,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
