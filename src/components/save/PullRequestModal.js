import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import cwrcGit from '../../GitServerClient';
import ErrorModal from './ErrorModal';
import StatusModal from './StatusModal';

const PullRequestModal = ({
  cancelCB,
  commitMessage,
  fromFork,
  getDocument,
  isGitLab,
  owner,
  path,
  prTitle,
  repo,
  savedCB,
  serverURL,
  username,
}) => {
  const { t } = useTranslation(['common, save']);

  const [error, setError] = useState(null);
  const [processStatus, setProcessStatus] = useState(null);
  const [prBranch, setPrBranch] = useState('cwrc-writer-pr');

  useEffect(() => {
    cwrcGit.setServerURL(serverURL);
    cwrcGit.useGitLab(isGitLab);
    pullrequest();
  }, []);

  const resetComponent = () => {
    setProcessStatus(null);
    setError(null);
    setPrBranch('cwrc-writer-pr');
  };

  const complete = () => {
    resetComponent();
    savedCB();
  };

  const cancel = () => {
    resetComponent();
    cancelCB();
  };

  const displayError = (error) => {
    let errorMsg = typeof error === 'string' ? error : error.statusText;
    setError(errorMsg);
    setProcessStatus('error');
  };

  const pullrequest = async () => {
    setProcessStatus('saving');

    const document = await getDocument().catch((error) => {
      displayError(error);
      setProcessStatus(null);
    });

    if (!document) return;

    const prHead = fromFork ? `${username}:master` : prBranch;

    const results = await cwrcGit
      .saveAsPullRequest({
        owner,
        repo,
        path,
        content: document,
        branch: prHead,
        message: commitMessage,
        title: prTitle,
        crossRepository: fromFork,
      })
      .catch((error) => {
        if (error.status === 500 || error.status === 404) {
          displayError(t('save:error.repoNoPermission'));
          return;
        }
        setProcessStatus(null);
        displayError(error);
        return;
      });

    if (!results) return;

    complete();
  };

  return (
    <Fragment>
      {error && <ErrorModal cancel={cancel}>{error}</ErrorModal>}
      {processStatus === 'saving' && <StatusModal status={t('save:status.savingFile')} />}
    </Fragment>
  );
};

PullRequestModal.propTypes = {
  cancelCB: PropTypes.func,
  commitMessage: PropTypes.string,
  fromFork: PropTypes.string,
  getDocument: PropTypes.func,
  isGitLab: PropTypes.bool,
  owner: PropTypes.string,
  path: PropTypes.string,
  prTitle: PropTypes.string,
  repo: PropTypes.string,
  savedCB: PropTypes.func,
  serverURL: PropTypes.string,
  username: PropTypes.string,
};

PullRequestModal.defaultProps = {
  commitMessage: 'Saved by CWRC-Writer',
  fromFork: undefined,
  isGitLab: false,
  prTitle: 'Request made from CWRC-Writer',
};

export default PullRequestModal;
