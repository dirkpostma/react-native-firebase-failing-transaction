# react-native-firebase-failing-transaction
React Native project where transaction fails

## Install

```bash
git clone git@github.com:dirkpostma/react-native-firebase-failing-transaction.git
cd react-native-firebase-failing-transaction
yarn
cd ios; pod install; cd ..
yarn run detox build -c ios.sim.debug
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app
yarn run detox test -c ios.sim.debug
```

<!---
Hello there you awesome person;
Please note that the issue list of this repo is exclusively for bug reports;

1) For feature requests please visit our [Feature Request Board](https://boards.invertase.io/react-native-firebase).
2) For questions and support please use our Discord chat: https://discord.gg/C9aK28N or Stack Overflow: https://stackoverflow.com/questions/tagged/react-native-firebase
3) If this is a setup issue then please make sure you've correctly followed the setup guides, most setup issues such as 'duplicate dex files', 'default app has not been initialized' etc are all down to an incorrect setup as the guides haven't been correctly followed.
-->

<!-- NOTE: You can change any of the `[ ]` to `[x]` to mark an option(s) as selected -->

<!-- PLEASE DO NOT REMOVE ANY SECTIONS FROM THIS ISSUE TEMPLATE   -->
<!--   Leave them as they are even if they're irrelevant to your issue -->

## Issue

<!-- Please describe your issue here --^ and provide as much detail as you can. -->
<!-- Include code snippets that show your usages of the library in the context of your project. -->
<!-- Snippets that also show how and where the library is imported in JS are useful to debug issues relating to importing or methods not found issues -->
🔥

A write in first attempt of execution of updateFunction of runTransaction
is not rolled back when a second attempt fails. This happens when two 
transactions are initiated very short after eachother. Because of this,
the whole idea of transactions doesn't work.

I have created an example React Native project to demonstrate the problem:
https://github.com/dirkpostma/react-native-firebase-failing-transaction

Example code: 

```
const createMove = async (uid, matchId, turn, delay = 0) => {
  console.log('createMove', {uid, matchId, turn, delay});
  log(`createMove ${uid} turn: ${turn}`);
  const matchRef = db.collection('matches').doc(matchId);

  return db.runTransaction(async transaction => {
    log(`BEGIN transaction ${uid} turn: ${turn}`);
    // READ
    log(`READ BEGIN ${uid}`);
    const match = await transaction.get(matchRef);
    const matchData = match.data();
    log(`READ DONE ${uid} - turn: ${matchData.turn}`);

    // CHECK & PROCESS
    if (matchData.turn !== turn) {
      const message = `Sorry ${uid}! Another player was faster!`;
      log(`ABORT transaction ${uid} turn: ${turn}`);
      throw new Error(message);
    }
    const newTurn = matchData.turn || 0 + 1;
    const newScore = matchData[`score_${uid}`] || 0 + 1;

    // WRITE
    const updateObject = {
      turn: newTurn,
    };
    const scoreField = `score_${uid}`;
    updateObject[scoreField] = newScore;
    console.log('WRITE', {uid, updateObject});
    log(
      `WRITE ${uid} - turn: ${updateObject.turn} ${scoreField}: ${
        updateObject[scoreField]
      }`,
    );

    await asyncWait(delay);

    // THIS UPDATE SHOULD BE ROLLED BACK
    // when the updateFunction is aborted second attempt
    await transaction.update(matchRef, updateObject);
    log(`END transaction ${uid}`);
  });
};
```

If I run `createMove` in parrelel, this results in: 

Result:
```
01. 16:14:32:182 createMove user_1 turn: 0
02. 16:14:32:184 createMove user_2 turn: 0
03. 16:14:32:188 BEGIN transaction user_1 turn: 0
04. 16:14:32:188 READ BEGIN user_1
05. 16:14:32:189 BEGIN transaction user_2 turn: 0
06. 16:14:32:189 READ BEGIN user_2
07. 16:14:32:266 READ DONE user_1 - turn: 0
08. 16:14:32:267 WRITE user_1 - turn: 1 score_user_1: 1
09. 16:14:32:370 END transaction user_1
10. 16:14:32:404 READ DONE user_2 - turn: 0
11. 16:14:32:404 WRITE user_2 - turn: 1 score_user_2: 1
12. 16:14:32:437 END transaction user_2
13. 16:14:33:106 BEGIN transaction user_2 turn: 0
14. 16:14:33:106 READ BEGIN user_2
15. 16:14:33:237 READ DONE user_2 - turn: 1
16. 16:14:33:237 ABORT transaction user_2 turn: 0
17. 16:14:33:928 RESULT {"turn":1,"score_user_2":1,"score_user_1":1}
```

