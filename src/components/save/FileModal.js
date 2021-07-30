import PropTypes from 'prop-types';
import React, { Fragment, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import cwrcGit from '../../GitServerClient';
import ConfirmModal from './ConfirmModal';
import ErrorModal from './ErrorModal';
import StatusModal from './StatusModal';

const FileModal = ({
	branch,
	cancelCB,
	commitMessage,
	currentFile,
	fromFork,
	getDocument,
	isGitLab,
	owner,
	path,
	repo,
	savedCB,
	serverURL,
	username,
}) => {
	const { t } = useTranslation(['common, save']);

	const [error, setError] = useState(null);
	const [processStatus, setProcessStatus] = useState(null);

	useEffect(() => {
		cwrcGit.setServerURL(serverURL);
		cwrcGit.useGitLab(isGitLab);
		fromFork === 'new' ? save() : checkDocumentExists();
	}, []);

	const resetComponent = () => {
		setError(null);
		setProcessStatus(null);
	};

	const cancel = () => {
		resetComponent();
		cancelCB();
	};

	const complete = () => {
		resetComponent();
		savedCB();
	};

	const displayError = (error) => {
		let errorMsg = typeof error === 'string' ? error : error.statusText;
		setError(errorMsg);
		setProcessStatus('error');
	};

	const isCurrentDocument = () => {
		return (
			`${currentFile.owner}/${currentFile.repo}/${currentFile.path}` ===
			`${owner}/${repo}/${path}`
		);
	};

	const checkDocumentExists = async () => {
		setProcessStatus('checkingFile');

		// if request from fork action, check file on forked repo
		if (fromFork) owner = username;

		const file = await cwrcGit
			.getDoc({
				repoName: `${owner}/${repo}`,
				branch: 'master',
				path,
			})
			.catch((error) => error);

		if (file.status === 404) return setProcessStatus('confirmCreate'); //not found: create new?
		if (file.ok === false) return displayError(error); //error

		if (isCurrentDocument()) return save(); // no meed to prompt the user

		setProcessStatus('confirmOverwrite'); // prompt the user if file already exists
	};

	const save = async () => {
		setProcessStatus('saving');

		const document = await getDocument().catch((error) => {
			console.log(error);
		});

		if (!document) return displayError(error);

		// if request from fork action, check file on forked repo
		if (fromFork) owner = username;

		const response = await cwrcGit
			.saveDoc({
				repo: `${owner}/${repo}`,
				path,
				content: document,
				branch,
				message: commitMessage,
			})
			// eslint-disable-next-line no-unused-vars
			.catch((error) => {
				displayError(t('save:error.repoNoPermission'));
			});

		if (!response) return;
		complete();
	};

	return (
		<Fragment>
			{processStatus === 'error' && (
				<ErrorModal cancel={cancel}>
					<h4>{t('common:anErrorOccurred')}</h4>
					<p>{error}</p>
				</ErrorModal>
			)}
			{processStatus === 'checkingFile' && (
				<StatusModal status={t('save:status.checkingFile')} />
			)}
			{processStatus === 'saving' && <StatusModal status={t('save:status.savingFile')} />}
			{processStatus === 'confirmOverwrite' && (
				<ConfirmModal
					title={t('save:fileForm.overwrite.heading')}
					body={t('save:fileForm.overwrite.body')}
					buttonText={t('common:yes')}
					ok={save}
					cancel={cancel}
				/>
			)}
			{processStatus === 'confirmCreate' && (
				<ConfirmModal
					title={t('save:fileForm.createFile.heading')}
					body={t('save:fileForm.createFile.body')}
					buttonText={t('common:create')}
					ok={save}
					cancel={cancel}
				/>
			)}
		</Fragment>
	);
};

FileModal.propTypes = {
	branch: PropTypes.string,
	cancelCB: PropTypes.func,
	commitMessage: PropTypes.string,
	currentFile: PropTypes.object,
	fromFork: PropTypes.string,
	getDocument: PropTypes.func,
	isGitLab: PropTypes.bool,
	owner: PropTypes.string,
	path: PropTypes.string,
	repo: PropTypes.string,
	savedCB: PropTypes.func,
	serverURL: PropTypes.string,
	username: PropTypes.string,
};

FileModal.defaultProps = {
	branch: 'master',
	commitMessage: 'Saved by CWRC-Writer',
	fromFork: undefined,
	isGitLab: false,
};

export default FileModal;
