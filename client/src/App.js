import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import DashboardPage from './pages/dashboard'
import AdminPage from './pages/admin'
// import typhinetLogoImg from './assets/img/logo-typhinet.png';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/"></Link>
          <Link to="/admin"></Link>
        </nav>
        <Switch>
          <Route path="/admin">
            <div>
              <AdminPage/>
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
