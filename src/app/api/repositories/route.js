import { auth } from '@/app/lib/auth';
import { createGitHubService } from '@/app/utils/githubService';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const githubService = createGitHubService(session.accessToken);
        const repos = await githubService.getAuthenticatedUserRepos();
        
        // Filter and format repository data
        const formattedRepos = repos.map(repo => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            topics: repo.topics,
            license: repo.license,
            updated_at: repo.updated_at,
            private: repo.private,
            owner: {
                login: repo.owner.login,
                avatar_url: repo.owner.avatar_url
            }
        }));

        return NextResponse.json({ repositories: formattedRepos });

    } catch (error) {
        console.error('Error fetching repositories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repositories' }, 
            { status: 500 }
        );
    }
}
