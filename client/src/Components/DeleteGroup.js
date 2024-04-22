import React from 'react';
import { Container, Paper, Typography, IconButton } from '@mui/material';
import baseURL from './config';
import CloseIcon from '@mui/icons-material/Close';

const DeleteGroup = ({  group, toggleDeletePopUp, updater, updateState, updateManageGroup }) => {

  const handleUpdate = () => {updateState(updater + 1)};
  const handleManageGroup = () => {updateManageGroup('')}

  const deleteGroup = async () => {
    try {
      const removal = { "groupName": group }
      const response = await fetch(`${baseURL}/delete/group`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(removal),
        credentials: 'include',

      });

      await response.json()
      handleUpdate()
      handleManageGroup()
      toggleDeletePopUp(false)
    } catch (error) {
      console.error('Error deleting group', error);
    }
  }

  return (
    <Container style={{ backdropFilter: 'blur(3px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, flexDirection: 'column' }} maxWidth="false">
      <div className={`scale-in-center`}>
        <Paper
          style={{ width: 300, padding: '10px', display: 'flex', borderRadius: '0px', backgroundColor: 'purple', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px' }}>
          <Typography sx={{ color: 'white', marginTop: 1, marginBottom: 1, marginLeft: 3 }} variant='h6' style={{ flex: 1 }}>
            Delete, {group}?
          </Typography>
          <IconButton sx={{ color: 'white', marginRight: 1 }} onClick={toggleDeletePopUp} >
            <CloseIcon />
          </IconButton>
        </Paper>

        <Paper style={{ display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '0px', zIndex: 10000, flexDirection: 'column', height: 100, width: 300, borderBottomRightRadius: '10px', borderBottomLeftRadius: '10px', borderBottom: '6px solid #dfd9d9', boxShadow: 'none'}}>
          <Container>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 , justifyContent:'center',alignItems:'center'}}>
              <button style = {{backgroundColor:'red', width:200}} onClick={deleteGroup} className="actionButton">
                <div className="text">Confirm Deletion</div>
              </button>
            </div>
          </Container>
        </Paper>
      </div>
    </Container>
  )
};

export default DeleteGroup;
