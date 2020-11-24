import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faColumns, faEnvelope, faQuestion } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import './App.css';
import DashboardPage from './pages/dashboard'
import ProjectPage from './pages/project'
import ContactPage from './pages/contact'
import mscaImg from './assets/img/msca.png';
import wellcomeImg from './assets/img/wellcome.jpg';
import typhinetLogoImg from './assets/img/logo-typhinet.png';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [mobileMenuOpened, setMobileMenuOpened] = React.useState(false);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />
      case 'project':
        return <ProjectPage />
      case 'contact':
        return <ContactPage />
    }
  }

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setMobileMenuOpened(open)
  };

  return (
    <div className="App">
      <div className="menu-bar">
        <img className="logoImageMenu" src={typhinetLogoImg} />
        <div className="divider" />
        <div className={`item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
          <FontAwesomeIcon icon={faColumns} />
          <span>Dashboard</span>
        </div>
        <div className={`item ${currentPage === 'project' ? 'active' : ''}`} onClick={() => setCurrentPage('project')}>
          <FontAwesomeIcon icon={faQuestion} />
          <span>Project</span>
        </div>
        <div className={`item ${currentPage === 'contact' ? 'active' : ''}`} onClick={() => setCurrentPage('contact')}>
          <FontAwesomeIcon icon={faEnvelope} />
          <span>Contact</span>
        </div>
        <div className={`item ${currentPage === 'contact' ? 'github' : ''}`}>
          <FontAwesomeIcon icon={faGithub} />
          <span>GitHub</span>
        </div>
        <div className={`item ${currentPage === 'contact' ? 'twitter' : ''}`} onClick={() => window.open('https://twitter.com/typhinet', '_blank')}>
          <FontAwesomeIcon icon={faTwitter} />
          <span>Twitter</span>
        </div>

        <div className="footer">
          <img className="msca" src={mscaImg} />
          <img src={wellcomeImg} style={{ marginRight: "1rem" }} />
        </div>
      </div>
      <div className="content">
        {window.innerWidth > 767 ? (
          renderCurrentPage()
        ) : (
            <>
              <div className="menu-bar-mobile">
                <FontAwesomeIcon icon={faBars} onClick={() => setMobileMenuOpened(true)} />
                <img className="logoImageMenu-mobile" src={typhinetLogoImg} />
                <SwipeableDrawer
                  anchor={'left'}
                  open={mobileMenuOpened}
                  onClose={toggleDrawer(false)}
                  onOpen={toggleDrawer(true)}
                >
                  <List>
                    <ListItem button key={'dashboard'} onClick={() => {
                      setCurrentPage('dashboard')
                      setMobileMenuOpened(false)
                    }}>
                      <ListItemIcon style={{ minWidth: 0, marginRight: 8 }}>
                        <FontAwesomeIcon icon={faColumns} />
                      </ListItemIcon>
                      <ListItemText>
                        <span style={{ fontFamily: "Montserrat", fontWeight: currentPage === 'dashboard' ? 600 : 400 }}>Dashboard</span>
                      </ListItemText>
                    </ListItem>

                    <ListItem button key={'project'} onClick={() => {
                      setCurrentPage('project')
                      setMobileMenuOpened(false)
                    }}>
                      <ListItemIcon style={{ minWidth: 0, marginRight: 8 }}>
                        <FontAwesomeIcon icon={faColumns} />
                      </ListItemIcon>
                      <ListItemText>
                        <span style={{ fontFamily: "Montserrat", fontWeight: currentPage === 'project' ? 600 : 400 }}>Project</span>
                      </ListItemText>
                    </ListItem>

                    <ListItem button key={'contact'} onClick={() => {
                      setCurrentPage('contact')
                      setMobileMenuOpened(false)
                    }}>
                      <ListItemIcon style={{ minWidth: 0, marginRight: 8 }}>
                        <FontAwesomeIcon icon={faColumns} />
                      </ListItemIcon>
                      <ListItemText>
                        <span style={{ fontFamily: "Montserrat", fontWeight: currentPage === 'contact' ? 600 : 400 }}>Contact</span>
                      </ListItemText>
                    </ListItem>

                    <ListItem button key={'gitHub'} onClick={() => {
                      setMobileMenuOpened(false)
                    }}>
                      <ListItemIcon style={{ minWidth: 0, marginRight: 8 }}>
                        <FontAwesomeIcon icon={faGithub} />
                      </ListItemIcon>
                      <ListItemText>
                        <span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>GitHub</span>
                      </ListItemText>
                    </ListItem>

                    <ListItem button key={'twitter'} onClick={() => {
                      setMobileMenuOpened(false)
                      window.open('https://twitter.com/typhinet', '_blank')
                    }}>
                      <ListItemIcon style={{ minWidth: 0, marginRight: 8 }}>
                        <FontAwesomeIcon icon={faTwitter} />
                      </ListItemIcon>
                      <ListItemText>
                        <span style={{ fontFamily: "Montserrat", fontWeight: 400 }}>Twitter</span>
                      </ListItemText>
                    </ListItem>
                  </List>
                </SwipeableDrawer>
              </div>
              <div style={{ width: "100%" }}>
                {renderCurrentPage()}
              </div>
            </>
          )}
      </div>
    </div>
  );
}

export default App;
