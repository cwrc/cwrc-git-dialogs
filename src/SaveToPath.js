import React, {Fragment, Component} from 'react'
import cwrcGit from './GitServerClient.js';
import { Modal, Button } from 'react-bootstrap';

const ErrorModal = ({cancel, error}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>An error occurred</h4>
			<p>{error}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button
				onClick={cancel}
				bsStyle="success"
			>Ok</Button>
		</Modal.Footer>
	</Fragment>
)

const ConfirmModal = ({cancel, title, body, ok}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<h4>{title}</h4>
			<p>{body}</p>
		</Modal.Body>
		<Modal.Footer>
			<Button onClick={cancel}>
				Cancel
			</Button>
			<Button
				onClick={ok}
				bsStyle="success"
			>Yes</Button>
		</Modal.Footer>
	</Fragment>
)

const StatusModal = ({status}) => (
	<Fragment>
		<Modal.Header>Save to Repository</Modal.Header>
		<Modal.Body>
			<p>{status}</p>
		</Modal.Body>
	</Fragment>
)

class SaveToPath extends Component {
	constructor(props) {
		super(props);

		this.state = {
			fileHasBeenSaved: false,
			doesPathExist: null,
			error: null,
			checkingPath: null,
			pathHasBeenChecked: null,
			saving: null,
			branch: 'master',
			commitMessage: 'Saved by CWRC-Writer',
			prTitle: 'Request made from CWRC-Writer',
			prBranch: 'cwrc-writer-pr'
		}
	}

	resetComponent = () => this.setState({
		fileHasBeenSaved: false,
		doesPathExist: null,
		error: null,
		checkingPath: null,
		pathHasBeenChecked: null,
		saving: null,
		branch: 'master',
		commitMessage: 'Saved by CWRC-Writer',
		prTitle: 'Request made from CWRC-Writer',
		prBranch: 'cwrc-writer-pr'
	})

	componentDidMount() {
		cwrcGit.setServerURL(this.props.serverURL);
		cwrcGit.useGitLab(this.props.isGitLab);

		if (this.props.usePR) {
			this.save();
		} else {
			this.setState({checkingPath: true})
			cwrcGit.getDoc(this.getFullRepoPath(), 'master', this.props.path).then(
				(result)=>{
					this.setState({
						checkingPath: false,
						doesPathExist: true,
						pathHasBeenChecked: true,
						saving: false
					})
					return result;
				},
				(error)=>{
					error.status === 404 ? this.setState({
						checkingPath: false,
						doesPathExist: false,
						pathHasBeenChecked: true,
						saving: false
					}): this.displayError(error)
					return error
				})
		}
	}

	getFullRepoPath() {
		return this.props.owner+'/'+this.props.repo;
	}

	complete = () => {
		this.resetComponent()
		this.props.savedCB()
	}

	cancel = () => {
		this.resetComponent()
		this.props.cancelCB()
	}

	displayError = (error) => {
		let errorMsg;
		if (typeof error === 'string') {
			errorMsg = error;
		} else {
			errorMsg = error.statusText;
		}
		this.setState({error: errorMsg, saving: false})
	}

	save = () => {
		this.setState({saving: true});
		this.props.getDocument().then((document) => {
			this.props.usePR ?
				cwrcGit.saveAsPullRequest(this.getFullRepoPath(), this.props.path, document, this.state.prBranch, this.state.commitMessage, this.state.prTitle).then(
					(result) => this.complete(),
					(error) => {
						if (error.status === 500) {
							error.statusText = 'You do not have pull request permissions for the selected repository. Try saving to another repository you have pull request privileges for.'
						}
						this.displayError(error)
					}
				) :
				cwrcGit.saveDoc(this.getFullRepoPath(), this.props.path, document, this.state.branch, this.state.commitMessage).then(
					(result) => this.complete(),
					(error) => {
						if (error.status === 404) {
							error.statusText = 'You do not have writing permissions for the selected repository. Try saving as a pull request or save to another repository you have writing privileges for.'
						}
						this.displayError(error)
					}
				)
			})

	}

	render() {
		const {pathHasBeenChecked, doesPathExist, error, checkingPath, saving} = this.state

		if (error) {
			return <ErrorModal
				error = {error}
				cancel = {this.cancel.bind(this)}/>
		} else if (saving) {
			return <StatusModal status='Saving your file...' />
		} else if (checkingPath) {
			return <StatusModal status='Checking your file...' />
		} else if (doesPathExist) {
			return <ConfirmModal
				title='File Exists'
				body='This file exists - would you like to overwrite it?'
				buttonText='Yes'
				ok = {this.save.bind(this)}
				cancel = {this.cancel.bind(this)}
			/>
		} else if (pathHasBeenChecked) {
			return <ConfirmModal
				title='Create File'
				body="This file doesn't yet exist, would you like to create it?"
				buttonText='Create'
				ok ={this.save.bind(this)}
				cancel = {this.cancel.bind(this)}
			/>
		} else {
			return null;
		}
	}
}

export default SaveToPath
