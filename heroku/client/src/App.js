import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import DashboardPage from './pages/dashboard'
import SwaggerPage from './pages/swagger'
// import typhinetLogoImg from './assets/img/logo-typhinet.png';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/"></Link>
          <Link to="/swagger"></Link>
        </nav>
        <Switch>
          <Route path="/swagger">
            <div>
              <SwaggerPage/>
            </div>
          </Route>
          <Route path="/">
            <div className="App">
              <div className="content">
                <DashboardPage/>
              </div>
            </div>
          </Route>
        </Switch>
      </div>
    </Router>
    // <div className="App">
    //   <div className="content">
    //     <DashboardPage/>
    //   </div>
    // </div>
  );
}

export default App;
