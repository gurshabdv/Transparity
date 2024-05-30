import React from 'react';
import Donation from './components/Donation';
import Expenditure from './components/Expenditure';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Transparity</h1>
      </header>
      <main>
        <Donation />
        <Expenditure />
      </main>
    </div>
  );
};

export default App;
