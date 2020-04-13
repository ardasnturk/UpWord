import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  UIManager,
  Image,
  LayoutAnimation,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  AsyncStorage,
} from "react-native";
import * as Localization from "expo-localization";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import Language from "../Localization/Language";
import i18n from "../Localization/Language";

const { width, height } = Dimensions.get("screen");

var CustomLayoutSpring = {
  duration: 500,
  create: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
    springDamping: 0.7,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.7,
  },
};

export default class FirstScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundAnimation: false,
      playButtonAnimation: false,
      settings: false,
      locale: "",
      flags: [
        {
          text: "France",
          image: require("../assets/flag/france.png"),
          locale: "fr",
        },
        {
          text: "Germany",
          image: require("../assets/flag/germany.png"),
          locale: "de",
        },
        {
          text: "Italy",
          image: require("../assets/flag/italy.png"),
          locale: "it",
        },
        {
          text: "Spain",
          image: require("../assets/flag/spain.png"),
          locale: "es",
        },
        {
          text: "Turkey",
          image: require("../assets/flag/turkey.png"),
          locale: "tr",
        },
        {
          text: "UnitedKingdom",
          image: require("../assets/flag/united-kingdom.png"),
          locale: "en",
        },
      ],
    };
  }

  componentDidMount() {
    this.getLocalization();
    setTimeout(() => {
      this.setState({ playButtonAnimation: true });
    }, 1000);
  }

  async setLocalization(item) {
    i18n.locale = item;
    this.setState({ locale: item });
    AsyncStorage.setItem("localization", item);
  }

  async getLocalization() {
    AsyncStorage.getItem("localization").then((value) => {
      if (value) {
        i18n.locale = value;
      }
    });
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        <LinearGradient
          colors={["#03738C", "#024059"]}
          style={[
            styles.linearStyle,
            {
              height: this.state.backgroundAnimation ? 0 : height,
              width,
              paddingTop: Constants.statusBarHeight,
            },
          ]}
        >
          {this.state.playButtonAnimation ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                this.setState({ playButtonAnimation: false });
                setTimeout(() => {
                  this.setState({ backgroundAnimation: true });
                }, 500);
                setTimeout(() => {
                  this.props.navigation.navigate("GameScreen");
                }, 1200);
                setTimeout(() => {
                  this.setState({
                    backgroundAnimation: false,
                    playButtonAnimation: true,
                  });
                }, 1300);
              }}
              style={[
                styles.playButtonStyle,
                {
                  width: this.state.playButtonAnimation ? 150 : 0,
                  height: this.state.playButtonAnimation ? 150 : 0,
                },
              ]}
            >
              <LinearGradient
                start={[0.1, 0.2]}
                colors={["#36D1DC", "#5B86E5"]}
                style={[
                  styles.playButtonStyle,
                  { width: "100%", height: "100%" },
                ]}
              >
                <Ionicons
                  name="ios-play"
                  size={this.state.playButtonAnimation ? 75 : 0}
                  color="#fff"
                />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View />
          )}
          {this.state.playButtonAnimation ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                this.setState({ settings: true });
              }}
              style={[
                styles.settingsButtonStyle,
                {
                  width: this.state.playButtonAnimation ? 150 : 0,
                  height: this.state.playButtonAnimation ? 30 : 0,
                },
              ]}
            >
              <LinearGradient
                colors={["#36D1DC", "#5B86E5"]}
                style={[
                  styles.settingsButtonStyle,
                  { width: "100%", height: "100%" },
                ]}
              >
                <Text
                  style={{ fontFamily: "right", color: "#fff", fontSize: 20 }}
                >
                  {Language.t("Settings")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </LinearGradient>
        {this.settingsScreen()}
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  settingsScreen() {
    if (this.state.settings) {
      return (
        <View
          style={{
            flex: 1,
            position: "absolute",
            width,
            height,
            justifyContent: "center",
          }}
        >
          <View style={styles.settingsContainer}>
            <View
              style={{
                width: "100%",
                top: 0,
                backgroundColor: "grey",
                position: "absolute",
                borderTopRightRadius: 25,
                borderTopLeftRadius: 25,
                paddingBottom: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 20,
                  fontFamily: "right",
                  textAlign: "center",
                  width: "70%",
                  marginTop: 10,
                }}
              >
                {Language.t("SettingsLanguage")}
              </Text>
              <TouchableOpacity
                onPress={() => this.setState({ settings: false })}
                style={{
                  position: "absolute",
                  right: 5,
                  top: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  width: 30,
                }}
              >
                <Ionicons name="ios-close" size={35} color="#fff" />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {this.state.flags.map((item, ind) => (
                <TouchableOpacity
                  onPress={() => {
                    this.setLocalization(item.locale);
                  }}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 10,
                    width: "25%",
                    height: "45%",
                  }}
                  key={ind}
                >
                  <Image source={item.image} />
                  <Text
                    style={{
                      fontSize: 12,
                      marginTop: 5,
                      fontFamily: "right",
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    {Language.t(item.text)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
    } else {
      return null;
    }
  }

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.configureNext(CustomLayoutSpring);
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  linearStyle: {
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonStyle: {
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  settingsButtonStyle: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
  settingsContainer: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "#fff",
    borderRadius: 25,
    width: "80%",
    paddingVertical: 70,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
});
