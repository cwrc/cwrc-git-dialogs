import PropTypes from 'prop-types';
import React, { Fragment, useState } from 'react';
import {
	Modal,
	Button,
	FormGroup,
	Checkbox,
	ControlLabel,
	FormControl,
	HelpBlock,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import cwrcGit from '../../GitServerClient';
import ErrorModal from './ErrorModal';
import StatusModal from './StatusModal';

const CreateRepoModal = ({ cancel, complete, owner, ownerType, repo }) => {
	const { t } = useTranslation(['common, save']);

	const [error, setError] = useState(null);
	const [isPrivate, setIsPrivate] = useState(false);
	const [processStatus, setProcessStatus] = useState(null);
	const [repoDesc, setRepoDesc] = useState(t('save:createRepoForm.description.defaultValue'));

	const handleDescriptionChange = (e) => setRepoDesc(e.target.value);
	const handlePrivateChange = (e) => setIsPrivate(e.target.checked);

	const displayError = (error) => {
		const errorMsg = typeof error === 'string' ? error : error.statusText;
		setError(errorMsg);
	};

	const createRepo = async () => {
		setProcessStatus('creatingRepo');
		let newRepo;

		if (ownerType === 'User') {
			newRepo = await cwrcGit
				.createRepo({ owner, repo, repoDesc, isPrivate })
				.catch((error) => displayError(error));
		} else if (ownerType === 'Organization') {
			newRepo = await cwrcGit
				.createOrgRepo({ org: owner, repo, repoDesc, isPrivate })
				.catch((error) => displayError(error));
		}
		if (newRepo) complete();
	};

	return (
		<Fragment>
			{error ? (
				<ErrorModal cancel={cancel}>{error}</ErrorModal>
			) : processStatus === 'creatingRepo' ? (
				<StatusModal status={t('save:status.creatingNewRepo')} />
			) : (
				<Fragment>
					<Modal.Header>{t('save:header')}</Modal.Header>
					<Modal.Body>
						<h4>{t('save:createRepoForm.heading')}</h4>
						<p>{t('save:createRepoForm.wouldYouLikeToCreate')}</p>
						<FormGroup controlId="repoTitle">
							<ControlLabel>{t('save:createRepoForm.repo.label')}</ControlLabel>
							<FormControl type="text" value={repo} disabled />
						</FormGroup>
						<FormGroup controlId="repoDesc">
							<ControlLabel style={{ marginTop: '10px' }}>
								{t('save:createRepoForm.description.label')}
							</ControlLabel>
							<FormControl
								type="text"
								placeholder={t('save:createRepoForm.description.placeholder')}
								value={repoDesc}
								onChange={handleDescriptionChange}
							/>
							<HelpBlock>{t('save:createRepoForm.description.helpText')}</HelpBlock>
						</FormGroup>
						<Checkbox checked={isPrivate} onChange={handlePrivateChange}>
							{t('save:createRepoForm.makePrivate')}
						</Checkbox>
					</Modal.Body>
					<Modal.Footer>
						<Button onClick={cancel}>{t('common:cancel')}</Button>
						<Button onClick={createRepo} bsStyle="success">
							{t('common:create')}
						</Button>
					</Modal.Footer>
				</Fragment>
			)}
		</Fragment>
	);
};

CreateRepoModal.propTypes = {
	cancel: PropTypes.func,
	complete: PropTypes.func,
	owner: PropTypes.string,
	ownerType: PropTypes.string,
	repo: PropTypes.string,
};

export default CreateRepoModal;
