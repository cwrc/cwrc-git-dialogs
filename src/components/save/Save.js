import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import CreateRepoModal from './CreateRepoModal';
import FileModal from './FileModal';
import ForkModal from './ForkModal';
import PathModal from './PathModal';
import PullRequestModal from './PullRequestModal';
import VerifyModal from './VerifyModal';

const SaveCmp = ({
  getDocument,
  handleClose,
  handlePathChange,
  handleRepoChange,
  handleSaved,
  isGitLab,
  owner,
  path,
  repo,
  serverURL,
  username,
}) => {
  const { t } = useTranslation(['common, save']);

  const [action, setAction] = useState();
  const [currentFile] = useState({ owner, repo, path });
  const [doesUserHavePermission, setDoesUserHavePermission] = useState();
  const [fromFork, setFromFork] = useState();
  const [isRepoVerified, setIsRepoVerified] = useState();
  const [isSaved, setIsSaved] = useState(false);
  const [ownerState, setOwnerState] = useState(owner);
  const [ownerType, setOwnerType] = useState();
  const [pathState, setPathState] = useState(path);
  const [repoState, setRepoState] = useState(repo);
  const [submitted, setSubmitted] = useState(false);
  const [usePR, setUsePR] = useState(false);

  // handles changes passed up from the form
  const handleChange = (name, value) => {
    switch (name) {
      case 'path':
        setPathState(value);
        handlePathChange(value);
        break;
      case 'owner':
        setOwnerState(value);
        handleRepoChange(`${value}/${repoState}`);
        break;
      case 'repo':
        setRepoState(value);
        handleRepoChange(`${ownerState}/${value}`);
        break;
    }
  };

  // action on button click in form
  const saveFile = () => {
    setUsePR(false);
    setSubmitted(true);
  };

  // action on button click in form
  const saveFileAsPR = () => {
    setUsePR(true);
    setSubmitted(true);
  };

  // callback when hit cancel button
  const repoOrPathCancelled = () => {
    setOwnerType(null);
    setDoesUserHavePermission(null);
    setIsRepoVerified(null);
    setSubmitted(false);
  };

  // callback passed to VerifyRepo
  const repoVerified = (result) => {
    setDoesUserHavePermission(result.doesUserHavePermission);
    setOwnerType(result.ownerType);
    setAction(result.action);
    setIsRepoVerified(true);
  };

  const repoCreated = () => {
    setAction('save');
  };

  const forked = (result) => {
    if (result.fromFork) setFromFork(result.fromFork);
    setAction(result.action);
  };

  const saved = () => {
    if (fromFork) return setAction('pr');
    handleSaved(`${ownerState}/${repoState}`, pathState);
    setIsSaved(true);
  };

  const pullRequested = () => {
    handleSaved(`${ownerState}/${repoState}`, pathState);
    setIsSaved(true);
  };

  return (
    <Fragment>
      {isSaved && (
        <Fragment>
          <Modal.Header>{t('save:header')}</Modal.Header>
          <Modal.Body>
            <h4>{t('save:saved.heading')}</h4>
            <p>{t('save:saved.body')}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleClose} bsStyle="success">
              {t('common:ok')}
            </Button>
          </Modal.Footer>
        </Fragment>
      )}
      {!submitted && (
        <PathModal
          handleClose={handleClose}
          handleChange={handleChange}
          handleSaveFile={saveFile}
          handleSaveFileAsPR={saveFileAsPR}
          repo={repo}
          path={path}
          owner={owner}
        />
      )}
      {submitted && !isRepoVerified && (
        <VerifyModal
          cancelCB={repoOrPathCancelled}
          isGitLab={isGitLab}
          owner={ownerState}
          path={pathState}
          repo={repoState}
          serverURL={serverURL}
          usePR={usePR}
          username={username}
          verifiedCB={repoVerified}
        />
      )}
      {submitted && isRepoVerified && action === 'createRepo' && (
        <CreateRepoModal
          cancel={repoOrPathCancelled}
          complete={repoCreated}
          owner={ownerState}
          ownerType={ownerType}
          repo={repoState}
        />
      )}
      {submitted && isRepoVerified && action === 'fork' && (
        <ForkModal
          cancel={repoOrPathCancelled}
          complete={forked}
          doesUserHavePermission={doesUserHavePermission}
          owner={owner}
          repo={repo}
          username={username}
        />
      )}
      {submitted && isRepoVerified && action === 'save' && (
        <FileModal
          cancelCB={repoOrPathCancelled}
          currentFile={currentFile}
          fromFork={fromFork}
          getDocument={getDocument}
          isGitLab={isGitLab}
          owner={ownerState}
          path={pathState}
          repo={repoState}
          savedCB={saved}
          serverURL={serverURL}
          username={username}
        />
      )}
      {submitted && isRepoVerified && action === 'pr' && (
        <PullRequestModal
          cancelCB={repoOrPathCancelled}
          fromFork={fromFork}
          getDocument={getDocument}
          isGitLab={isGitLab}
          owner={ownerState}
          path={pathState}
          repo={repoState}
          savedCB={pullRequested}
          serverURL={serverURL}
          username={username}
        />
      )}
    </Fragment>
  );
};

SaveCmp.propTypes = {
  getDocument: PropTypes.func,
  handleClose: PropTypes.func,
  handlePathChange: PropTypes.func,
  handleRepoChange: PropTypes.func,
  handleSaved: PropTypes.func,
  isGitLab: PropTypes.bool,
  owner: PropTypes.string,
  path: PropTypes.string,
  repo: PropTypes.string,
  serverURL: PropTypes.string,
  username: PropTypes.string,
};

export default SaveCmp;
