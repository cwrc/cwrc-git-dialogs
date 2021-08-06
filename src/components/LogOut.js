import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { Button, Modal } from 'react-bootstrap';

const LogOutDialog = ({ handleClose }) => {
  const doLogOut = () => {
    Cookies.remove('cwrc-token');
    window.location.reload();
  };

  return (
    <Fragment>
      <Modal.Header>CWRC-Writer Logout</Modal.Header>
      <Modal.Body>
        <Fragment>
          <p>
            You are about to log out of CWRC-Writer (i.e. revoke the GitHub authentication). Any
            unsaved changes will be lost.
          </p>
          <p>Do you want to continue?</p>
        </Fragment>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose}>No, Cancel and Return</Button>
        <Button bsStyle="success" onClick={doLogOut}>
          Yes, Log Out
        </Button>
      </Modal.Footer>
    </Fragment>
  );
};

LogOutDialog.propTypes = {
  handleClose: PropTypes.func,
};

export default LogOutDialog;
