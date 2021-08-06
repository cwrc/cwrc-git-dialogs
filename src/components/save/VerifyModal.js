/* eslint-disable quotes */
import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import ErrorModal from './ErrorModal';
import cwrcGit from '../../GitServerClient';

const VerifyModal = ({
  cancelCB,
  isGitLab,
  owner,
  repo,
  serverURL,
  usePR,
  username,
  verifiedCB,
}) => {
  const { t } = useTranslation(['common, save']);

  const [doesRepoExist, setDoesRepoExist] = useState();
  const [doesUserHavePermission, setDoesUserHavePermission] = useState();
  const [error, setError] = useState();
  const [isVerified, setVerified] = useState();
  const [ownerType, setOwnerType] = useState();
  const [processStatus, setProcessStatus] = useState();
  const [action, setAction] = useState();

  useEffect(() => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);
    checkPermission();
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    verifiedCB({ doesRepoExist, doesUserHavePermission, ownerType, action });
    return () => resetComponent();
  }, [isVerified]);

  const resetComponent = () => {
    setDoesRepoExist(null);
    setDoesUserHavePermission(null);
    setError(null);
    setVerified(null);
    setOwnerType(null);
    setProcessStatus(null);
  };

  const checkPermission = async () => {
    setProcessStatus('checking');

    const results = await cwrcGit
      .getPermissionsForGithubUser({ owner, repo, username })
      .catch((error) => console.log(error));

    // Repo doesn't exist
    if (!results) {
      setDoesRepoExist(false);
      if (usePR) {
        displayError(t('save:error.repoNotExistForPR'));
        setProcessStatus(null);
        return;
      }
      checkOwnerType();
      return;
    }

    setDoesRepoExist(true);

    //No permission
    if (results === 'none' || results === 'read') {
      setDoesUserHavePermission(false);
      setAction('fork');
      setVerified(true);
      return;
    }

    setDoesUserHavePermission(true);

    //Use PR in a repository that user doesn't own
    if (usePR) {
      owner === username ? setAction('pr') : setAction('fork');
    } else {
      setAction('save');
    }

    setVerified(true);
  };

  const checkOwnerType = async () => {
    const results = await cwrcGit
      .getDetailsForGithubUser(owner)
      .catch((error) => console.log(error));

    // owner doesn't exists
    if (!results) {
      displayError(t('save:error.ownerNotExist', { owner }));
      setProcessStatus(null);
      return;
    }

    //check owner type
    setOwnerType(results.data.type);
    checkMembership(results.data.type);
  };

  const checkMembership = async (ownerType) => {
    let isMember = false;

    if (ownerType === 'User') {
      //User is owner
      isMember = owner === username;
    } else if (ownerType === 'Organization') {
      //if org, check membership
      const results = await cwrcGit
        .getMembershipForUser({ owner, username })
        .catch(() => setDoesUserHavePermission(false));

      //check membership
      isMember = results?.data.state === 'active' ? true : false;
    }

    setDoesUserHavePermission(isMember);

    // if not a member
    if (!isMember) {
      setProcessStatus('error');
      return;
    }

    setAction('createRepo');
    setVerified(true);
  };

  const cancel = () => {
    resetComponent();
    cancelCB();
  };

  const displayError = (error) => {
    const errorMsg = typeof error === 'string' ? error : error.statusText;
    setError(errorMsg);
  };

  return (
    <Fragment>
      {error && <ErrorModal cancel={cancel}>{error}</ErrorModal>}
      {processStatus === 'checking' && (
        <Fragment>
          <Modal.Header>{t('save:header')}</Modal.Header>
          <Modal.Body>
            <p>{t('save:status.checkingPermissions')}</p>
          </Modal.Body>
        </Fragment>
      )}
      {processStatus === 'error' && !doesRepoExist && !doesUserHavePermission && (
        <ErrorModal cancel={cancel}>
          <p>
            <Trans
              i18nKey="save:error.repoNotExist" // optional -> fallbacks to defaults if not provided
              defaults="The repository <strong>{repo}</strong> you are trying to save does not exists." // optional defaultValue
              values={{ repo }}
              components={{ bold: <strong /> }}
            />
          </p>
          <p>
            {ownerType === 'Organization' ? (
              <Trans
                i18nKey="save:error.notAuthorizeCreateForOtherUser" // optional -> fallbacks to defaults if not provided
                defaults="You must be a member of <strong>{{owner}}</strong> organization to create a repository on their behave." // optional defaultValue
                values={{ owner }}
                components={{ bold: <strong /> }}
              />
            ) : (
              t('save:error.notAuthorizeCreateForOtherUser')
            )}
          </p>
        </ErrorModal>
      )}
    </Fragment>
  );
};

VerifyModal.propTypes = {
  cancelCB: PropTypes.func,
  isGitLab: PropTypes.bool,
  owner: PropTypes.string,
  repo: PropTypes.string,
  serverURL: PropTypes.string,
  usePR: PropTypes.bool,
  username: PropTypes.string,
  verifiedCB: PropTypes.func,
};

export default VerifyModal;
