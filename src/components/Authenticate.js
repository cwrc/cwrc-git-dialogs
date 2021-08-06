import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';

import cwrcGit from '../GitServerClient';

export const isAuthenticated = () => Cookies.get('cwrc-token') !== undefined;

const AuthenticateDialog = ({ isGitLab, onUserAuthentication, serverURL }) => {
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState(undefined);
  const [user, setUser] = useState(undefined);

  const doGetUserInfo = async () => {
    setAuthenticating(true);

    const response = await cwrcGit.getInfoForAuthenticatedUser().catch((error) => {
      setAuthenticating(false);
      setError(error);
    });

    if (!response) return setError(true);

    const userData = {
      userUrl: response.html_url,
      userName: response.name,
      userId: response.login,
    };

    setUser(userData);
    setAuthenticating(false);
    setError(undefined);

    onUserAuthentication(userData);
  };

  useEffect(() => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);
    if (isAuthenticated() && user === undefined) doGetUserInfo();
  }, []);

  return (
    <Fragment>
      {authenticating ? (
        <Fragment>
          <Modal.Header>Authenticate with GitHub</Modal.Header>
          <Modal.Body>
            <p>Authenticating...</p>
          </Modal.Body>
        </Fragment>
      ) : (
        <Fragment>
          <Modal.Header>Authenticate with GitHub</Modal.Header>
          <Modal.Body>
            {error ? (
              <Alert bsStyle="danger">
                An error occurred during authentication. Click below to try authenticating again.
              </Alert>
            ) : (
              <Fragment>
                <p>
                  You must first authenticate through GitHub to allow CWRC-Writer to make calls on
                  your behalf.
                </p>
                <p>
                  CWRC does not keep any of your GitHub information. The GitHub token issued by
                  GitHub is not stored on a CWRC server, but is only submitted as a{' '}
                  <a href="https://jwt.io/" rel="noopener noreferrer" target="_blank">
                    JSON Web Token
                  </a>{' '}
                  for each request you make.
                </p>
                <p>
                  Click below to authenticate with GitHub. Once you have completed the process you
                  will be returned to CWRC-Writer.
                </p>
              </Fragment>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="success" href={`${serverURL}/authenticate`}>
              Authenticate with GitHub
            </Button>
          </Modal.Footer>
        </Fragment>
      )}
    </Fragment>
  );
};

AuthenticateDialog.propTypes = {
  isGitLab: PropTypes.bool,
  onUserAuthentication: PropTypes.func,
  serverURL: PropTypes.string,
};

export { AuthenticateDialog };
