// App.js
import React from 'react';
import {PaperProvider} from 'react-native-paper';
import AppStack from './src/navigation/AppStack';

const App = () => {
  return (
    <PaperProvider>
      <AppStack />
    </PaperProvider>
  );
};

export default App;