At line 11 a write is performed.
However, meanwhile, the read data of 10. has changed
Therefore, the updateFunctin is run again (started in line 13).
This time, the transaction fails, exection is thrown
At that moment, i expect the write (line 11 to be rolled back.
However, both scores are incremented by 1, so write is not rolled back.

---

## Project Files

<!-- Provide the contents of key project files which will help to debug -->
<!--     For Example: -->
<!--        - iOS: `Podfile` contents. -->
<!--        - Android: `android/build.gradle` contents. -->
<!--        - Android: `android/app/build.gradle` contents. -->
<!--        - Android: `AndroidManifest.xml` contents. -->

<!-- ADD THE CONTENTS OF THE FILES IN THE PROVIDED CODE BLOCKS BELOW -->

See github example project:

https://github.com/dirkpostma/react-native-firebase-failing-transaction

### iOS

<details><summary>Click To Expand</summary>
<p>

#### `ios/Podfile`:

- [ ] I'm not using Pods
- [x] I'm using Pods and my Podfile looks like:

```ruby
platform :ios, '9.0'
require_relative '../node_modules/@react-native-community/cli-platform-ios/native_modules'

target 'FireTransaction' do
  # Pods for FireTransaction
  pod 'FBLazyVector', :path => "../node_modules/react-native/Libraries/FBLazyVector"
  pod 'FBReactNativeSpec', :path => "../node_modules/react-native/Libraries/FBReactNativeSpec"
  pod 'RCTRequired', :path => "../node_modules/react-native/Libraries/RCTRequired"
  pod 'RCTTypeSafety', :path => "../node_modules/react-native/Libraries/TypeSafety"
  pod 'React', :path => '../node_modules/react-native/'
  pod 'React-Core', :path => '../node_modules/react-native/'
  pod 'React-CoreModules', :path => '../node_modules/react-native/React/CoreModules'
  pod 'React-Core/DevSupport', :path => '../node_modules/react-native/'
  pod 'React-RCTActionSheet', :path => '../node_modules/react-native/Libraries/ActionSheetIOS'
  pod 'React-RCTAnimation', :path => '../node_modules/react-native/Libraries/NativeAnimation'
  pod 'React-RCTBlob', :path => '../node_modules/react-native/Libraries/Blob'
  pod 'React-RCTImage', :path => '../node_modules/react-native/Libraries/Image'
  pod 'React-RCTLinking', :path => '../node_modules/react-native/Libraries/LinkingIOS'
  pod 'React-RCTNetwork', :path => '../node_modules/react-native/Libraries/Network'
  pod 'React-RCTSettings', :path => '../node_modules/react-native/Libraries/Settings'
  pod 'React-RCTText', :path => '../node_modules/react-native/Libraries/Text'
  pod 'React-RCTVibration', :path => '../node_modules/react-native/Libraries/Vibration'
  pod 'React-Core/RCTWebSocket', :path => '../node_modules/react-native/'

  pod 'React-cxxreact', :path => '../node_modules/react-native/ReactCommon/cxxreact'
  pod 'React-jsi', :path => '../node_modules/react-native/ReactCommon/jsi'
  pod 'React-jsiexecutor', :path => '../node_modules/react-native/ReactCommon/jsiexecutor'
  pod 'React-jsinspector', :path => '../node_modules/react-native/ReactCommon/jsinspector'
  pod 'ReactCommon/jscallinvoker', :path => "../node_modules/react-native/ReactCommon"
  pod 'ReactCommon/turbomodule/core', :path => "../node_modules/react-native/ReactCommon"
  pod 'Yoga', :path => '../node_modules/react-native/ReactCommon/yoga'

  pod 'DoubleConversion', :podspec => '../node_modules/react-native/third-party-podspecs/DoubleConversion.podspec'
  pod 'glog', :podspec => '../node_modules/react-native/third-party-podspecs/glog.podspec'
  pod 'Folly', :podspec => '../node_modules/react-native/third-party-podspecs/Folly.podspec'

  target 'FireTransactionTests' do
    inherit! :search_paths
    # Pods for testing
  end

  use_native_modules!
end

target 'FireTransaction-tvOS' do
  # Pods for FireTransaction-tvOS

  target 'FireTransaction-tvOSTests' do
    inherit! :search_paths
    # Pods for testing
  end

end

```

#### `AppDelegate.m`:

```objc
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@import Firebase;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"FireTransaction"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

```

</p>
</details>

---

### Android

<details><summary>Click To Expand</summary>
<p>

#### Have you converted to AndroidX?

<!--- Mark any options that apply below -->
- [ ] my application is an AndroidX application?
- [ ] I am using `android/gradle.settings` `jetifier=true` for Android compatibility?
- [ ] I am using the NPM package `jetifier` for react-native compatibility?

#### `android/build.gradle`:

```groovy
// N/A
```

#### `android/app/build.gradle`:

```groovy
// N/A
```

#### `android/settings.gradle`:

```groovy
// N/A
```

#### `MainApplication.java`:

```java
// N/A
```

#### `AndroidManifest.xml`:

```xml
<!-- N/A -->
```

</p>
</details>


---

## Environment

<details><summary>Click To Expand</summary>
<p>

**`react-native info` output:**

<!-- Please run `react-native info` on your terminal and paste the contents into the code block below -->

```
 info Fetching system and libraries information...
System:
    OS: macOS Mojave 10.14.6
    CPU: (12) x64 Intel(R) Core(TM) i7-8850H CPU @ 2.60GHz
    Memory: 503.20 MB / 16.00 GB
    Shell: 5.3 - /bin/zsh
  Binaries:
    Node: 10.14.1 - ~/.nvm/versions/node/v10.14.1/bin/node
    Yarn: 1.15.2 - /usr/local/bin/yarn
    npm: 6.4.1 - ~/.nvm/versions/node/v10.14.1/bin/npm
    Watchman: 4.9.0 - /usr/local/bin/watchman
  SDKs:
    iOS SDK:
      Platforms: iOS 13.2, DriverKit 19.0, macOS 10.15, tvOS 13.2, watchOS 6.1
    Android SDK:
      API Levels: 23, 25, 26, 27, 28
      Build Tools: 19.1.0, 26.0.3, 27.0.3, 28.0.3, 29.0.2
      System Images: android-19 | Google APIs Intel x86 Atom, android-23 | Google APIs Intel x86 Atom_64, android-28 | Google APIs Intel x86 Atom, android-29 | Google Play Intel x86 Atom
      Android NDK: 20.0.5594570
  IDEs:
    Android Studio: 3.5 AI-191.8026.42.35.5791312
    Xcode: 11.2/11B52 - /usr/bin/xcodebuild
  npmPackages:
    react: 16.9.0 => 16.9.0
    react-native: 0.61.3 => 0.61.3
  npmGlobalPackages:
    react-native-cli: 2.0.1
    react-native-git-upgrade: 0.2.7
```

<!-- change `[ ]` to `[x]` to select an option(s) -->

- **Platform that you're experiencing the issue on**:
  - [x] iOS
  - [ ] Android
  - [ ] **iOS** but have not tested behavior on Android
  - [ ] **Android** but have not tested behavior on iOS
  - [ ] Both
- **`react-native-firebase` version you're using that has this issue:**
  - `e.g. 5.4.3`
- **`Firebase` module(s) you're using that has the issue:**
  - `683882190332-f9fp0cfpolr184e2mf70oflp3bd8pn83.apps.googleusercontent.com`
- **Are you using `TypeScript`?**
  - `N`
  
</p>
</details>


<!-- Thanks for reading this far down ❤️  -->
<!-- High quality, detailed issues are much easier to triage for maintainers -->

<!-- For bonus points, if you put a 🔥 (:fire:) emojii at the start of the issue title we'll know -->
<!-- that you took the time to fill this out correctly, or, at least read this far -->

---

Think `react-native-firebase` is great? Please consider supporting all of the project maintainers and contributors by donating via our [Open Collective](https://opencollective.com/react-native-firebase/donate) where all contributors can submit expenses. [[Learn More]](https://invertase.io/oss/react-native-firebase/contributing/donations-expenses)

- 👉 Check out [`React Native Firebase`](https://twitter.com/rnfirebase) and [`Invertase`](https://twitter.com/invertaseio) on Twitter for updates on the library.

