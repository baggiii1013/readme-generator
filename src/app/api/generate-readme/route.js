import { auth } from '@/app/lib/auth';
import { generateCustomReadme, generateEnhancedReadme, generateReadme } from '@/app/utils/aiService';
import { createGitHubService } from '@/app/utils/githubService';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const session = await auth();
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { owner, repo, customPrompt, useEnhancedAnalysis = true } = body;

        if (!owner || !repo) {
            return NextResponse.json({ error: 'Owner and repo are required' }, { status: 400 });
        }

        // Get repository data from GitHub
        const githubService = createGitHubService(session.accessToken);
        const repoData = await githubService.getRepoDetails(owner, repo);

        // Generate README content using AI with enhanced analysis
        let readmeContent;
        let analysisData = null;
        
        if (useEnhancedAnalysis) {
            try {
                const result = await generateEnhancedReadme(repoData, session.accessToken, customPrompt);
                readmeContent = result.content;
                analysisData = result.analysis;
            } catch (error) {
                console.warn('Enhanced analysis failed, falling back to basic generation:', error);
                // Fallback to basic generation
                if (customPrompt) {
                    readmeContent = await generateCustomReadme(customPrompt, repoData);
                } else {
                    readmeContent = await generateReadme(repoData);
                }
            }
        } else {
            // Use basic generation
            if (customPrompt) {
                readmeContent = await generateCustomReadme(customPrompt, repoData);
            } else {
                readmeContent = await generateReadme(repoData);
            }
        }

        return NextResponse.json({ 
            content: readmeContent,
            analysis: analysisData,
            repository: {
                name: repoData.name,
                description: repoData.description,
                url: repoData.html_url,
                language: repoData.language,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count
            }
        });

    } catch (error) {
        console.error('Error generating README:', error);
        return NextResponse.json(
            { error: 'Failed to generate README' }, 
            { status: 500 }
        );
    }
}
