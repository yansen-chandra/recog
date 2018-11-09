import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ScanScreen from '../screens/ScanScreen';
import CameraScreen from '../screens/CameraScreen';
import FormScreen from '../screens/FormScreen';
import SignInScreen from '../screens/SignInScreen';

//
// const HomeStack = createStackNavigator({
//   Home: HomeScreen,
// });
//
// HomeStack.navigationOptions = {
//   tabBarLabel: 'Home',
//   tabBarIcon: ({ focused }) => (
//     <TabBarIcon
//       focused={focused}
//       name={
//         Platform.OS === 'ios'
//           ? `ios-information-circle${focused ? '' : '-outline'}`
//           : 'md-information-circle'
//       }
//     />
//   ),
// };
//
// const SettingsStack = createStackNavigator({
//   Settings: SettingsScreen,
// });
//
// SettingsStack.navigationOptions = {
//   tabBarLabel: 'Settings',
//   tabBarIcon: ({ focused }) => (
//     <TabBarIcon
//       focused={focused}
//       name={Platform.OS === 'ios' ? `ios-options${focused ? '' : '-outline'}` : 'md-options'}
//     />
//   ),
// };
//
// const ScanStack = createStackNavigator({
//   Scan: ScanScreen,
// });
//
// ScanStack.navigationOptions = {
//   tabBarLabel: 'Scan',
//   tabBarIcon: ({ focused }) => (
//     <TabBarIcon
//       focused={focused}
//       name={Platform.OS === 'ios' ? `ios-funnel{focused ? '' : '-outline'}` : 'md-funnel'}
//     />
//   ),
// };
//
// const CameraStack = createStackNavigator({
//   Camera: CameraScreen,
// });
//
// CameraStack.navigationOptions = {
//   tabBarLabel: 'Camera',
//   tabBarIcon: ({ focused }) => (
//     <TabBarIcon
//       focused={focused}
//       name={Platform.OS === 'ios' ? `ios-barcode${focused ? '' : '-outline'}` : 'md-barcode'}
//     />
//   ),
// };

const LinksStack = createStackNavigator({
  Links: LinksScreen,
});

LinksStack.navigationOptions = {
  tabBarLabel: 'Capture',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-barcode${focused ? '' : '-outline'}` : 'md-barcode'}
    />
  ),
};


const FormStack = createStackNavigator({
  Form: FormScreen,
});

FormStack.navigationOptions = {
  tabBarLabel: 'Form',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-checkmark${focused ? '' : '-outline'}` : 'md-checkmark'}
    />
  ),
};

const SignInStack = createStackNavigator({
  SignIn: SignInScreen,
});

SignInStack.navigationOptions = {
  tabBarLabel: 'Account',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-man${focused ? '' : '-outline'}`
          : 'md-man'
      }
    />
  ),
};


export default createBottomTabNavigator({
  LinksStack,
  FormStack,
  //CameraStack,
  //HomeStack,
  //SettingsStack,
  //ScanStack,
  SignInStack,
});
