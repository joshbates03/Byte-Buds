import React, { useEffect, useState, } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as SubmissionsIcon } from './icons/submissions.svg';
import { Typography, FormControl, InputLabel, Select, MenuItem, IconButton, Input, } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { ReactComponent as RedStarIcon } from './icons/redstar.svg';
import { ReactComponent as OrangeStarIcon } from './icons/orangestar.svg';
import { ReactComponent as GreenStarIcon } from './icons/greenstar.svg';
import { ReactComponent as CompleteIcon } from './icons/complete.svg';
import baseURL from './config';

import { ReactComponent as AttemptIcon } from './icons/attempt.svg';
const CommunityChallenges = ({ isSmall, updater, guestName }) => {

    const [challenges, setChallenges] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const challengesPerPage = isSmall ? 3 : 6;
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(true)
    const [challengeCompletionStatus, setChallengeCompletionStatus] = useState({});
    const [sortView, setSortView] = useState(window.innerWidth < 750)


    // Checks if the window is small
    useEffect(() => {
        const handleResize = () => {
            setSortView(window.innerWidth < 750)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // Gets all community challenges (public challenges)
    const getChallenges = async () => {
        try {
            const queryParams = new URLSearchParams({
                sort: sortOrder,
                language: selectedLanguage,
                difficulty: selectedDifficulty,
            });

            const response = await fetch(`${baseURL}/challenges/community?${queryParams}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch challenges');
            }

            const data = await response.json();
            if (data === null) {
                throw new Error('Fetched data is null');
            }

            setChallenges(sortOrder === 'newest' ? data.reverse() : data);

            setLoading(false)
        } catch (error) {
            console.error('Error fetching challenges:', error.message);
        }
    };

    // Checks if the user has completed a challenge
    const hasUserCompletedChallenge = async (id) => {
        // Get groupchallengeid from challengeid
        const response = await fetch(
            `${baseURL}/groupchallengeid/${id}`,
            {
                method: 'GET',
                credentials: 'include',
            }
        );

        if (!response.ok) {
            return;
        }

        const gcid = await response.json();

        const checkCompletionResponse = await fetch(
            `${baseURL}/check-submission-2?challengeId=${gcid}&username=${guestName}`,
            {
                method: 'GET',
                credentials: 'include',
            }
        );

        if (!checkCompletionResponse.ok) {
            console.error('Failed to check completion status');
            return;
        }

        const submissionExists = await checkCompletionResponse.text();
        return submissionExists === 'true';
    }

    // Gets completed status for all challenges
    const fetchAllCompletionStatus = async () => {
        const completionStatuses = {};
        for (const challenge of challenges) {
            const status = await hasUserCompletedChallenge(challenge.challengeid);
            completionStatuses[challenge.challengeid] = status;
        }
        setChallengeCompletionStatus(completionStatuses);
    };

    // Updates when challenges/user change 
    useEffect(() => {
        fetchAllCompletionStatus();
    }, [challenges, guestName]);

    useEffect(() => {
        setIsLoading(true)
        getChallenges()
        // A fake loading screen to allow correct data to render
        const minTime = 1000;
        const maxTime = 3000;
        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        setTimeout(() => {
            setIsLoading(false);
        }, randomTime);
    }, [sortOrder, selectedLanguage, selectedDifficulty, updater]);

    // Page navigation
    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    // Sort and filter functions
    const handleSortChange = (newSortOrder) => {
        setSortOrder(newSortOrder);
    };

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    const handleDifficultyChange = (event) => {
        setSelectedDifficulty(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const applyFilters = (challenge) => {
        const languageFilter = !selectedLanguage || challenge.language === selectedLanguage;
        const difficultyFilter = !selectedDifficulty || challenge.difficulty === selectedDifficulty;
        const searchFilter = !searchTerm || challenge.title.toLowerCase().includes(searchTerm.toLowerCase());
        return languageFilter && difficultyFilter && searchFilter;
    };

    const startIndex = (currentPage - 1) * challengesPerPage;
    const endIndex = startIndex + challengesPerPage;
    const filteredChallenges = challenges.filter(applyFilters);
    const displayedChallenges = filteredChallenges.slice(startIndex, endIndex);

    if (isLoading) {
        return (
            <div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <div style={{ marginBottom: 10, marginTop: 15, marginLeft: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: sortView ? 'column' : 'row' }}>
                            <Input
                                type="text"
                                placeholder="Search by name"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{ marginTop: sortView ? 15 : 0, marginRight: 10, padding: '5px', textAlign: 'left', flex: 1, width: '100%', }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', }}>
                                <FormControl style={{ marginTop: sortView ? 15 : 0, marginRight: 10, }}>
                                    <InputLabel>
                                        <Typography variant="body2">Sort by</Typography>
                                    </InputLabel>
                                    <Select sx={{ fontSize: '0.8rem' }} value={sortOrder} onChange={(e) => handleSortChange(e.target.value)}>
                                        <MenuItem value="newest">Newest</MenuItem>
                                        <MenuItem value="oldest">Oldest</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl style={{ marginTop: sortView ? 15 : 0, marginRight: 10, minWidth: sortView ? 105 : 120, }}>
                                    <InputLabel>
                                        <Typography variant="body2">Language</Typography>
                                    </InputLabel>
                                    <Select sx={{ fontSize: '0.8rem' }} value={selectedLanguage} onChange={handleLanguageChange}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="Python (3.8.1)">Python</MenuItem>
                                        <MenuItem value="JavaScript (Node.js 12.14.0)">JavaScript</MenuItem>
                                        <MenuItem value="Bash (5.0.0)">Bash</MenuItem>
                                        <MenuItem value="C (GCC 9.2.0)">C</MenuItem>
                                        <MenuItem value="C++ (GCC 9.2.0)">C++</MenuItem>
                                        <MenuItem value="C# (Mono 6.6.0.161)">C#</MenuItem>
                                        <MenuItem value="Go (1.13.5)">Go</MenuItem>
                                        <MenuItem value="Java (OpenJDK 13.0.1)">Java</MenuItem>
                                        <MenuItem value="Lua (5.3.5)">Lua</MenuItem>
                                        <MenuItem value="PHP (7.4.1)">PHP</MenuItem>
                                        <MenuItem value="Ruby (2.7.0)">Ruby</MenuItem>
                                        <MenuItem value="Rust (1.40.0)">Rust</MenuItem>
                                        <MenuItem value="TypeScript (3.7.4)">TypeScript</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl style={{ marginTop: sortView ? 15 : 0, marginRight: 10, minWidth: sortView ? 105 : 120, }}>
                                    <InputLabel>
                                        <Typography variant="body2">Difficulty</Typography>
                                    </InputLabel>
                                    <Select sx={{ fontSize: '0.8rem' }} value={selectedDifficulty} onChange={handleDifficultyChange}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="easy">Easy</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="hard">Hard</MenuItem>
                                    </Select>
                                </FormControl>

                            </div>
                        </div>

                        <div style={{ position: 'relative', height: '100%', top: '25vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div className="loader"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }



    const renderStars = (difficulty) => {
        const starStyle = {
            width: '20px',
            height: '20px',
            marginRight: '2px', verticalAlign: 'middle',
            marginBottom:5,
            marginLeft:1
        };

        switch (difficulty) {
            case 'easy':
                return <GreenStarIcon style={starStyle} />;
            case 'medium':
                return (
                    <>
                        <OrangeStarIcon style={starStyle} />
                        <OrangeStarIcon style={starStyle} />
                    </>
                );
            case 'hard':
                return (
                    <>
                        <RedStarIcon style={starStyle} />
                        <RedStarIcon style={starStyle} />
                        <RedStarIcon style={starStyle} />
                    </>
                );
            default:
                return null;
        }
    };




    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '100%' }}>
                    <div style={{ marginBottom: 10, marginTop: 15, marginLeft: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: sortView ? 'column' : 'row' }}>
                        <Input
                            type="text"
                            placeholder="Search by name"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{ marginTop: sortView ? 15 : 0, marginRight: 10, padding: '5px', textAlign: 'left', flex: 1, width: '100%', }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', }}>
                            <FormControl style={{ marginTop: sortView ? 15 : 0, marginRight: 10, }}>
                                <InputLabel>
                                    <Typography variant="body2">Sort by</Typography>
                                </InputLabel>
                                <Select sx={{ fontSize: '0.8rem' }} value={sortOrder} onChange={(e) => handleSortChange(e.target.value)}>
                                    <MenuItem value="newest">Newest</MenuItem>
                                    <MenuItem value="oldest">Oldest</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl style={{ marginTop: sortView ? 15 : 0, marginRight: 10, minWidth: sortView ? 105 : 120, }}>
                                <InputLabel>
                                    <Typography variant="body2">Language</Typography>
                                </InputLabel>
                                <Select sx={{ fontSize: '0.8rem' }} value={selectedLanguage} onChange={handleLanguageChange}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Python (3.8.1)">Python</MenuItem>
                                    <MenuItem value="JavaScript (Node.js 12.14.0)">JavaScript</MenuItem>
                                    <MenuItem value="Bash (5.0.0)">Bash</MenuItem>
                                    <MenuItem value="C (GCC 9.2.0)">C</MenuItem>
                                    <MenuItem value="C++ (GCC 9.2.0)">C++</MenuItem>
                                    <MenuItem value="C# (Mono 6.6.0.161)">C#</MenuItem>
                                    <MenuItem value="Go (1.13.5)">Go</MenuItem>
                                    <MenuItem value="Java (OpenJDK 13.0.1)">Java</MenuItem>
                                    <MenuItem value="Lua (5.3.5)">Lua</MenuItem>
                                    <MenuItem value="PHP (7.4.1)">PHP</MenuItem>
                                    <MenuItem value="Ruby (2.7.0)">Ruby</MenuItem>
                                    <MenuItem value="Rust (1.40.0)">Rust</MenuItem>
                                    <MenuItem value="TypeScript (3.7.4)">TypeScript</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl style={{ marginTop: sortView ? 15 : 0, marginRight: 10, minWidth: sortView ? 105 : 120, }}>
                                <InputLabel>
                                    <Typography variant="body2">Difficulty</Typography>
                                </InputLabel>
                                <Select sx={{ fontSize: '0.8rem' }} value={selectedDifficulty} onChange={handleDifficultyChange}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="easy">Easy</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="hard">Hard</MenuItem>
                                </Select>
                            </FormControl>

                        </div>
                    </div>


                    {displayedChallenges.length === 0 ? (
                        <Typography sx={{ marginTop: 2, marginLeft: 1 }} variant="body1">
                            No challenges to display.
                        </Typography>
                    ) : (
                        <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 20, marginLeft: 20, }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 0 }}>
                                <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                                    <ArrowBackIcon />
                                </IconButton>
                                {currentPage < Math.ceil(filteredChallenges.length / challengesPerPage) && (
                                    <IconButton onClick={handleNextPage} sx={{}}>
                                        <ArrowForwardIcon />
                                    </IconButton>
                                )}
                            </div>
                            {displayedChallenges.map((challenge) => (
                                <li
                                    key={challenge.challengeid}
                                    style={{
                                        margin: '5px',
                                        padding: '20px',
                                        boxShadow: 'none',
                                        borderBottom: '6px solid #dfd9d9',
                                        borderRadius: '10px',
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        backgroundColor: 'white',
                                        height: window.innerWidth < 2000 ? 'auto' : 'auto',
                                    }}
                                >
                                    <div style={{ flexDirection: 'column', display: 'flex', width: '100%' }}>
                                        <div style={{ flex: 1 }}>
                                            <Typography variant="h6" sx={{ marginBottom: 0 }}>
                                                {challenge.title}
                                                {challengeCompletionStatus[challenge.challengeid] && <> <CompleteIcon className='scale-in-center' style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    verticalAlign: 'middle',
                                                    marginBottom:4
                                                }} /></>}
                                            </Typography>
                                           
                                            <Typography variant="body2" sx={{ marginBottom: '5px',  fontFamily: 'Consolas, monospace', }}>
                                                {challenge.language} {renderStars(challenge.difficulty)}
                                            </Typography>

                                           

                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', }}>
                                            {challengeCompletionStatus[challenge.challengeid] && (
                                                <div className='scale-in-center'>
                                                <button
                                                    className="submissionButton"
                                                    style={{ marginRight: 4 }}
                                                    onClick={() => navigate(`/challenge/${challenge.url}/submissions`)}
                                                >
                                                    <div style={{}} className="sign">
                                                        <SubmissionsIcon alt="Submissions Icon" style={{}} />
                                                    </div>
                                                    <div className="text">Submissions</div>
                                                </button>
                                                </div>
                                            )}
                                            <button
                                                className="groupControlButton"
                                                onClick={() => navigate(`/challenge/${challenge.url}`)}
                                            >
                                                <div className="sign">
                                                    <AttemptIcon alt="Attempt Icon" style={{}} />
                                                </div>
                                                <div className="text">Attempt</div>
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityChallenges;
