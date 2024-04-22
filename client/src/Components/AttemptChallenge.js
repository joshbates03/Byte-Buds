import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReactComponent as JoinIcon } from './icons/join.svg';
import { ReactComponent as RunIcon } from './icons/run.svg';
import { ReactComponent as SubmissionsIcon } from './icons/submissions.svg';
import { ReactComponent as SubmitIcon } from './icons/submit.svg';
import { Container, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SideBar from './SideBar';
import baseURL from './config';
import { generate as randomWordsGenerate } from 'random-words';
import { highlight, languages } from 'prismjs';
import 'prismjs/themes/prism.css';
import Editor from 'react-simple-code-editor';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-typescript';

const AttemptChallenge = () => {
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
  const [toggleSidebar, setToggleSidebar] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [isGuest, setIsGuest] = useState(true)
  const [, setIsLoading] = useState(true);
  const [, setSidebar] = useState(false)
  const [failedFetch, setFailedFetch] = useState(false)
  const [submissionButton, setSubmissionButton] = useState(false)
  const [challengeData, setChallengeData] = useState({});
  const navigate = useNavigate()
  const { url } = useParams();
  const [output, setOutput] = useState('');
  const [constructOutput, setConstructOutput] = useState('');
  const [input, setInput] = useState('');
  const [isCorrect, setIsCorrect] = useState(false)
  const [, setResult] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [joined, setJoined] = useState(false)
  const [clickedSubmit, setClickedSubmit] = useState(false)
  const [foundPercentage, setFoundPercentage] = useState(0);
  const [languageSyntax, setLanguageSyntax] = useState(languages.java);
  const [displayedExpectedOutput, setDisplayedExpectedOutput] = useState('Expected output: \n')
  const [progressColor, setProgressColor] = useState('grey');

  // Show submit if user has made 5 attempts
  useEffect(() => {
    if (attempts >= 5) {
      setShowSubmit(true);
    }
  }, [attempts]);

  const handleToggleSidebar = () => {
    setToggleSidebar(!toggleSidebar)
  }

  useEffect(() => {
    if (!isSmall) { setToggleSidebar(false) }
  }, [isSmall]);

  const hasUserCompletedChallenge = async () => {
    const response = await fetch(
      `${baseURL}/groupchallengeid/${challengeData[0].challengeid}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) { return }

    const gcid = await response.json();

    const checkCompletionResponse = await fetch(
      `${baseURL}/check-submission?username=${guestName}&challengeId=${gcid}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!checkCompletionResponse.ok) {
      console.error('Failed to check completion status');
      setSubmissionButton(false);
      return;
    }

    const submissionExists = await checkCompletionResponse.text();
    setSubmissionButton(submissionExists === 'true');
  }

  // Checks if the window is small
  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1150)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const response = await fetch(`${baseURL}/achallenge/${url}`);
        if (response.ok) {
          const data = await response.json();
          setChallengeData(data);
          setDisplayedExpectedOutput('Expected output:\n' + challengeData[0].expected_output)
          
        }
        
      } catch (error) {
        console.error(error)
      }
    };

    fetchChallengeData();
   
  }, [url,]);


  useEffect(() => {
    if (challengeData.length === 0){setFailedFetch(true)}
  }, [challengeData]);

  useEffect(() => {
    if (challengeData[0]) {
     
      hasUserCompletedChallenge()
    } 
  }, [guestName, clickedSubmit]);


  useEffect(() => {
    if (!isSmall) { setSidebar(false) }
  }, [isSmall]);

  // Code block stuff
  const [code, setCode] = useState('');
  const [prevCode, setPrevCode] = useState('');
  const handleCode = (newCode) => { setCode(newCode) };

  useEffect(() => {
    getResult();
  }, [output, foundPercentage]);

  // Join group stuff
  const [inGroup, setInGroup] = useState(false)

  const isGroupMember = async () => {
    try {
      if (challengeData[0]) {
        const payload = { group_name: challengeData[0].group_name }
        const response = await fetch(`${baseURL}/in/group`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          credentials: 'include',
        });
        const responseData = await response.json()
        setInGroup(responseData.exists)
      }
    } catch (error) {
      console.error('Error checking group status', error);
    }
  };

  useEffect(() => {
    isGroupMember()
  }, [challengeData, joined, isGuest]);


  // Set syntax highlighting and default code depending on language
  useEffect(() => {
   
    if (challengeData?.[0]?.language) {
      if (challengeData[0].language === 'Bash (5.0.0)') {
        setLanguageSyntax(languages.bash)
        setCode('')
      }

      if (challengeData[0].language === 'JavaScript (Node.js 12.14.0)') {
        setLanguageSyntax(languages.javascript)
        setCode('')
      }
      if (challengeData[0].language === 'Lua (5.3.5)') {
        setLanguageSyntax(languages.lua)
        setCode('')
      }
      if (challengeData[0].language === 'PHP (7.4.1)') {
        setLanguageSyntax(languages.python)
        setCode('')
      }
      if (challengeData[0].language === 'Python (3.8.1)') {
        setLanguageSyntax(languages.python)
        setCode('')
      }
      if (challengeData[0].language === 'Ruby (2.7.0)') {
        setLanguageSyntax(languages.ruby)
        setCode('')
      }

      if (challengeData[0].language === 'TypeScript (3.7.4)') {
        setLanguageSyntax(languages.typescript)
        setCode('')
      }

      if (challengeData[0].language === 'Java (OpenJDK 13.0.1)') {
        setLanguageSyntax(languages.java)
        setCode(`public class Main {
    public static void main(String[] args) {


    }
}
        `)
      }

      if (challengeData[0].language === 'Go (1.13.5)') {
        setLanguageSyntax(languages.go)
        setCode(`package main
import "fmt"

func main() {

}
        `)
      }

      if (challengeData[0].language === 'C (GCC 9.2.0)') {
        setLanguageSyntax(languages.c)
        setCode(`#include <stdio.h>

int main(void) {
  return 0;
}`)
      }

      if (challengeData[0].language === 'C++ (GCC 9.2.0)') {
        setLanguageSyntax(languages.cpp)
        setCode(`#include <iostream>

int main() {
  return 0;
}
`)
      }

      if (challengeData[0].language === 'C# (Mono 6.6.0.161)') {
        setLanguageSyntax(languages.csharp)
        setCode(`using System;

class Program
{
    static void Main() {

    }
}
`)
      }

      if (challengeData[0].language === 'Rust (1.40.0)') {
        setLanguageSyntax(languages.rust)
        setCode(`fn main() {

}
`)
      }



      setDisplayedExpectedOutput('Expected output:\n' + challengeData[0].expected_output)
    } 
    if (challengeData?.[0]?.code_template){ setCode(challengeData[0].code_template)}
   
  }, [challengeData]);

  const progressBarStyle = {
    width: `${foundPercentage}%`,
  };

  const joinGroup = async () => {
    try {
      const response = await fetch(`${baseURL}/join/group`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "group_name": challengeData[0].group_name }),
        credentials: 'include'
      });

      await response.json();
      setJoined(true)
      if (response.status === 200) {
      }
    } catch (error) {
      console.error(error);
    }
  };

  const executeConstructAnalysis = async () => {
    try {
      const constructList = challengeData[0].codeql_query
        .replace('{', '')
        .replace('}', '')
        .split(',')
        .map(item => item.replace(/"/g, ''));
      
      

      const requestBody = { code: code, constructs: constructList, language: challengeData[0].language, "code_template":challengeData[0].code_template };

      const response = await fetch(`${baseURL}/check-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log(data)
      if (data.foundConstructs.length === 0){
        setFoundPercentage(0)
        setConstructOutput("Your solution seems incomplete. Consider using more required constructs for a more comprehensive solution.")
        return
      }
      const foundList = [];
      const notFoundList = [];

      data.foundConstructs.forEach((item) => { foundList.push(item) });
      data.notFoundConstructs.forEach((item) => { notFoundList.push(item) });
      const total = (foundList.length) + (notFoundList.length)
      setFoundPercentage((foundList.length / total) * 100)
    } catch (error) {
    }
  };

  const onExecute = async () => {
   
    if (!code.trim()) { return }
    if (code === prevCode) { return }
    setPrevCode(code)
    try {
      setOutput('Executing your code...')
      setConstructOutput('Analysing code structure...')
      
      setAttempts(attempts + 1);
      if (input === '') { setInput('') }
      const inputs = input.split(',');
      
      const response = await fetch(`${baseURL}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ languageID: challengeData[0].language, code, inputs }),
      });
      

      const responseData = await response.json();

      if (response.status === 200) {
        setOutput(responseData.output);
        await executeConstructAnalysis();
      }
    } catch (error) {
    }
  };

  const getResult = () => {
    if (output === null) { return }

    const cleanedOutput = output.replace(/\r|\s/g, '');
    if (challengeData?.[0]?.expected_output) {
      const cleanedEO = challengeData[0].expected_output.replace(/\n|\s/g, '');
      if (cleanedOutput.trim() === cleanedEO.trim().split(' ').join(' ') && attempts > 0) {
        setResult('Well Done!');
        setIsCorrect(true)
        setShowSubmit(true);

        if (foundPercentage <= 39) {
          setConstructOutput("Your solution seems incomplete. Consider using more required constructs for a more comprehensive solution.")
          setProgressColor('red')
        } else if (foundPercentage > 40 && foundPercentage <= 69) {
          setConstructOutput("You're making progress, but there might be room for improvement. Check the question requirements and consider using more required constructs.")
          setProgressColor('orange')
        } else if (foundPercentage >= 70) {
          setConstructOutput("Congratulations! You've used all the required constructs correctly. Well done!")
          setProgressColor('green')
        }

      } else { //if wrong
        setResult('');
        if (foundPercentage === 0){return}
        if (foundPercentage <= 39) {
          setConstructOutput("Your solution seems incomplete. Consider using more required constructs for a more comprehensive solution, and review your output for correctness.")
          setProgressColor('red')
        } else if (foundPercentage >= 40 && foundPercentage <= 69) {
          setConstructOutput("You're making progress, but there might be room for improvement. Check the question requirements, use more required constructs, and review your output for correctness.")
          setProgressColor('orange')
        } else if (foundPercentage >= 70) {
          setProgressColor('green')
          setConstructOutput("You've used all the correct constructs, but your output is incorrect. Please review your solution.")
        }
      }
    }
  };

  const submitChallenge = async () => {
    const response = await fetch(
      `${baseURL}/groupchallengeid/${challengeData[0].challengeid}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) { return }
    const data = await response.json();
    if (data === null) { return }

    try {
      const toSubmit = {
        groupchallengeid: data,
        username: guestName,
        code,
        codeoutput: output,
        isCorrect: isCorrect,
        allConstructs: false
      };

      const response = await fetch(`${baseURL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toSubmit),
      });

      await response.json();
      setAttempts(0);
      setShowSubmit(false)
    } catch (error) {
    }
    setClickedSubmit(true)
  };

  // Sidebar position
  const [sidebarPosition, setSidebarPosition] = useState(localStorage.getItem('sidebarPosition') || 'right');
  const [snapClick, setSnapClick] = useState(0)
  const handleSnapClick = () => { setSnapClick(prevValue => prevValue + 1) };

  // Sets sidebar to the saved position
  useEffect(() => {
    const handleStorageChange = () => {
      const savedPosition = localStorage.getItem('sidebarPosition');
      if (savedPosition) {
        setSidebarPosition(savedPosition);

      }
    }
    handleStorageChange()
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [snapClick]);

  const handleSubmissionsClick = () => {
    const currentPath = window.location.pathname;
    navigate(`${currentPath}/submissions`);
  };

  // Styles
  const pageStyle = {
    height: '100vh',
    width: '100%',
    backgroundColor: '#F5F5F5',
    position: 'relative',
  };

  const redContainerStyle = {
    marginLeft: isSmall ? '0' : sidebarPosition === 'left' ? '255px' : 'auto',
    marginRight: isSmall ? '0' : sidebarPosition === 'right' ? '255px' : 'auto',
    height: '100vh',
    width: isSmall ? '100%' : 'calc(100% - 250px)',
    overflowX: 'hidden',
    transition: '0.3s',
  };


  const textAreaStyles = {
    pointerEvents: 'none',
    display: 'block',
    fontFamily: 'Consolas, monospace',
    fontSize: '14px',
    backgroundColor: 'white',
    color: '#333',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px',
    borderTopRightRadius: '10px',
    borderBottom: '6px solid #dfd9d9',
    padding: '10px',
    width: '100%',
    height: '125px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  };


   if (failedFetch) {
    return (
      <Container sx={pageStyle} maxWidth="false">
        <SideBar isOpen={!isSmall} toggleOpen={toggleSidebar} uname={guestName}
          setGuestName={setGuestName}
          setIsGuest={setIsGuest}
          randomWordsGenerate={randomWordsGenerate}
          guestName={guestName}
          setIsLoading={setIsLoading}
          onSnapClick={handleSnapClick}
        />
        <Container sx={redContainerStyle} maxWidth="false">
          <div>
            <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
              <Link color="inherit" href="/">
                Homepage
              </Link>
              <Link color="inherit" href={`/challenge`}>
                Challenge
              </Link>
            </Breadcrumbs>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
            {sidebarPosition === 'right' && isSmall && (
              <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                <KeyboardDoubleArrowRightIcon />
              </IconButton>
            )}
            <Typography variant='h5'>
              Challenge not found
            </Typography>
            {sidebarPosition === 'left' && (
              <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0' }}>
                {isSmall && (
                  <IconButton onClick={handleToggleSidebar} sx={{}}>
                    <KeyboardDoubleArrowRightIcon />
                  </IconButton>
                )}
              </div>
            )}
          </div>
        </Container>
      </Container>
    )
  }



  

  if (challengeData[0]) {
    return (
      <Container sx={pageStyle} maxWidth="false">
        <SideBar isOpen={!isSmall} toggleOpen={toggleSidebar}
          setGuestName={setGuestName}
          setIsGuest={setIsGuest}
          randomWordsGenerate={randomWordsGenerate}
          guestName={guestName}
          setIsLoading={setIsLoading}
          onSnapClick={handleSnapClick}
        />
        <Container sx={redContainerStyle} maxWidth="false">
          <div style={{}}>
            <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
              <Link color="inherit" href="/">
                Homepage
              </Link>
              <Link color="inherit" href={`/challenge/${challengeData[0].url}`}>
                Challenge
              </Link>
            </Breadcrumbs>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant='h5'>
                {challengeData[0].title}
              </Typography>
              {sidebarPosition === 'left' && (
                <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0', }}>
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}

                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', }}>
              <div>

                <Editor
                  value={challengeData[0].description}
                  highlight={(code) => code}
                  readOnly
                  style={{
                    pointerEvents: 'none',
                    overflowY: 'auto',
                    height: 'auto',
                    whiteSpace: 'pre-wrap',
                    color: 'black',
                    backgroundColor: '#f5f5f5',
                    fontSize: '15px',
                    width: 'auto'
                  }}
                  
                />



              </div>
            </div>

            <div style={{  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',  }}>
              <Typography sx = {{fontFamily: 'Consolas, monospace',}} variant='body2'>
                {challengeData[0].language}
              </Typography>
              <button className="joinButton" disabled={isGuest || inGroup} style={{ opacity: isGuest || inGroup ? '0.5' : '1', pointerEvents: isGuest || inGroup ? 'none' : 'auto' }} onClick={joinGroup}>
                <div className="sign">
                  <JoinIcon alt="Join Icon" style={{}} />
                </div>
                <div className="text">{challengeData[0].group_name}</div>
              </button>
            </div>

            <div style={{ marginTop: 10, height: '45vh', overflowY: 'auto', marginBottom: '10px', }}>
              <Editor
                value={code}
                onValueChange={handleCode}
                highlight={(code) => highlight(code, languageSyntax)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 15,
                  backgroundColor: 'white',
                  position: 'relative',
                  borderBottom: '6px solid #dfd9d9',
                  border: 'none !important',
                  outline: 'none !important',
                  minHeight: '100%',
                  borderRadius:10
                }}
                onFocus={(e) => {
                  e.target.style.outline = 'none';
              }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex' }}>
                <button style={{ marginRight: 5 }} className="groupControlButton" onClick={onExecute}>
                  <div className="sign">
                    <RunIcon alt="Run Icon" style={{}} />
                  </div>
                  <div className="text">Run</div>
                </button>

                {showSubmit && (
                  <div className='scale-in-center'>
                    <button style={{ backgroundColor: 'green' }} className="groupControlButton" onClick={submitChallenge}>
                      <div className="sign">
                        <SubmitIcon alt="Submit Icon" style={{}} />
                      </div>
                      <div className="text">Submit</div>
                    </button>
                  </div>
                )}
              </div>

              {submissionButton && (
                <div className='scale-in-center'>
                  <button style={{ marginRight: 0 }} className="submissionButton" onClick={handleSubmissionsClick}>
                    <div style={{}} className="sign">
                      <SubmissionsIcon alt="Submissions Icon" style={{}} />
                    </div>
                    <div className="text">Submissions</div>
                  </button>
                </div>
              )}
            </div>

            <Editor
              value={displayedExpectedOutput}
              highlight={(code) => code}
              padding={0}
              readOnly
              style={{ ...textAreaStyles, borderBottom: '3px solid #dfd9d9', borderBottomLeftRadius: 0, borderTopLeftRadius: 10, borderBottomRightRadius: 0, overflowY: 'auto', height: 'auto', whiteSpace: 'pre-wrap', }}
            />

            <Editor
              value={output === '' ? 'Output will appear here' : output}
              highlight={(code) => code}
              padding={0}
              readOnly
              style={{ ...textAreaStyles, borderBottom: '3px solid #dfd9d9', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, overflowY: 'auto', height: 'auto', minHeight: '50px', }}
            />

            <Editor
              value={constructOutput === '' ? 'Results will appear here' : constructOutput}
              readOnly
              highlight={(code) => code}
              padding={0}
              style={{ ...textAreaStyles, borderTopLeftRadius: 0, borderTopRightRadius: 0, minHeight: '50px', height: 'auto', }}
            />

            <div className="progress-bar-container" style={{ marginBottom: 10 }}>
              <div className="progress-bar" style={{ ...progressBarStyle, backgroundColor: progressColor }}></div>
            </div>
          </div>
        </Container>
      </Container>
    );
  } else{
    return (
      <Container sx={pageStyle} maxWidth="false">
        <SideBar isOpen={!isSmall} toggleOpen={toggleSidebar}
          setGuestName={setGuestName}
          setIsGuest={setIsGuest}
          randomWordsGenerate={randomWordsGenerate}
          guestName={guestName}
          setIsLoading={setIsLoading}
          onSnapClick={handleSnapClick}
        />
        <Container sx={redContainerStyle} maxWidth="false">
          <div style={{}}>
            <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
              <Link color="inherit" href="/">
                Homepage
              </Link>
              <Link color="inherit">
                Challenge
              </Link>
            </Breadcrumbs>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: 20, }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant='h5'>
                
              </Typography>
              {sidebarPosition === 'left' && (
                <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0', }}>
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </Container>
    );
  }
}

export default AttemptChallenge;
