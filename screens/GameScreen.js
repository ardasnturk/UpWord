import React, { Component } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  PanResponder,
  Animated,
  UIManager,
  LayoutAnimation,
  Dimensions,
  AsyncStorage,
  StatusBar,
  Image,
  Platform,
} from "react-native";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { AdMobBanner, AdMobRewarded } from "expo-ads-admob";
import { Audio } from "expo-av";
import * as firebase from "firebase";
import { Ionicons } from "@expo/vector-icons";
import Lang from "../Localization/Language";

const correct = new Audio.Sound();
const wrong = new Audio.Sound();
const levelUp = new Audio.Sound();

const { width, height } = Dimensions.get("screen");

let rewarded = "";
let bannerId = "";

if (Platform.OS === "ios") {
  rewarded = "ca-app-pub-6612319943575873/7806877337";
  bannerId = "ca-app-pub-6612319943575873/4812569406";
} else if (Platform.OS === "android") {
  bannerId = "ca-app-pub-6612319943575873/5835161011";
  rewarded = "ca-app-pub-6612319943575873/2674166276";
} else {
  //Test
  rewarded = "ca-app-pub-3940256099942544/5224354917";
  bannerId = "ca-app-pub-3940256099942544/6300978111";
}

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

class Draggable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDraggable: true,
      pan: new Animated.ValueXY(),
      opacity: new Animated.Value(1),
    };
  }

  componentWillMount() {
    this._val = { x: 0, y: 0 };
    this.state.pan.addListener((value) => (this._val = value));

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => true,
      onPanResponderGrant: (e, gesture) => {
        this.state.pan.setOffset({
          x: this._val.x,
          y: this._val.y,
        });
        this.state.pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.state.pan.y },
      ]),
      onPanResponderRelease: (e, gesture) => {
        if (this.isDropArea(gesture)) {
          Animated.timing(this.state.opacity, {
            toValue: 0,
            duration: 250,
          }).start(() => {
            this.setState({
              showDraggable: false,
            });
            this.props.userLetter(this.props.item);
          });
        } else {
          Animated.spring(this.state.pan, {
            toValue: { x: 0, y: 0 },
            friction: 2,
          }).start();
        }
      },
    });
  }

  default() {
    Animated.spring(this.state.pan, {
      toValue: { x: 0, y: 0 },
      friction: 2,
    }).start(() => {
      this.setState({ showDraggable: true, opacity: new Animated.Value(1) });
    });
  }

  isDropArea(gesture) {
    if (this.props.draggable) {
      return gesture.moveY < height / 2;
    } else {
      return false;
    }
  }

  render() {
    return (
      <View
        style={[
          this.props.style,
          {
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        {this.renderDraggable(this.props.item)}
      </View>
    );
  }

  renderDraggable(item) {
    const panStyle = {
      transform: this.state.pan.getTranslateTransform(),
    };
    if (this.state.showDraggable) {
      return (
        <View>
          <Animated.View
            {...this.panResponder.panHandlers}
            style={[
              panStyle,
              styles.circle,
              {
                opacity: this.state.opacity,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <LinearGradient
              colors={["#36D1DC", "#5B86E5"]}
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                borderRadius: 30,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  color: "#fff",
                  fontWeight: "bold",
                  fontFamily: "right",
                }}
              >
                {item}
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>
      );
    }
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //Words
      word: [],
      letters: [],
      userLetter: [],
      wordStateObj: {},
      bonusStateObj: {},
      bonusKnowWords: 0,
      localWords: {},
      letterString: "",
      howManyWord: null,
      level: 1,
      isItCorrect: "",
      finish: "",
      nextLevel: false,
      lang: "",
      back: false,
      draggable: true,
      //Hint
      hint: false,
      hintString: "",
      hintNumber: 0,
      showHint: false,
      activeHints: {},
      hintLine: true,
      //FirebaseConnect
      network: false,
      loading: false,
    };
    this.drags = [];
  }

  componentDidMount() {
    this.localStorage();
    this.listeners();
    this.loadSound();
    this.requestAd();
    this.setState({ lang: Lang.t("Lang") });

    AdMobRewarded.setAdUnitID(rewarded);
    AdMobRewarded.setTestDeviceID("EMULATOR");

    setTimeout(() => {
      if (!this.state.localWords) {
        this.setState({ network: true, loading: false });
      }
    }, 5000);
  }

  componentWillUnmount() {
    //AdMobRewarded.removeAllListeners();
    AdMobRewarded.removeEventListener("rewardedVideoDidRewardUser");
    AdMobRewarded.removeEventListener("rewardedVideoDidLoad");
    AdMobRewarded.removeEventListener("rewardedVideoDidFailToLoad");
    AdMobRewarded.removeEventListener("rewardedVideoDidClose");
  }

  async listeners() {
    AdMobRewarded.addEventListener("rewardedVideoDidRewardUser", () => {
      this.showHint();
      this.setState({ showHint: false }, () => {
        this.requestAd();
      });
    });
    AdMobRewarded.addEventListener("rewardedVideoDidLoad", () => {
      this.setState({ showHint: true });
    });
    AdMobRewarded.addEventListener("rewardedVideoDidFailToLoad", () => {
      this.setState({ showHint: false });
    });
    AdMobRewarded.addEventListener("rewardedVideoDidClose", () => {
      AdMobRewarded.requestAdAsync().catch((e) => console.log(e));
    });
  }

  async requestAd() {
    await AdMobRewarded.requestAdAsync().catch((e) => console.log(e));
  }

  async loadSound() {
    await correct.loadAsync(require("../assets/music/correct.wav"));
    await wrong.loadAsync(require("../assets/music/wrong.wav"));
    await levelUp.loadAsync(require("../assets/music/levelUp.wav"));
  }

  async localStorage() {
    AsyncStorage.getItem("localWords")
      .then((words) => {
        this.setState({ localWords: JSON.parse(words) });
        if (words) {
          AsyncStorage.getItem("level").then((level) => {
            if (level) {
              this.fetchWord(parseInt(level), false);
              this.localFetchWord(parseInt(level));
              this.setState({ level: parseInt(level) });
            } else {
              this.fetchWord(0, false);
              this.localFetchWord(0);
              this.setState({ level: 0 });
            }
          });
        } else {
          AsyncStorage.getItem("level").then((level) => {
            if (level) {
              this.fetchWord(parseInt(level), true);
              this.setState({ level: parseInt(level) });
            } else {
              this.fetchWord(0, true);
              this.setState({ level: 0 });
            }
          });
        }
      })
      .catch((err) => alert(err));

    AsyncStorage.getItem("hint")
      .then((hint) => {
        if (hint) {
          this.setState({ hintNumber: parseInt(hint) });
        } else {
          this.setState({ hintNumber: 5 });
        }
      })
      .catch((err) => console.log(err));
  }

  localFetchWord(x) {
    if (this.state.localWords[this.state.lang][x]) {
      this.setState({
        word: this.state.localWords[this.state.lang][x].Word,
        howManyWord: this.state.localWords[this.state.lang][x].Word.length,
      });

      for (
        let i = 0;
        i < this.state.localWords[this.state.lang][x].Word.length;
        i++
      ) {
        const wordObj = this.state.localWords[this.state.lang][x].Word[i];
        const bonusObj = this.state.localWords[this.state.lang][x].Bonus[i];
        this.state.bonusStateObj[bonusObj] = bonusObj;
        this.state.wordStateObj[wordObj] = wordObj;
      }
      this.setState({
        wordStateObj: this.state.wordStateObj,
        bonusStateObj: this.state.bonusStateObj,
      });

      let shuffle = Object.values(
        this.state.localWords[this.state.lang][x].Word[0]
      );
      for (let i = shuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffle[i], shuffle[j]] = [shuffle[j], shuffle[i]];
      }
      this.setState({ letters: shuffle, loading: true });
    } else {
      this.setState({ finish: `${Lang.t("Finish")}`, loading: true });
    }
  }

  fetchWord(x, first) {
    firebase
      .database()
      .ref(`Words`)
      .once("value", (snap) => {
        if (snap.val()[this.state.lang][x]) {
          if (this.state.localWords) {
            if (
              Object.values(snap.val()[this.state.lang]).length !==
              Object.values(this.state.localWords[this.state.lang]).length
            ) {
              this.setState({
                localWords: snap.val(),
              });
              this.localFetchWord(x);
            }
          } else {
            this.setState({
              localWords: snap.val(),
            });
            this.localFetchWord(x);
          }
        } else {
          this.setState({ finish: `${Lang.t("Finish")}` });
        }
      })
      .then(() => {
        this.setState({ loading: true, network: false });
        this.setLocal();
      })
      .catch((err) => {
        alert(err);
        if (first) {
          this.setState({ network: true });
        }
      });
  }

  userLetter = async (letter) => {
    this.state.userLetter.push(letter.toString());
    this.setState({
      userLetter: this.state.userLetter,
      letterString: this.state.letterString + letter,
    });

    if (this.state.wordStateObj[this.state.letterString]) {
      this.initializeGame();
      correct.playAsync();

      delete this.state.wordStateObj[this.state.letterString];
      delete this.state.activeHints[this.state.letterString];

      this.setState({
        isItCorrect: "correct",
        letterString: "",
        draggable: false,
      });

      this.state.userLetter.splice(0, this.state.userLetter.length);

      setTimeout(() => {
        correct.stopAsync();
        this.setState({
          howManyWord: this.state.howManyWord - 1,
          isItCorrect: "",
          draggable: true,
        });
        if (this.state.howManyWord <= 0) {
          this.setState({ nextLevel: true, bonusKnowWords: 0 });
          this.nextLevel();
        }
      }, 1500);
    } else if (this.state.bonusStateObj[this.state.letterString]) {
      this.initializeGame();
      correct.playAsync();

      delete this.state.bonusStateObj[this.state.letterString];

      this.setState({
        isItCorrect: "bonus",
        letterString: "",
        draggable: false,
        bonusKnowWords: this.state.bonusKnowWords + 1,
      });

      this.state.userLetter.splice(0, this.state.userLetter.length);

      setTimeout(() => {
        correct.stopAsync();
        this.setState({
          isItCorrect: "",
          draggable: true,
        });
      }, 1500);
    } else {
      if (this.state.letters.length === this.state.userLetter.length) {
        this.initializeGame();
        wrong.playAsync();
        this.setState({
          isItCorrect: "wrong",
          letterString: "",
          draggable: false,
        });
        this.state.userLetter.splice(0, this.state.userLetter.length);

        setTimeout(() => {
          wrong.stopAsync();
          this.setState({
            isItCorrect: "",
            draggable: true,
          });
        }, 1500);
      }
    }
  };

  initializeGame() {
    for (let i = 0; i < this.drags.length; i++) {
      const drag = this.drags[i];
      drag.default();
      drag.default();
    }
  }

  async nextLevel() {
    levelUp.playAsync();
    setTimeout(() => {
      this.setState({ level: this.state.level + 1 });
      if (this.state.level % 25 === 0) {
        this.setState({ hintNumber: this.state.hintNumber + 5 }, () =>
          this.hintSetLocal()
        );
      }
      AsyncStorage.setItem("level", this.state.level.toString());
      this.localFetchWord(this.state.level);
    }, 500);
    setTimeout(() => {
      levelUp.stopAsync();
      this.setState({ nextLevel: false });
    }, 1000);
  }

  async setLocal() {
    AsyncStorage.setItem("localWords", JSON.stringify(this.state.localWords));
  }

  async hintSetLocal() {
    AsyncStorage.setItem("hint", this.state.hintNumber.toString());
    if (this.state.hintNumber === 0) {
      this.setState({ showHint: false }, () => this.requestAd());
    }
  }

  async hint() {
    if (this.state.hintNumber <= 0) {
      await AdMobRewarded.showAdAsync();
    } else {
      this.setState(
        { hintNumber: this.state.hintNumber - 1, hint: true },
        () => {
          this.showHint(), this.hintSetLocal();
        }
      );
    }
  }

  showHint() {
    const { wordStateObj, activeHints } = this.state;
    const wordArray = Object.values(wordStateObj);
    let selectedWord = wordArray[Math.floor(Math.random() * wordArray.length)];

    if (activeHints[selectedWord]) {
      if (
        selectedWord.length !== activeHints[selectedWord].selectedIndexes.length
      ) {
        const word = activeHints[selectedWord];
        let keepGoing = true;
        while (keepGoing) {
          const randIndex = Math.floor(Math.random() * word.word.length);
          if (!word.selectedIndexes.includes(randIndex)) {
            keepGoing = false;
            word.selectedIndexes.push(randIndex);
            if (!keepGoing) this.setState({ activeHints, hint: true });
          }
        }
      } else {
        delete wordStateObj[selectedWord];
        delete activeHints[selectedWord];
        this.setState(
          {
            wordStateObj,
            activeHints,
            howManyWord: this.state.howManyWord - 1,
          },
          () => {
            if (this.state.howManyWord <= 0) {
              this.setState({ nextLevel: true });
              this.nextLevel();
            } else {
              this.hint();
            }
          }
        );
      }
    } else {
      activeHints[selectedWord] = {
        selectedIndexes: [Math.floor(Math.random() * selectedWord.length)],
        word: selectedWord,
      };
      this.setState({ activeHints, hint: true });
    }
  }

  reset() {
    this.initializeGame();
    this.state.userLetter.splice(0, this.state.userLetter.length);
    this.setState({
      isItCorrect: "",
      letterString: "",
      draggable: true,
    });
  }

  render() {
    return this.state.network ? (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
        <Text
          style={{
            textAlign: "center",
            color: "red",
            fontFamily: "right",
            fontSize: 40,
            width: "80%",
          }}
        >
          {Lang.t("Network")}
        </Text>
      </View>
    ) : (
      <View style={styles.mainContainer}>
        {this.state.loading && (
          <LinearGradient
            colors={["#03738C", "#024059"]}
            style={[
              styles.dropZone,
              {
                height:
                  this.state.loading && !this.state.back
                    ? height / 2
                    : this.state.back
                    ? height
                    : -10,
                paddingTop: this.state.loading ? Constants.statusBarHeight : 0,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                this.setState({ back: true, hintLine: false });
                setTimeout(() => {
                  this.props.navigation.pop();
                }, 500);
              }}
              style={{
                position: "absolute",
                zIndex: 2,
                left: 5,
                top: Constants.statusBarHeight + 20,
                width: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="ios-arrow-back" size={40} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                position: "absolute",
                zIndex: 2,
                right: 5,
                top: Constants.statusBarHeight + 20,
                width: 30,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => this.reset()}
            >
              <Ionicons name="ios-refresh" size={40} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.text, { textAlign: "center", width: "70%" }]}>
              {Lang.t("Drag")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {this.state.userLetter.map((item, ind) => (
                <LinearGradient
                  colors={
                    this.state.isItCorrect === ""
                      ? ["#36D1DC", "#5B86E5"]
                      : this.state.isItCorrect === "correct"
                      ? ["#38EF7D", "#11998E"]
                      : this.state.isItCorrect === "bonus"
                      ? ["#F2B070", "#F27405"]
                      : ["#E53935", "#E35D5B"]
                  }
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    margin: 5,
                  }}
                  key={ind}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      color: "white",
                      fontFamily: "right",
                      fontWeight: "bold",
                    }}
                  >
                    {item}
                  </Text>
                </LinearGradient>
              ))}
            </View>
            <View
              style={{
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                position: "absolute",
                bottom: 20,
              }}
            >
              <AdMobBanner
                bannerSize="banner"
                adUnitID={bannerId}
                testDeviceID="EMULATOR"
                onDidFailToReceiveAdWithError={this.bannerError}
              />
            </View>
          </LinearGradient>
        )}

        {this.state.loading && (
          <View>
            <View style={styles.ballContainer}>
              {this.state.bonusKnowWords > 0 && (
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 20,
                    fontFamily: "right",
                    fontWeight: "bold",
                  }}
                >
                  {Lang.t("BonusWords", {
                    bonusNumber: this.state.bonusKnowWords,
                  })}
                </Text>
              )}
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 20,
                  fontFamily: "right",
                  fontWeight: "bold",
                }}
              >
                {Lang.t("Explanation", { wordNumber: this.state.howManyWord })}
              </Text>
            </View>
            <View style={styles.row}>
              {this.state.letters.map((item, ind) => (
                <Draggable
                  ref={(ref) => (this.drags[ind] = ref)}
                  draggable={this.state.draggable}
                  key={ind}
                  item={item}
                  style={{ margin: 5 }}
                  userLetter={this.userLetter}
                />
              ))}
            </View>
          </View>
        )}
        {this.nextLevelScreen()}
        {this.finishScreen()}
        {this.hintScreen()}
        {this.state.hintLine &&
          this.state.loading &&
          (this.state.showHint || this.state.hintNumber > 0 ? (
            <View
              style={{
                position: "absolute",
                bottom: 20,
                width,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
              }}
            >
              {this.state.hintNumber > 0 && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 40,
                    left:
                      Object.values(this.state.activeHints).length > 0
                        ? width / 2 - 25
                        : width / 2 + 15,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: "red",
                    zIndex: 2,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 20,
                    }}
                  >
                    {this.state.hintNumber}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => this.hint()}
                style={{
                  width: 60,
                  height: 60,
                  marginRight: 5,
                }}
              >
                <LinearGradient
                  colors={["#F83600", "#F9D423"]}
                  style={{
                    width: "100%",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                  }}
                >
                  <Ionicons name="ios-bulb" size={40} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
              {Object.values(this.state.activeHints).length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    width: 60,
                    height: 60,
                    marginLeft: 5,
                  }}
                  onPress={() => this.setState({ hint: !this.state.hint })}
                >
                  <LinearGradient
                    colors={["#8A2387", "#E94057"]}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons name="ios-pulse" size={40} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            Object.values(this.state.activeHints).length > 0 && (
              <View
                style={{
                  position: "absolute",
                  bottom: 20,
                  width,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    width: 60,
                    height: 60,
                    marginLeft: 5,
                  }}
                  onPress={() => this.setState({ hint: !this.state.hint })}
                >
                  <LinearGradient
                    colors={["#8A2387", "#E94057"]}
                    style={{
                      width: "100%",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 10,
                    }}
                  >
                    <Ionicons name="ios-pulse" size={40} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )
          ))}
        <StatusBar barStyle="light-content" />
      </View>
    );
  }

  nextLevelScreen() {
    if (this.state.nextLevel) {
      return (
        <LinearGradient
          colors={["#38EF7D", "#11998E"]}
          style={{
            position: "absolute",
            bottom: 40,
            right: this.state.nextLevel ? 30 : -width,
            top: Constants.statusBarHeight + 40,
            width: width - 60,
            borderRadius: 25,
            zIndex: 5,
            elevation: 3,
            shadowColor: "#000",
            shadowRadius: 3,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 2 },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/images/emoji.png")}
            style={{ width: 200, height: 200 }}
          />
          <Text
            style={{
              fontFamily: "right",
              fontWeight: "bold",
              fontSize: 100,
              textAlign: "center",
              color: "#fff",
            }}
          >
            {this.state.level + 1}
          </Text>
        </LinearGradient>
      );
    } else {
      return <View style={{ position: "absolute", right: -width }} />;
    }
  }

  finishScreen() {
    if (this.state.finish !== "") {
      return (
        <LinearGradient
          colors={["#E64847", "#B11F1F"]}
          style={{
            position: "absolute",
            bottom: 40,
            left: this.state.finish !== "" ? 30 : -width,
            top: Constants.statusBarHeight + 40,
            width: width - 60,
            borderRadius: 25,
            zIndex: 5,
            elevation: 3,
            shadowColor: "#000",
            shadowRadius: 3,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 2 },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../assets/images/sadEmoji.png")}
            style={{ width: 200, height: 200 }}
          />
          <Text
            style={{
              fontFamily: "right",
              fontWeight: "bold",
              fontSize: 30,
              textAlign: "center",
              color: "#fff",
            }}
          >
            {this.state.finish}
          </Text>
        </LinearGradient>
      );
    } else {
      return <View style={{ position: "absolute", left: -width }} />;
    }
  }

  hintScreen() {
    if (this.state.hint) {
      return (
        <LinearGradient
          start={[0.1, 0.2]}
          colors={["#F83600", "#F9D423"]}
          style={{
            position: "absolute",
            bottom: this.state.hint ? 40 : -height,
            left: 30,
            height: height - (Constants.statusBarHeight + 70),
            width: width - 60,
            borderRadius: 25,
            zIndex: 5,
            elevation: 3,
            shadowColor: "#000",
            shadowRadius: 3,
            shadowOpacity: 0.5,
            shadowOffset: { width: 0, height: 2 },
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => this.setState({ hint: false })}
            style={{
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              right: 10,
              top: 10,
              width: 40,
            }}
          >
            <Ionicons name="ios-close" size={50} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require("../assets/images/bulb.png")}
            style={{ width: 150, height: 150 }}
          />
          {this.renderHints()}
        </LinearGradient>
      );
    } else {
      return <View style={{ position: "absolute", bottom: -height }} />;
    }
  }

  renderHints = () =>
    Object.values(this.state.activeHints).map((wordElement, i) => (
      <View style={{ flexDirection: "row" }} key={i}>
        {wordElement.word.split("").map((wordLetter, index) => (
          <Text
            key={index}
            style={{
              marginTop: 50,
              fontFamily: "right",
              fontWeight: "bold",
              fontSize: 35,
              textAlign: "center",
              color: "#fff",
            }}
          >
            {wordElement.selectedIndexes.includes(index) ? wordLetter : "_ "}
          </Text>
        ))}
      </View>
    ));

  componentWillUpdate() {
    UIManager.setLayoutAnimationEnabledExperimental &&
      UIManager.setLayoutAnimationEnabledExperimental(true);
    LayoutAnimation.configureNext(CustomLayoutSpring);
  }
}

let CIRCLE_RADIUS = 30;
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ballContainer: {
    height: 100,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    backgroundColor: "skyblue",
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  row: {
    width,
    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dropZone: {
    width,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: "center",
  },
  text: {
    fontFamily: "right",
    marginTop: 15,
    marginLeft: 5,
    marginRight: 5,
    textAlign: "center",
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },
});
