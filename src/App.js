import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faColumns } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faTwitter } from "@fortawesome/free-brands-svg-icons"
import './App.css';
import DashboardPage from './pages/dashboard'
import ProjectPage from './pages/project'
import ContactPage from './pages/contact'
import mscaImg from './assets/img/msca.png';
import wellcomeImg from './assets/img/wellcome.jpg';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

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

  return (
    <div className="App">
      <div className="menu-bar">
        <p className="title">TYPHINET</p>
        <div className="divider" />
        <div className={`item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentPage('dashboard')}>
          <FontAwesomeIcon icon={faColumns} />
          <span>Dashboard</span>
        </div>
        <div className={`item ${currentPage === 'project' ? 'active' : ''}`} onClick={() => setCurrentPage('project')}>
          <FontAwesomeIcon icon={faColumns} />
          <span>Project</span>
        </div>
        <div className={`item ${currentPage === 'contact' ? 'active' : ''}`} onClick={() => setCurrentPage('contact')}>
          <FontAwesomeIcon icon={faColumns} />
          <span>Contact</span>
        </div>
         <div className={`item ${currentPage === 'contact' ? 'Publications' : ''}`} onClick={() => window.open('https://scholar.google.com.au/citations?user=klhFnE0AAAAJ&hl=en', '_blank')}>
          <FontAwesomeIcon icon={faGithub} />
          <span>Publications</span>
        </div>
        <div className={`item ${currentPage === 'contact' ? 'github' : ''}`} onClick={() => window.open('https://github.com/zadyson/TyphiNET', '_blank')}>
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
        {renderCurrentPage()}
      </div>
    </div>
  );
}

export default App;
