import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Homepage from './Components/Homepage';
import { theme } from './Components/Theme';
import { ThemeProvider } from '@mui/system';
import AttemptChallenge from './Components/AttemptChallenge';
import About from './Components/About';
import ChallengeSubmissions from './Components/ChallengeSubmissions';
import Dashboard from './Components/Dashboard';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import NotFound from './Components/NotFound';


function App() {
  return (
    <div className="App">
      <ThemeProvider theme={ theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/challenge" element={<AttemptChallenge />} />
            <Route path="/challenge/:url" element={<AttemptChallenge />} />
            <Route path="/challenge/:url/submissions" element={<ChallengeSubmissions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
