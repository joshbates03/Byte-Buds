import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import { ReactComponent as ConfigIcon } from './icons/config.svg';
import { ReactComponent as RunIcon } from './icons/run.svg';
import MenuItem from '@mui/material/MenuItem';
import { Typography, TextField, Paper, Container, IconButton, Checkbox } from '@mui/material';
import baseURL from './config';
import CloseIcon from '@mui/icons-material/Close';
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
import HelpIcon from '@mui/icons-material/Help';

import Tooltip from '@mui/material/Tooltip';
import { Await } from 'react-router-dom';

const CreateChallenge = ({ isSmall, group, toggleCreateChallenge, updater, updateState }) => {

    const handleUpdate = () => { updateState(updater + 1) };
    const [languageSyntax, setLanguageSyntax] = useState(languages.java);
    const [originalConstructs, setOriginalConstructs] = useState([]);
    const [constructs, setConstructs] = useState([]);
    const handleChange = (event) => {
        const updatedConstructs = event.target.value.split('\n');
        setConstructs(updatedConstructs);
    };
    const [challengeName, setChallengeName] = useState('')
    const [challengeDescription, setChallengeDescription] = useState('')
    const [challengeLanguage, setChallengeLanguage] = useState('')

    const handleDescriptionChange = (newValue) => {
        const limitedValue = newValue.slice(0, 300);
        setChallengeDescription(limitedValue);
    };

    const [challengeDifficulty, setChallengeDifficulty] = useState('')
    const [expectedValue, setExpectedValue] = useState('Expected Value')
    const [challengePrivacy, setChallengePrivacy] = useState(false)
    const [challengeResponse, setChallengeResponse] = useState('')
    const [, setMessageColour] = useState('green')
    const avaliableLanguages = [
        "Bash (5.0.0)",
        "C (GCC 9.2.0)",
        "C++ (GCC 9.2.0)",
        "C# (Mono 6.6.0.161)",
        "Go (1.13.5)",
        "Java (OpenJDK 13.0.1)",
        "JavaScript (Node.js 12.14.0)",
        "Lua (5.3.5)",
        "PHP (7.4.1)",
        "Python (3.8.1)",
        "Ruby (2.7.0)",
        "Rust (1.40.0)",
        "TypeScript (3.7.4)",
    ];

    const getConstructs = async () => {
        try {
            const response = await fetch(`${baseURL}/constructs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: exampleSolution, language: challengeLanguage }),
            });

            const responseData = await response.json();

            if (response.status === 200) {
                const uniqueConstructs = responseData.uniqueConstructs;
                setConstructs(uniqueConstructs)
                setOriginalConstructs(uniqueConstructs)

            }
        }
        catch (error) {
        }
    };

    const [input, setInput] = useState('');

    const runExampleSolution = async () => {
        setExpectedValue('Executing your code...')
        setConstructs([])
        try {
            if (input === '') {
                setInput('');
            }
            const inputs = input.split(',');

            const response = await fetch(`${baseURL}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ languageID: challengeLanguage, code: exampleSolution, inputs }),
            });
            

            const responseData = await response.json();

            if (response.status === 200) {
                setExpectedValue(responseData.output);
                await getConstructs()


            }
        } catch (error) {
        }
    };

    const [newIsSmall, setNewIsSmall] = useState(false)
    const [titlePosition, setTitlePosition] = useState(false)
    useEffect(() => {
        const handleResize = () => {
            setNewIsSmall(window.innerWidth < 1535)
            setTitlePosition(window.innerWidth < 602)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        if (challengeLanguage) {
            setExampleSolution('')
            setExpectedValue('Expected Value')
            setConstructs([])
            setOriginalConstructs([])
            setCodeTemplate('')
            if (challengeLanguage.length === 0) {
                setExampleSolution('')
                setExpectedValue('Expected Value')
                setConstructs([])
                setOriginalConstructs([])
                setCodeTemplate('')
            }
            if (challengeLanguage === 'Bash (5.0.0)') {
                setLanguageSyntax(languages.bash)
                setExampleSolution('')
                setCodeTemplate('')
            }

            if (challengeLanguage === 'JavaScript (Node.js 12.14.0)') {
                setLanguageSyntax(languages.javascript)
                setExampleSolution('')
                setCodeTemplate('')
            }
            if (challengeLanguage === 'Lua (5.3.5)') {
                setLanguageSyntax(languages.lua)
                setExampleSolution('')
                setCodeTemplate('')
            }
            if (challengeLanguage === 'PHP (7.4.1)') {
                setLanguageSyntax(languages.python)
                setExampleSolution('')
                setCodeTemplate('')
            }
            if (challengeLanguage === 'Python (3.8.1)') {
                setLanguageSyntax(languages.python)
                setExampleSolution('')
                setCodeTemplate('')
            }
            if (challengeLanguage === 'Ruby (2.7.0)') {
                setLanguageSyntax(languages.ruby)
                setExampleSolution('')
                setCodeTemplate('')
            }

            if (challengeLanguage === 'TypeScript (3.7.4)') {
                setLanguageSyntax(languages.typescript)
                setExampleSolution('')
                setCodeTemplate('')
            }

            if (challengeLanguage === 'Java (OpenJDK 13.0.1)') {
                setLanguageSyntax(languages.java)
                setCodeTemplate(`public class Main {
    public static void main(String[] args) {
        
        
    }
}
                `)
                setExampleSolution(`public class Main {
    public static void main(String[] args) {
        
        
    }
}
                `)
            }

            if (challengeLanguage === 'Go (1.13.5)') {
                setLanguageSyntax(languages.go)
                setCodeTemplate(`package main
import "fmt"

func main() {

}
                `)
                setExampleSolution(`package main
import "fmt"

func main() {

}
                `)
            }

            if (challengeLanguage === 'C (GCC 9.2.0)') {
                setLanguageSyntax(languages.c)
                setCodeTemplate(`#include <stdio.h>

int main(void) {
    return 0;
}`)
                setExampleSolution(`#include <stdio.h>

int main(void) {
    return 0;
}`)
            }

            if (challengeLanguage === 'C++ (GCC 9.2.0)') {
                setLanguageSyntax(languages.cpp)
                setCodeTemplate(`#include <iostream>

int main() {
    return 0;
}
`)
                setExampleSolution(`#include <iostream>

int main() {
    return 0;
}
`)
            }

            if (challengeLanguage === 'C# (Mono 6.6.0.161)') {
                setLanguageSyntax(languages.csharp)
                setCodeTemplate(`using System;

class Program
{
    static void Main() {
        
    }
}
`)
                setExampleSolution(`using System;

class Program
{
    static void Main() {
        
    }
}
`)
            }

            if (challengeLanguage === 'Rust (1.40.0)') {
                setLanguageSyntax(languages.rust)
                setCodeTemplate(`fn main() {

}
`)
                setExampleSolution(`fn main() {

}
`)
            }
        } else {
            setExampleSolution('')
            setExpectedValue('Expected Value')
            setConstructs([])
            setOriginalConstructs([])
            setCodeTemplate('')
        }
    }, [challengeLanguage]);

    const createChallenge = async () => {
        try {
            setMessageColour('green')
            const challenge = {
                "title": challengeName,
                "description": challengeDescription,
                "difficulty": challengeDifficulty,
                "language": challengeLanguage,
                "expected_output": expectedValue,
                "example_solution": exampleSolution,
                "code_template": codeTemplate,
                "codeql_query": constructs,
                "privacy": challengePrivacy,
                "group_name": group,

            }

            if (!challenge.title || !challenge.description || !challenge.difficulty || !challenge.language || challenge.expected_output === 'Expected Value' || !challenge.example_solution || !challenge.codeql_query || !challenge.group_name) {
                setMessageColour('red')
                setChallengeResponse('Please fill in all fields')
                return
            }

            const response = await fetch(`${baseURL}/challenge/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(challenge),
                credentials: 'include',
            });

            const responseData = await response.json();
            setChallengeResponse(responseData)
            toggleCreateChallenge()
            setTimeout(() => {
                setChallengeResponse('');
            }, 2500);
            handleUpdate()
            setChallengeName('');
            setChallengeDescription('');
            setChallengeLanguage('');
            setChallengeDifficulty('');
            setExpectedValue('');
        } catch (error) {
            setChallengeResponse("Something went wrong")
            setTimeout(() => {
                setChallengeResponse('');
            }, 2500);
        }
    }

    // Code analysis pop up stuff
    const [exampleSolution, setExampleSolution] = useState('');
    const [codeTemplate, setCodeTemplate] = useState('');
    const [manageCodeAnalysisPopUp, setManageCodeAnalysisPopUp] = useState(false)
    const toggleCodeAnalysisPopUp = () => {
        setManageCodeAnalysisPopUp(!manageCodeAnalysisPopUp)
    }

    const getConstructsFromTemplate = async () => {
        try {
            const response = await fetch(`${baseURL}/constructs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: codeTemplate, language: challengeLanguage }),
            });

            const responseData = await response.json();

            if (response.status === 200) {
                const templateConstructs = responseData.uniqueConstructs;
                const updatedConstructs = originalConstructs.filter(construct => !templateConstructs.includes(construct));
                setConstructs(updatedConstructs);
                if (codeTemplate === '') { setConstructs(originalConstructs) }
            }
        }
        catch (error) {
        }
    };

 

   

    useEffect(() => {
       if (exampleSolution != ''){
            getConstructsFromTemplate();
       } else{
        setConstructs([])
        setOriginalConstructs([])
    }
     
       
    }, [codeTemplate,  constructs, challengeLanguage]);



    return (
        <Container style={{ backdropFilter: 'blur(3px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', zIndex: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }} maxWidth="false">
            <div className={`scale-in-center`}>
                <Paper style={{ width: isSmall ? '350px' : '600px', padding: '10px', display: 'flex', backgroundColor: 'purple', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', transition: 'width 0.3s ease', }}>
                    <Typography sx={{ color: 'white', marginTop: 1, marginBottom: 1, marginLeft: 3 }} variant='h6' style={{ flex: 1 }}>
                        Create a challenge
                    </Typography>
                    <IconButton sx={{ color: 'white', marginRight: 1 }} onClick={toggleCreateChallenge}>
                        <CloseIcon />
                    </IconButton>
                </Paper>

                <Paper style={{ display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '0px', zIndex: 1, flexDirection: 'column', width: isSmall ? '350px' : '600px', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderBottom: '6px solid #dfd9d9', boxShadow: 'none', transition: 'width 0.3s ease' }}>
                    <Container sx={{ marginTop: 2 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', }} className="input-wrapper">
                                <input
                                    style={{ width: '100%' }}
                                    placeholder="Challenge Name"
                                    value={challengeName}
                                    type="text"
                                    onChange={(e) => setChallengeName(e.target.value)}
                                    maxLength={20}
                                />
                            </div>


                            <Editor
                                value={challengeDescription}
                                onValueChange={handleDescriptionChange}
                                highlight={(code) => code}
                                padding={10}
                                style={{
                                    marginTop: 15,
                                    color: 'black',
                                    fontSize: 15,
                                    backgroundColor: '#F0F0F0',
                                    position: 'relative',
                                    borderBottom: '6px solid #dfd9d9',
                                    border: 'none !important',
                                    outline: 'none !important',
                                    minHeight: '100%',
                                    borderRadius: 10,
                                    height: '215px',
                                    boxShadow: 'none !important',
                                }}

                                onFocus={(e) => {
                                    e.target.style.outline = 'none';
                                }}
                            />
                            {challengeDescription ? null : <Typography style={{ position: 'absolute', top: '168px', left: '45px', color: 'gray' }}>Challenge Description</Typography>}

                            <Typography variant='body2' sx={{ color: 'gray', fontSize: '12px', marginLeft: 'auto' }}>
                                {challengeDescription.length}/300
                            </Typography>

                            <div style={{ display: 'flex', marginBottom: '10px' }}>
                                <button onClick={toggleCodeAnalysisPopUp} style={{ marginBottom: 1 }} className="joinButton">
                                    <div className="sign">
                                        <ConfigIcon alt="Config Icon" />
                                    </div>
                                    <div className="text">Configure</div>
                                </button>
                            </div>

                            <div style={{ zIndex: 0, marginTop: 7 }}>
                                <FormControl variant="outlined" style={{ maxWidth: '550px', width: '100%' }}>
                                    <InputLabel>Difficulty</InputLabel>
                                    <Select
                                        label="Difficulty"
                                        required
                                        variant="filled"
                                        sx={{
                                            borderRadius: '5px',
                                            width: '100%',
                                            marginBottom: '10px',
                                            padding: '0px',
                                            borderBottomLeftRadius: '10px',
                                            borderBottomRightRadius: '10px',
                                            borderTopRightRadius: '10px',
                                            borderTopLeftRadius: '10px',
                                            borderBottom: '6px solid #dfd9d9',
                                            boxShadow: 'none',
                                            '&:before, &:after': {
                                                borderBottom: 'none',
                                            },
                                        }}
                                        onChange={(event) => setChallengeDifficulty(event.target.value)}
                                        value={challengeDifficulty}
                                    >
                                        <MenuItem value="">
                                            <em>-- Select --</em>
                                        </MenuItem>
                                        <MenuItem value="easy">Easy</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="hard">Hard</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                <Checkbox
                                    checked={challengePrivacy}
                                    onChange={(event) => setChallengePrivacy(event.target.checked)}
                                    name="challengePrivacy"
                                    style={{ color: "rgb(128,0,128)" }}
                                />
                                <Typography variant="body1" style={{ marginLeft: '3px' }}>Set as Public challenge</Typography>
                            </div>

                            {challengeResponse !== '' && (
                                <Typography
                                    className='heartbeat-once'
                                    sx={{
                                        position: 'absolute',
                                        marginTop: 57,
                                        marginLeft: isSmall ? 10.4 : 26.4,
                                        marginBottom: 1,
                                        alignItems: 'center',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        color: 'red',
                                        transition: 'margin-left 0.3s ease',
                                    }}
                                    variant='body2'
                                >
                                    {challengeResponse}
                                </Typography>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', marginTop: '40px' }}>
                                <button onClick={createChallenge} style={{ width: '100%' }} className="actionButton">
                                    <div className="text">Create Challenge</div>
                                </button>
                            </div>
                        </div>
                    </Container>
                </Paper>
            </div>

            {manageCodeAnalysisPopUp && (
                <div style={{ position: 'fixed', left: 0, width: '100%', height: '720px', flexDirection: 'column', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
                    <Paper style={{ transition: '0.3s', width: newIsSmall ? '90%' : '1500px', padding: '10px', display: 'flex', borderRadius: '0px', backgroundColor: 'purple', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', }}>
                        <Typography sx={{ color: 'white', marginTop: 1, marginBottom: 0, marginLeft: titlePosition ? '30px' : '48px', }} variant="h6" style={{ flex: 1 }}>
                            Challenge Analysis
                        </Typography>
                        <IconButton sx={{ color: 'white', marginRight: 1 }} onClick={toggleCodeAnalysisPopUp}>
                            <CloseIcon />
                        </IconButton>
                    </Paper>

                    <Paper style={{ display: 'flex', flexDirection: 'column', width: newIsSmall ? '90%' : '1500px', height: newIsSmall ? '84%' : '1000px', background: '#fff', padding: '10px', zIndex: 0, overflowY: 'auto', transition: '0.3s', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderBottom: '6px solid #dfd9d9', boxShadow: 'none', }}>
                        <Container sx={{ display: 'flex', flexDirection: newIsSmall ? 'column' : 'row', transition: '0.3s', }} maxWidth="false">
                            <Container sx={{ flex: 1, marginBottom: '15px', minWidth: 0, flexDirection: 'column' }}>
                                <Typography sx={{ color: 'black', marginTop: 1, marginBottom: 1 }} variant="h6" style={{ flex: 1 }}>
                                    Example Solution
                                </Typography>

                                <FormControl
                                    variant="outlined"
                                    sx={{
                                        zIndex: 0,
                                        backgroundColor: 'white',
                                        borderRadius: '5px',
                                        width: '100%',
                                        marginBottom: '10px',
                                        padding: '0px',
                                        marginTop: 1.4
                                    }}
                                >
                                    <InputLabel>Language</InputLabel>
                                    <Select
                                        sx={{
                                            borderRadius: '5px',
                                            width: '100%',
                                            marginBottom: '0px',
                                            padding: '0px',
                                            borderBottomLeftRadius: '10px',
                                            borderBottomRightRadius: '10px',
                                            borderTopRightRadius: '10px',
                                            borderTopLeftRadius: '10px',
                                            borderBottom: '6px solid #dfd9d9',
                                            boxShadow: 'none',
                                            '&:before, &:after': {
                                                borderBottom: 'none',
                                            },
                                        }}


                                        label="Language"
                                        required
                                        variant="filled"
                                        onChange={(event) => setChallengeLanguage(event.target.value)}
                                        value={challengeLanguage}
                                    >
                                        <MenuItem value="">
                                            <em>-- Select --</em>
                                        </MenuItem>
                                        {avaliableLanguages.map((language) => (
                                            <MenuItem key={language} value={language}>
                                                {language}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <div style={{ marginTop: 5, height: '20vh', overflowY: 'auto', marginBottom: '15px' }}>
                                    <Editor
                                        value={challengeLanguage === '' ? '' : exampleSolution}
                                        onValueChange={(code) => {
                                            setExampleSolution(code);
                                        }}
                                        disabled={challengeLanguage === ''}
                                        highlight={(code) => highlight(code, languageSyntax)}
                                        padding={10}
                                        style={{
                                            fontFamily: '"Fira code", "Fira Mono", monospace',
                                            fontSize: 15,
                                            backgroundColor: '#F0F0F0',
                                            position: 'relative',
                                            borderBottom: '6px solid #dfd9d9',
                                            border: 'none !important',
                                            outline: 'none !important',
                                            minHeight: '100%',
                                            borderRadius: 10,
                                            boxShadow: 'none !important',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                        }}
                                    />
                                </div>


                                <div style={{ display: 'flex', marginBottom: '10px', }}>
                                    <button disabled={exampleSolution === ''} onClick={runExampleSolution} style={{ marginBottomL: 1 }} className="joinButton">
                                        <div className="sign">
                                            <RunIcon alt="Run Icon" />
                                        </div>
                                        <div className="text">Run Code</div>
                                    </button>
                                </div>


                                <Editor
                                    value={expectedValue}
                                    disabled={true}
                                    onValueChange={(event) => setExpectedValue(event.target.value)}
                                    highlight={(code) => code}
                                    padding={10}
                                    style={{
                                        minHeight: '100px',
                                        height: '100px',
                                        overflowY: 'auto',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '5px',
                                        width: '100%',
                                        marginBottom: '10px',
                                        padding: '0px',
                                        borderBottomLeftRadius: '10px',
                                        borderBottomRightRadius: '10px',
                                        borderTopRightRadius: '10px',
                                        borderTopLeftRadius: '10px',
                                        borderBottom: '6px solid #dfd9d9',
                                        boxShadow: 'none',
                                        '&:before, &:after': {
                                            borderBottom: 'none',
                                        },
                                    }}

                                    onFocus={(e) => {
                                        e.target.style.outline = 'none';
                                    }}
                                />

                            </Container>

                            <Container sx={{ flex: 1, marginBottom: '20px', minWidth: 0 }}>
                                <Typography sx={{ color: 'black', marginTop: 1, marginBottom: 1 }} variant="h6" style={{ flex: 1 }}>
                                    Code Analysis
                                </Typography>

                                <div style={{ marginTop: '20px', height: '500px' }}>




                                    <Editor
                                        value={constructs.length === 0 ? 'Code Constructs' : constructs.join('\n')}

                                        disabled={true}
                                        onValueChange={handleChange}
                                        highlight={(code) => code}
                                        padding={10}
                                        style={{
                                            minHeight: '100px',
                                            height: '195px',
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: '5px',
                                            width: '100%',
                                            marginBottom: '10px',
                                            padding: '0px',
                                            borderBottomLeftRadius: '10px',
                                            borderBottomRightRadius: '10px',
                                            borderTopRightRadius: '10px',
                                            borderTopLeftRadius: '10px',
                                            borderBottom: '6px solid #dfd9d9',
                                            boxShadow: 'none',
                                            overflowY: 'auto',
                                            '&:before, &:after': {
                                                borderBottom: 'none',
                                            },
                                        }}

                                        onFocus={(e) => {
                                            e.target.style.outline = 'none';
                                        }}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: -10 }}>
                                        <Typography sx={{ color: 'black', marginTop: 1, marginBottom: 1 }} variant="h6" style={{}}>
                                            Code Template
                                        </Typography>

                                        <div>
                                            <Tooltip
                                                arrow
                                                placement={isSmall ? 'bottom' : 'right'}
                                                componentsProps={{
                                                    tooltip: {
                                                        sx: {
                                                            bgcolor: 'transparent',
                                                            '& .MuiTooltip-arrow': {
                                                                color: 'transparent',
                                                            },
                                                        },
                                                    },
                                                }}
                                                title={
                                                    <>
                                                        <div style={{ backgroundColor: 'purple', padding: 10, borderTopLeftRadius: '10px', borderTopRightRadius: '10px', width: '325px' }}>
                                                            <Typography variant='body2' sx={{ color: 'white', }} color="inherit">
                                                                Code Template
                                                            </Typography>
                                                        </div>
                                                        <div style={{ backgroundColor: '#e9e9e9', padding: 10, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderBottom: '6px solid #dfd9d9', width: '325px' }}>
                                                            <Typography variant='body2' sx={{ color: 'black', }} color="inherit">
                                                                Try to avoid providing complete code structures as they can render code analysis of user submissions ineffective, undermining the learning process. Instead, consider offering guidance, explanations, or partial solutions that encourage users to think critically and apply their understanding to solve the challenge effectively. This approach fosters a deeper understanding of the concepts and promotes problem-solving skills!
                                                            </Typography>
                                                        </div>
                                                    </>

                                                }
                                            >
                                                <HelpIcon sx={{ color: 'purple', marginLeft: 1 }} />
                                            </Tooltip>



                                        </div>



                                    </div>

                                    <div style={{ marginTop: 5, height: '20vh', overflowY: 'auto', marginBottom: '15px' }}>
                                        <Editor
                                            value={codeTemplate}
                                            onValueChange={(code) => {
                                                setCodeTemplate(code);
                                            }}

                                            highlight={(code) => highlight(code, languageSyntax)}
                                            padding={10}
                                            style={{
                                                fontFamily: '"Fira code", "Fira Mono", monospace',
                                                fontSize: 15,
                                                backgroundColor: '#F0F0F0',
                                                position: 'relative',
                                                borderBottom: '6px solid #dfd9d9',
                                                border: 'none !important',
                                                outline: 'none !important',
                                                minHeight: '100%',
                                                borderRadius: 10,
                                                boxShadow: 'none !important',
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.outline = 'none';
                                            }}
                                        />

                                    </div>

                                </div>
                            </Container>
                        </Container>
                    </Paper>
                </div>
            )
            }
        </Container >
    )
}

export default CreateChallenge
