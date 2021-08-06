import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { Fragment, useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import './i18next';

import { AuthenticateDialog, isAuthenticated } from './components/Authenticate';
import LoadDialog from './components/load/Load';
import LogOutDialog from './components/LogOut';
import SaveCmp from './components/save/Save';
import Splash from './components/Splash';

import cwrcGit from './GitServerClient';

import './css/bootstrap.less';

let _writer;
let _dialogId;
let _renderId;

let _user;
let _repo;
let _path;
let _serverURL = '';

const setServerURL = (url) => (_serverURL = url);
const getUserInfo = () => _user;

const initDialogs = (writer) => {
  _writer = writer;
  _dialogId = writer.getUniqueId('git-dialogs-');
  _renderId = writer.getUniqueId('git-dialogs-');
  writer.dialogManager.getDialogWrapper().append(`<div id=${_renderId} />`);
};

const getDocumentURI = () => {
  if (_path === undefined || _repo === undefined) {
    console.warn('cwrc-git-dialogs: no repo or path set!');
    return window.location.href;
  }

  let path = _path;
  if (path.charAt(0) === '/') {
    console.warn('cwrc-git-dialogs: path started with /');
    path = path.substring(1);
  }
  return `https://raw.githubusercontent.com/${_repo}/master/${path}`;
};

// eslint-disable-next-line no-unused-vars
const loadWrap = (writer, shouldOverwrite = false) => {
  initDialogs(writer);
  ReactDOM.render(
    <GitDialog action="load" confirmLoad={true} dialogId={_dialogId} serverURL={_serverURL} writer={_writer} />,
    document.querySelector(`#${_renderId}`)
  );
  document.querySelector(`#${_dialogId}`).classList.add('cwrc');
};

const saveWrap = (writer) => {
  initDialogs(writer);
  ReactDOM.render(
    <GitDialog action="save" dialogId={_dialogId} serverURL={_serverURL} writer={_writer} />,
    document.querySelector(`#${_renderId}`)
  );
  document.querySelector(`#${_dialogId}`).classList.add('cwrc');
};

const logOutWrap = (writer) => {
  initDialogs(writer);
  ReactDOM.render(
    <GitDialog action="logout" dialogId={_dialogId} serverURL={_serverURL} writer={_writer} />,
    document.querySelector(`#${_renderId}`)
  );
  document.querySelector(`#${_dialogId}`).classList.add('cwrc');
};

const GitDialog = ({ action, confirmLoad, dialogId, serverURL, writer }) => {
  const [confirmLoadState, setConfirmLoadState] = useState(confirmLoad);
  const [error, setError] = useState(undefined);
  const [isUserAuthenticated, SetIsUserAuthenticated] = useState(false);
  const [repo, setRepoState] = useState(_repo);
  const [path, setPathState] = useState(_path);
  const [splashShown, setSplashShown] = useState(false);
  const [show, setShow] = useState(true);
  const [user, setUser] = useState(_user);

  const [isGitLab] = useState(false);

  useEffect(() => {
    if (user === undefined) SetIsUserAuthenticated(isAuthenticated());

    if (action === 'load' && writer.isDocLoaded === false && repo === undefined && path === undefined) {
      let docInfo = getDocumentInfoFromLocation();
      if (docInfo !== null) {
        setRepo(docInfo.repo);
        setPath(docInfo.path);
      }
    }

    if (action === 'save' && repo === undefined && path === undefined) {
      if (user && user.userId) {
        setRepo(user.userId);
      } else {
        setRepo(''); // shouldn't end up here ever
      }
      setPath('');
    }
  }, []);

  useEffect(() => {
    // console.log(user);
  }, [user, confirmLoadState]);

  const handleAuthentication = (userInfo) => {
    _user = userInfo; // updte outside variable;
    setUser(userInfo);
  };

  const getDocument = () => {
    return new Promise((resolve) => {
      writer.getDocumentString((content) => {
        resolve(content);
      });
    });
  };

  const setPath = (value) => {
    if (value !== undefined) {
      // path should not start with /
      if (value.charAt(0) === '/') value = value.substring(1);
    }
    _path = value;
    setPathState(value);
  };

  const setRepo = (value) => {
    _repo = value;
    setRepoState(value);
  };

  const getDocumentInfoFromLocation = () => {
    const doc = queryString.parse(window.location.search);
    if (doc.githubRepo && doc.githubPath) {
      return { repo: doc.githubRepo, path: doc.githubPath };
    }
    return null;
  };

  const setDocumentInfo = (repo_, path_, updateLocation = true) => {
    setRepo(repo_);
    setPath(path_);
    if (updateLocation) {
      const githubDoc = queryString.stringify({ githubRepo: repo_, githubPath: path_ });
      window.history.replaceState({}, undefined, `?${githubDoc}`);
    }
  };

  const handleFileSelect = async (repo, path) => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);

    const response = await cwrcGit
      .getDoc({
        repoName: repo,
        branch: 'master',
        path,
      })
      .catch(() => {
        // console.log(error);
        setDocumentInfo(undefined, undefined);
        setError(`There was an error loading the document from: ${repo}/${path}`);
      });

    if (response !== undefined) {
      setDocumentInfo(repo, path);
      handleClose();
      setTimeout(() => writer.setDocument(response.doc), 50);
    }
  };

  const handleFileUpload = (doc) => {
    setDocumentInfo(undefined, undefined);
    handleClose();
    setTimeout(() => writer.setDocument(doc), 50);
  };

  const handleSaved = (repo, path) => {
    setDocumentInfo(repo, path);
    writer.event('documentSaved').publish();
  };

  const handleConfirmLoadState = () => {
    setConfirmLoadState(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  return (
    <Fragment>
      {show &&
        (error ? (
          <Modal id={dialogId} show={true} animation={false}>
            <Modal.Header closeButton={false}>Error</Modal.Header>
            <Modal.Body>
              <p>{error}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => setError(undefined)}>Ok</Button>
            </Modal.Footer>
          </Modal>
        ) : user === undefined ? (
          !splashShown && !isUserAuthenticated ? (
            <Modal id={dialogId} show={true} animation={false}>
              <Splash onContinue={() => setSplashShown(true)} />
            </Modal>
          ) : (
            <Modal id={dialogId} show={true} animation={false}>
              <AuthenticateDialog
                isGitLab={isGitLab}
                onUserAuthentication={handleAuthentication}
                serverURL={serverURL}
              />
            </Modal>
          )
        ) : action === 'load' ? (
          !writer.isDocLoaded && repo !== undefined && path !== undefined ? (
            <Modal id={dialogId} show={true} animation={false}>
              <Modal.Header closeButton={false}>Load Document from URL</Modal.Header>
              <Modal.Body>
                <p>
                  The following document is specified in the URL:
                  <br />
                  <strong>
                    {repo}/{path}
                  </strong>
                </p>
                <p>Would you like to load it?</p>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => setDocumentInfo(undefined, undefined)}>No, Load a Different Document</Button>
                <Button bsStyle="success" onClick={() => handleFileSelect(repo, path)}>
                  Yes, Load this Document
                </Button>
              </Modal.Footer>
            </Modal>
          ) : writer.isDocLoaded && confirmLoadState ? (
            <Modal id={dialogId} show={true} animation={false}>
              <Modal.Header onHide={handleClose}>Existing Document</Modal.Header>
              <Modal.Body>
                <p>
                  You have a document loaded in the editor. Would you like to load a new document, and close your
                  existing document?
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={handleClose}>Return to Existing Document</Button>
                <Button bsStyle="success" onClick={handleConfirmLoadState}>
                  Continue to Load New Document
                </Button>
              </Modal.Footer>
            </Modal>
          ) : (
            <Modal id={dialogId} show={true} bsSize="large" animation={false}>
              <LoadDialog
                handleClose={handleClose}
                isDocLoaded={writer.isDocLoaded}
                isGitLab={isGitLab}
                onFileSelect={handleFileSelect}
                onFileUpload={handleFileUpload}
                serverURL={serverURL}
                user={user}
              />
            </Modal>
          )
        ) : action === 'save' ? (
          <Modal id={dialogId} show={true} animation={false}>
            <SaveCmp
              getDocument={getDocument}
              handleClose={handleClose}
              handlePathChange={setPath}
              handleRepoChange={setRepo}
              handleSaved={handleSaved}
              isGitLab={isGitLab}
              owner={repo ? repo.split('/')[0] : ''}
              path={path}
              repo={repo && repo.split('/')[1] !== undefined ? repo.split('/')[1] : ''}
              serverURL={serverURL}
              username={user.userId}
            />
          </Modal>
        ) : (
          action === 'logout' && (
            <Modal id={dialogId} show={true} animation={false}>
              <LogOutDialog handleClose={handleClose} />
            </Modal>
          )
        ))}
    </Fragment>
  );
};

GitDialog.propTypes = {
  action: PropTypes.string,
  confirmLoad: PropTypes.bool,
  dialogId: PropTypes.string,
  serverURL: PropTypes.string,
  writer: PropTypes.any,
};

GitDialog.defaultProps = {
  confirmLoad: false,
};

export default {
  getDocumentURI,
  getUserInfo,
  // useGitLab,
  load: loadWrap,
  logOut: logOutWrap,
  save: saveWrap,
  setServerURL,
};
