import { Octokit } from '@octokit/rest';

export class GitHubService {
    constructor(accessToken) {
        this.octokit = new Octokit({
            auth: accessToken,
        });
    }

    async getUserRepos(username) {
        try {
            const { data } = await this.octokit.rest.repos.listForUser({
                username,
                sort: 'updated',
                per_page: 100,
            });
            return data;
        } catch (error) {
            console.error('Error fetching user repos:', error);
            throw error;
        }
    }

    async getAuthenticatedUserRepos() {
        try {
            const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
                sort: 'updated',
                per_page: 100,
            });
            return data;
        } catch (error) {
            console.error('Error fetching authenticated user repos:', error);
            throw error;
        }
    }

    async getRepoDetails(owner, repo) {
        try {
            const { data } = await this.octokit.rest.repos.get({
                owner,
                repo,
            });
            return data;
        } catch (error) {
            console.error('Error fetching repo details:', error);
            throw error;
        }
    }

    async getRepoContents(owner, repo, path = '') {
        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });
            return data;
        } catch (error) {
            console.error('Error fetching repo contents:', error);
            throw error;
        }
    }

    async createOrUpdateFile(owner, repo, path, content, message, sha = null) {
        try {
            const params = {
                owner,
                repo,
                path,
                message,
                content: Buffer.from(content).toString('base64'),
            };

            if (sha) {
                params.sha = sha;
            }

            const { data } = await this.octokit.rest.repos.createOrUpdateFileContents(params);
            return data;
        } catch (error) {
            console.error('Error creating/updating file:', error);
            throw error;
        }
    }

    async getUser() {
        try {
            const { data } = await this.octokit.rest.users.getAuthenticated();
            return data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async getRepoTree(owner, repo, ref = 'HEAD') {
        try {
            const { data } = await this.octokit.rest.git.getTree({
                owner,
                repo,
                tree_sha: ref,
                recursive: true,
            });
            return data.tree;
        } catch (error) {
            console.error('Error fetching repo tree:', error);
            throw error;
        }
    }

    async getFileContent(owner, repo, path) {
        try {
            const { data } = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path,
            });
            
            if (data.type === 'file' && data.content) {
                // Decode base64 content
                return Buffer.from(data.content, 'base64').toString('utf-8');
            }
            return null;
        } catch (error) {
            console.error(`Error fetching file content for ${path}:`, error);
            throw error;
        }
    }
}

export function createGitHubService(accessToken) {
    return new GitHubService(accessToken);
}
