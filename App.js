import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as firebase from "firebase";

import BottomTabNavigator from './navigation/AppNavigator';
import useLinking from './navigation/useLinking';

const Stack = createStackNavigator();

var firebaseConfig = {
  apiKey: "AIzaSyDzhK8dGreG2rDqNkqVfGMW5BVPbX1Z8sc",
  authDomain: "wordpuzzle-f1ec0.firebaseapp.com",
  databaseURL: "https://wordpuzzle-f1ec0.firebaseio.com",
  projectId: "wordpuzzle-f1ec0",
  storageBucket: "wordpuzzle-f1ec0.appspot.com",
  messagingSenderId: "919529219505",
  appId: "1:919529219505:web:cc7dba6079dcb0b1"
};


export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);

  React.useLayoutEffect(() => {
    firebase.initializeApp(firebaseConfig);
  }, []);
  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          right: require("./assets/fonts/right.ttf")
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <View style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        <NavigationContainer ref={containerRef} initialState={initialNavigationState}>
          <Stack.Navigator>
            <Stack.Screen name="Root" component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
