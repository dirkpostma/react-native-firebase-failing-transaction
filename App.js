/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import {testTransaction} from './src/api';

const performTest = async setResult => {
  setResult('TEST PENDING...');
  const expectedResult = '{"score_user_1":0,"score_user_2":1,"turn":1}'; 
  const result = await testTransaction();
  if (result === expectedResult) {
    setResult('TEST PASSED');
  } else {
    setResult(`TEST FAILED\nexpected: ${expectedResult},\nactual: ${result}`);
  }
};

const App = () => {
  const [result, setResult] = useState('TEST PENDING');
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text>
              Test to show write not rolled back for failed transaction
            </Text>
            <Button
              testID="test_transaction_button"
              title="Test transaction"
              onPress={() => performTest(setResult)}
            />
            <Text>{result}</Text>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
});

export default App;
