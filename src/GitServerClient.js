import Cookies from 'js-cookie';

let baseUrl = '';
const setServerURL = (url) => (baseUrl = url);

let isGitLab = false;
const useGitLab = (useIt) => (isGitLab = useIt);

const callCWRCGitWithToken = async (url, config) => {
	const requestOptions = Object.assign(
		{
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		},
		config
	);

	const theJWT = Cookies.get('cwrc-token');
	if (theJWT) requestOptions.headers['cwrc-token'] = theJWT;

	const response = await fetch(url, requestOptions).catch((err) => {
		return new Response(null, {
			status: 500,
			statusText: err,
		});
	});

	if (!response.ok) return Promise.reject(response);

	return await response.json();
};

const getDetailsForGithubUser = async (user) => {
	return await callCWRCGitWithToken(`${baseUrl}/users/${user}`);
};

const getDetailsForOrg = async (org) => {
	return await callCWRCGitWithToken(`${baseUrl}/orgs/${org}`);
};

const getMembershipForUser = async ({ owner, username }) => {
	return await callCWRCGitWithToken(`${baseUrl}/orgs/${owner}/memberships/${username}`);
};

const createRepo = async ({ owner, repo, description, isPrivate }) => {
	let url = `${baseUrl}/user/repos`;
	if (isGitLab) url = `${baseUrl}/projects?name=${repo}`;

	return await callCWRCGitWithToken(url, {
		method: 'POST',
		body: JSON.stringify({ owner, repo, isPrivate, description }),
	});
};

const createOrgRepo = async ({ org, repo, description, isPrivate }) => {
	return await callCWRCGitWithToken(`${baseUrl}/orgs/${org}/repos`, {
		method: 'POST',
		body: JSON.stringify({ repo, isPrivate, description }),
	});
};

const getReposForGithubUser = async (githubName, page = 1, per_page = 20) => {
	let url = `${baseUrl}/users/${githubName}/repos`;
	if (isGitLab) url = `${baseUrl}/users/${githubName}/projects`;

	let parameters = '?';
	parameters += `page=${page}`;
	parameters += `&per_page=${per_page}`;

	return await callCWRCGitWithToken(url + parameters);
};

const getReposForAuthenticatedGithubUser = async (page, per_page, affiliation) => {
	if (!Cookies.get('cwrc-token')) throw new Error();

	let url = `${baseUrl}/user/repos`;
	if (isGitLab) url = `${baseUrl}/projects`;

	let parameters = '?';
	parameters += `page=${page}`;
	parameters += `&per_page=${per_page}`;
	parameters += `&affiliation=${affiliation}`;

	return await callCWRCGitWithToken(url + parameters);
};

const getRepoContents = async (githubName) => {
	let url = `${baseUrl}/repos/${githubName}`;
	if (isGitLab) url = `${baseUrl}/projects/'${githubName}/repository/tree`;

	return await callCWRCGitWithToken(url);
};

const getRepoContentsByDrillDown = async (githubName) => {
	let url = `${baseUrl}/repos/${githubName}/full`;
	if (isGitLab) url = `${baseUrl}/projects/${githubName}/full`;

	return await callCWRCGitWithToken(url);
};

// repoName here is the combined owner/repo, e.g., 'jchartrand/someRepoName'
const getDoc = async ({ repoName, branch, path }) => {
	let url = `${baseUrl}/repos/${repoName}/contents`;
	if (isGitLab) {
		url = `${baseUrl}/projects/${repoName}/repository/files/${encodeURI(path)}/raw?ref=master`;
	}

	let parameters = '?';
	parameters += `branch=${branch}`;
	parameters += `&path=${path}`;

	return await callCWRCGitWithToken(url + parameters);
};

const getInfoForAuthenticatedUser = async () => {
	if (!Cookies.get('cwrc-token')) throw new Error();

	let url = `${baseUrl}/users`;
	if (isGitLab) url = `${baseUrl}/users`;

	return await callCWRCGitWithToken(url).then((response) => response.data);
};

const getPermissionsForGithubUser = async ({ owner, repo, username }) => {
	const url = `${baseUrl}/repos/${owner}/${repo}/collaborators/${username}/permission`;
	return await callCWRCGitWithToken(url)
		.then((response) => {
			return response.data.permission;
		})
		.catch((error) => {
			if (error.status === 404) return null;
			return 'none';
		});
};

// sha is optional.
// If provided, the doc will be updated against that SHA.
// If not, and there is an existing doc, the file will be updated against the latest SHA in the repo.
const saveDoc = async ({ repo, path, content, branch, message, sha }) => {
	let url = `${baseUrl}/repos/${repo}/doc`;
	if (isGitLab) url = `${baseUrl}/projects/${repo}/repository/files/${path}`;

	return await callCWRCGitWithToken(url, {
		method: 'PUT',
		body: JSON.stringify({ path, content, branch, message, sha }),
	});
};

const saveAsPullRequest = async ({
	owner,
	repo,
	path,
	content,
	branch,
	message,
	title,
	crossRepository,
	sha,
}) => {
	return await callCWRCGitWithToken(`${baseUrl}/repos/${owner}/${repo}/pr`, {
		method: 'POST',
		body: JSON.stringify({
			path,
			content,
			branch,
			message,
			title,
			crossRepository,
			sha,
		}),
	});
};

/**
 * Create a fork for the authenticated user.
 * See {@link https://octokit.github.io/rest.js/v18#repos-create-fork}
 * @param {String} owner The owner
 * @param {String} repo The repo
 * @param {String} [organization] The organization
 * @returns {Promise}
 */
const createFork = async ({ owner, repo, organization }) => {
	const body = JSON.stringify({ organization }) || {};
	return await callCWRCGitWithToken(`${baseUrl}/repos/${owner}/${repo}/forks`, {
		method: 'POST',
		body,
	});
};

const getTemplates = async () => {
	return await callCWRCGitWithToken(`${baseUrl}/templates`).then((response) => response.data);
};

const searchCode = async (query, per_page, page) => {
	let url = `${baseUrl}/search/code`;
	if (isGitLab) url = `${baseUrl}/search?scope=projects`;

	let parameters = '?';
	parameters += `q=${query}`;
	parameters += `&page=${page}`;
	parameters += `&per_page=${per_page}`;

	return await callCWRCGitWithToken(url + parameters).catch(() => {
		return 'none';
	});
};

// not currently used
const searchRepos = async (query, per_page, page) => {
	let parameters = '?';
	parameters += `q=${query}`;
	parameters += `&page=${page}`;
	parameters += `&per_page=${per_page}`;

	return await callCWRCGitWithToken(`${baseUrl}/search/repositories` + parameters).catch(() => {
		return 'none';
	});
};

export default {
	createFork,
	createOrgRepo,
	createRepo,
	getDetailsForGithubUser,
	getDetailsForOrg,
	getDoc,
	getInfoForAuthenticatedUser,
	getMembershipForUser,
	getPermissionsForGithubUser,
	getRepoContents,
	getRepoContentsByDrillDown,
	getReposForAuthenticatedGithubUser,
	getReposForGithubUser,
	getTemplates,
	saveAsPullRequest,
	saveDoc,
	searchCode,
	searchRepos,
	setServerURL,
	useGitLab,
};
