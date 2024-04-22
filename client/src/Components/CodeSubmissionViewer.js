import React, { useState, useEffect } from 'react';
import {FormControl, InputLabel, Select, MenuItem, IconButton, Input, Typography,} from '@mui/material';
import { ArrowBackIos as ArrowBackIosIcon, ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';

const CodeSubmissionViewer = ({ submissions }) => {

  const [currentIndex, setCurrentIndex] = useState({});
  const [userSubmissions, setUserSubmissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    if (submissions.length > 0) {
      const initialUsers = submissions.reduce((acc, group) => {
        acc[group[0].username] = 0;
        return acc;
      }, {});
      setCurrentIndex(initialUsers);
      setUserSubmissions(
        submissions.reduce((acc, group) => {
          acc[group[0].username] = group;
          return acc;
        }, {})
      );
    }
  }, [submissions]);

  const handleNextClick = (username) => {
    setCurrentIndex((prevIndexes) => ({
      ...prevIndexes,
      [username]: (prevIndexes[username] + 1) % userSubmissions[username].length,
    }));
  };

  const handlePrevClick = (username) => {
    setCurrentIndex((prevIndexes) => ({
      ...prevIndexes,
      [username]: (prevIndexes[username] - 1 + userSubmissions[username].length) % userSubmissions[username].length,
    }));
  };

  const toggleSortOrder = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === 'newest' ? 'oldest' : 'newest'));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsernames = Object.keys(userSubmissions).filter((username) =>
    username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsernames = sortOrder === 'newest' ? filteredUsernames.reverse() : filteredUsernames;

  return (
    <div>
      <div style={{ marginBottom: 10, marginTop: 15, marginLeft: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          type="text"
          placeholder="Search by username"
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ marginRight: 10, padding: '5px', textAlign: 'left', flex: 1 }}
        />
        <FormControl style={{ marginTop: 10, marginBottom: 15, marginLeft: 'auto' }}>
          <InputLabel htmlFor="sort-order">Sort Order</InputLabel>
          <Select
            value={sortOrder}
            onChange={toggleSortOrder}
            label="Sort Order"
            inputProps={{
              name: 'sort-order',
              id: 'sort-order',
            }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
          </Select>
        </FormControl>
      </div>


      {sortedUsernames.map((username) => (
        <div
          style={{
            marginBottom: 10,
            boxShadow: 'none',
            borderBottom: '6px solid #dfd9d9',
            borderRadius: '10px',
            padding: 2,
            backgroundColor: 'white',
          }}
          key={username}
        >
          {userSubmissions[username].slice().reverse().map((submission, index) => (
            <div key={index} style={{ padding: 15, display: index === currentIndex[username] ? 'block' : 'none', marginBottom: 15 }}>
              <Typography variant='h6'>{username}{index === 0 ? "'s Final Submission" : "'s Submission"}</Typography>
              <Typography variant='body2'>Time Submitted: {submission.time_submitted}</Typography>
              <pre style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f5f5f5', padding: '10px' }}>{submission.code}</pre>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  backgroundColor: submission.iscorrect ? '#CFFFCC' : '#FFCCCC',
                  padding: '10px',
                }}
              >
                {submission.code_output}
              </pre>
              <div>
                {userSubmissions[username] && userSubmissions[username].length > 1 && (
                  <>
                    <IconButton onClick={() => handlePrevClick(username)} disabled={currentIndex[username] === 0}>
                      <ArrowBackIosIcon />
                    </IconButton>
                    <IconButton onClick={() => handleNextClick(username)} disabled={currentIndex[username] === userSubmissions[username].length - 1}>
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CodeSubmissionViewer;
