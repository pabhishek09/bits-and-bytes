import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Navbar from './components/Navbar';
import 'bulma/css/bulma.min.css';
import './App.css';

function App() {

  useEffect(() => {
    fetch('./api/ping')
    .then((data) => data.json())
    .then((response) => {
      console.log('API response', response);
      const subtitleEl = document.getElementById('subtitle');
      if (subtitleEl) subtitleEl.innerHTML = response.data;
    })
  }, []);


  return (
    <div className="app-container">
      <Router>
        <Navbar />
        <div className="page-layout">
          <section className="hero is-primary">
            <div className="hero-body">
              <p className="title">
                Bits & Bytes
              </p>
              <p className="subtitle" id="subtitle"></p>
            </div>
          </section>
          <Switch>
            <Route path="/game">
              <Game />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;
