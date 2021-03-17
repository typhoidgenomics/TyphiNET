import React from 'react';
import './App.css';
import DashboardPage from './pages/dashboard'
import typhinetLogoImg from './assets/img/logo-typhinet.png';

function App() {
  return (
    <div className="App">
      <div className="content">
        {window.innerWidth > 767 ? (
          <DashboardPage />
        ) : (
            <>
              <div className="menu-bar-mobile">
                <img className="logoImageMenu-mobile" src={typhinetLogoImg} alt="TyphiNET" />
              </div>
              <div style={{ width: "100%" }}>
                <DashboardPage />
              </div>
            </>
          )}
      </div>
    </div>
  );
}

export default App;
