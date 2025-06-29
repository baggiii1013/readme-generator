import Groq from 'groq-sdk';
import { createGitHubService } from './githubService';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Helper function to analyze file content and extract insights
function analyzeFileContent(fileName, content) {
    const insights = {
        type: 'unknown',
        framework: null,
        dependencies: [],
        features: [],
        isConfigFile: false,
        isTestFile: false,
        isDocumentation: false
    };

    const lowerFileName = fileName.toLowerCase();
    
    // Identify file types
    if (lowerFileName.includes('package.json')) {
        insights.type = 'package-config';
        insights.isConfigFile = true;
        try {
            const packageData = JSON.parse(content);
            insights.dependencies = [
                ...Object.keys(packageData.dependencies || {}),
                ...Object.keys(packageData.devDependencies || {})
            ];
            
            // Detect frameworks
            if (insights.dependencies.includes('react')) insights.framework = 'React';
            if (insights.dependencies.includes('next')) insights.framework = 'Next.js';
            if (insights.dependencies.includes('vue')) insights.framework = 'Vue.js';
            if (insights.dependencies.includes('angular')) insights.framework = 'Angular';
            if (insights.dependencies.includes('express')) insights.framework = 'Express.js';
            if (insights.dependencies.includes('fastify')) insights.framework = 'Fastify';
            if (insights.dependencies.includes('django')) insights.framework = 'Django';
            if (insights.dependencies.includes('flask')) insights.framework = 'Flask';
        } catch (e) {
            console.warn('Could not parse package.json');
        }
    }
    
    if (lowerFileName.includes('dockerfile') || lowerFileName.includes('docker-compose')) {
        insights.type = 'docker-config';
        insights.features.push('Docker containerization');
    }
    
    if (lowerFileName.includes('readme') || lowerFileName.includes('.md')) {
        insights.type = 'documentation';
        insights.isDocumentation = true;
    }
    
    if (lowerFileName.includes('test') || lowerFileName.includes('spec')) {
        insights.isTestFile = true;
        insights.features.push('Testing suite');
    }
    
    // Configuration files
    const configFiles = ['eslint', 'prettier', 'babel', 'webpack', 'vite', 'rollup', 'tsconfig', 'tailwind'];
    if (configFiles.some(config => lowerFileName.includes(config))) {
        insights.isConfigFile = true;
    }
    
    // Analyze content for features
    if (content) {
        const contentLower = content.toLowerCase();
        
        // Database detection
        if (contentLower.includes('mongodb') || contentLower.includes('mongoose')) {
            insights.features.push('MongoDB database');
        }
        if (contentLower.includes('postgresql') || contentLower.includes('pg') || contentLower.includes('psql')) {
            insights.features.push('PostgreSQL database');
        }
        if (contentLower.includes('mysql') || contentLower.includes('mariadb')) {
            insights.features.push('MySQL database');
        }
        if (contentLower.includes('redis')) {
            insights.features.push('Redis caching');
        }
        
        // Authentication
        if (contentLower.includes('jwt') || contentLower.includes('jsonwebtoken')) {
            insights.features.push('JWT authentication');
        }
        if (contentLower.includes('passport') || contentLower.includes('oauth')) {
            insights.features.push('OAuth authentication');
        }
        if (contentLower.includes('bcrypt') || contentLower.includes('hash')) {
            insights.features.push('Password hashing');
        }
        
        // API features
        if (contentLower.includes('graphql') || contentLower.includes('apollo')) {
            insights.features.push('GraphQL API');
        }
        if (contentLower.includes('swagger') || contentLower.includes('openapi')) {
            insights.features.push('API documentation');
        }
        if (contentLower.includes('cors')) {
            insights.features.push('CORS support');
        }
        
        // Frontend features
        if (contentLower.includes('typescript')) {
            insights.features.push('TypeScript support');
        }
        if (contentLower.includes('tailwind') || contentLower.includes('bootstrap')) {
            insights.features.push('CSS framework');
        }
        if (contentLower.includes('pwa') || contentLower.includes('service-worker')) {
            insights.features.push('Progressive Web App');
        }
        
        // Testing
        if (contentLower.includes('jest') || contentLower.includes('mocha') || contentLower.includes('vitest')) {
            insights.features.push('Unit testing');
        }
        if (contentLower.includes('cypress') || contentLower.includes('playwright')) {
            insights.features.push('E2E testing');
        }
        
        // DevOps
        if (contentLower.includes('github actions') || contentLower.includes('ci/cd')) {
            insights.features.push('CI/CD pipeline');
        }
        if (contentLower.includes('kubernetes') || contentLower.includes('k8s')) {
            insights.features.push('Kubernetes deployment');
        }
    }
    
    return insights;
}

// Analyze repository structure and content
async function analyzeRepository(accessToken, owner, repo) {
    try {
        const githubService = createGitHubService(accessToken);
        const analysis = {
            structure: {},
            features: new Set(),
            techStack: new Set(),
            frameworks: new Set(),
            dependencies: new Set(),
            hasTests: false,
            hasDocker: false,
            hasCICD: false,
            databaseType: null,
            mainLanguage: null,
            fileAnalysis: []
        };

        // Get repository tree
        const tree = await githubService.getRepoTree(owner, repo);
        
        // Analyze important files
        const importantFiles = tree.filter(item => {
            const fileName = item.path.toLowerCase();
            return fileName.includes('package.json') || 
                   fileName.includes('dockerfile') ||
                   fileName.includes('docker-compose') ||
                   fileName.includes('requirements.txt') ||
                   fileName.includes('composer.json') ||
                   fileName.includes('pom.xml') ||
                   fileName.includes('cargo.toml') ||
                   fileName.includes('go.mod') ||
                   fileName.includes('.yml') ||
                   fileName.includes('.yaml') ||
                   fileName.includes('.github/workflows') ||
                   fileName.includes('readme') ||
                   fileName.includes('license') ||
                   fileName.includes('test') ||
                   fileName.includes('spec') ||
                   fileName.endsWith('.py') ||
                   fileName.endsWith('.js') ||
                   fileName.endsWith('.ts') ||
                   fileName.endsWith('.tsx') ||
                   fileName.endsWith('.jsx');
        });

        // Check for CI/CD files
        const cicdFiles = tree.filter(item => {
            const path = item.path.toLowerCase();
            return path.includes('.github/workflows') || 
                   path.includes('.gitlab-ci') ||
                   path.includes('jenkins') ||
                   path.includes('azure-pipelines') ||
                   path.includes('.circleci');
        });
        
        if (cicdFiles.length > 0) {
            analysis.hasCICD = true;
            analysis.features.add('CI/CD pipeline');
        }

        // Check for Docker files specifically
        const dockerFiles = tree.filter(item => {
            const path = item.path.toLowerCase();
            return path.includes('dockerfile') || 
                   path.includes('docker-compose') ||
                   path.includes('.dockerignore');
        });
        
        if (dockerFiles.length > 0) {
            analysis.hasDocker = true;
            analysis.features.add('Docker containerization');
        }

        // Check for test files
        const testFiles = tree.filter(item => {
            const path = item.path.toLowerCase();
            return path.includes('test') || 
                   path.includes('spec') ||
                   path.includes('__test__') ||
                   path.includes('.test.') ||
                   path.includes('.spec.');
        });
        
        if (testFiles.length > 0) {
            analysis.hasTests = true;
            analysis.features.add('Testing suite');
        }

        // Analyze up to 20 most important files
        for (const file of importantFiles.slice(0, 20)) {
            try {
                if (file.type === 'blob' && file.size < 100000) { // Only analyze files smaller than 100KB
                    const content = await githubService.getFileContent(owner, repo, file.path);
                    const fileInsights = analyzeFileContent(file.path, content);
                    
                    analysis.fileAnalysis.push({
                        path: file.path,
                        insights: fileInsights
                    });
                    
                    // Aggregate insights
                    if (fileInsights.framework) analysis.frameworks.add(fileInsights.framework);
                    fileInsights.dependencies.forEach(dep => analysis.dependencies.add(dep));
                    fileInsights.features.forEach(feature => analysis.features.add(feature));
                    
                    if (fileInsights.isTestFile) analysis.hasTests = true;
                    if (fileInsights.type === 'docker-config') analysis.hasDocker = true;
                }
            } catch (error) {
                console.warn(`Could not analyze file ${file.path}:`, error.message);
            }
        }

        return {
            ...analysis,
            features: Array.from(analysis.features),
            techStack: Array.from(analysis.techStack),
            frameworks: Array.from(analysis.frameworks),
            dependencies: Array.from(analysis.dependencies)
        };
        
    } catch (error) {
        console.error('Error analyzing repository:', error);
        return null;
    }
}

// Helper functions for enhanced personalization
function determineProjectType(repoData, analysis) {
    const language = repoData.language?.toLowerCase() || '';
    const name = repoData.name?.toLowerCase() || '';
    const description = repoData.description?.toLowerCase() || '';
    const frameworks = analysis?.frameworks || [];
    const dependencies = analysis?.dependencies || [];
    
    // Web applications
    if (frameworks.includes('Next.js')) return 'Next.js Application';
    if (frameworks.includes('React')) return 'React Application';
    if (frameworks.includes('Vue.js')) return 'Vue.js Application';
    if (frameworks.includes('Angular')) return 'Angular Application';
    
    // Backend services
    if (frameworks.includes('Express.js')) return 'Express.js API';
    if (frameworks.includes('Fastify')) return 'Fastify API';
    if (frameworks.includes('Django')) return 'Django Application';
    if (frameworks.includes('Flask')) return 'Flask Application';
    
    // Based on language
    if (language === 'javascript' || language === 'typescript') {
        if (dependencies.includes('react')) return 'React Application';
        if (dependencies.includes('express')) return 'Node.js API';
        return 'JavaScript Application';
    }
    if (language === 'python') {
        if (dependencies.includes('django')) return 'Django Application';
        if (dependencies.includes('flask')) return 'Flask Application';
        if (dependencies.includes('fastapi')) return 'FastAPI Application';
        return 'Python Application';
    }
    if (language === 'java') return 'Java Application';
    if (language === 'go') return 'Go Application';
    if (language === 'rust') return 'Rust Application';
    if (language === 'c++') return 'C++ Application';
    
    // Based on name/description patterns
    if (name.includes('api') || description.includes('api')) return 'API Service';
    if (name.includes('cli') || description.includes('command')) return 'CLI Tool';
    if (name.includes('lib') || description.includes('library')) return 'Library';
    if (name.includes('bot') || description.includes('bot')) return 'Bot Application';
    if (name.includes('website') || description.includes('website')) return 'Website';
    if (name.includes('app') || description.includes('application')) return 'Application';
    
    return 'Software Project';
}

function generateUsageExamples(repoData, analysis, projectType) {
    const language = repoData.language?.toLowerCase() || '';
    const frameworks = analysis?.frameworks || [];
    
    if (projectType.includes('React') || projectType.includes('Next.js')) {
        return 'Web Component/Application Usage';
    }
    if (projectType.includes('API') || projectType.includes('Express')) {
        return 'API Endpoint Usage';
    }
    if (projectType.includes('CLI')) {
        return 'Command Line Usage';
    }
    if (projectType.includes('Library')) {
        return 'Library Import Usage';
    }
    if (language === 'python') {
        return 'Python Module Usage';
    }
    if (language === 'javascript' || language === 'typescript') {
        return 'JavaScript Module Usage';
    }
    
    return 'General Usage';
}

function generateInstallationSteps(repoData, analysis, projectType) {
    const language = repoData.language?.toLowerCase() || '';
    const frameworks = analysis?.frameworks || [];
    const dependencies = analysis?.dependencies || [];
    
    if (dependencies.includes('package.json') || language === 'javascript' || language === 'typescript') {
        return 'npm/yarn installation';
    }
    if (language === 'python') {
        if (dependencies.includes('requirements.txt')) return 'pip install from requirements';
        if (dependencies.includes('setup.py')) return 'pip install from setup.py';
        return 'pip install from source';
    }
    if (language === 'java') {
        return 'Maven/Gradle build';
    }
    if (language === 'go') {
        return 'go install';
    }
    if (language === 'rust') {
        return 'cargo install';
    }
    
    return 'Manual installation';
}

function getDetectedTechBadges(analysis, repoData) {
    const badges = [];
    const language = repoData.language?.toLowerCase() || '';
    const frameworks = Array.from(analysis?.frameworks || []);
    const dependencies = Array.from(analysis?.dependencies || []);
    
    // Primary language badge
    if (language === 'javascript') {
        badges.push('![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)');
    } else if (language === 'typescript') {
        badges.push('![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)');
    } else if (language === 'python') {
        badges.push('![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)');
    } else if (language === 'java') {
        badges.push('![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)');
    } else if (language === 'go') {
        badges.push('![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)');
    } else if (language === 'rust') {
        badges.push('![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)');
    } else if (language === 'php') {
        badges.push('![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)');
    }
    
    // Framework badges
    if (frameworks.includes('React')) {
        badges.push('![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)');
    }
    if (frameworks.includes('Next.js')) {
        badges.push('![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)');
    }
    if (frameworks.includes('Vue.js')) {
        badges.push('![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vue.js&logoColor=4FC08D)');
    }
    if (frameworks.includes('Angular')) {
        badges.push('![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)');
    }
    if (frameworks.includes('Express.js')) {
        badges.push('![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)');
    }
    if (frameworks.includes('Django')) {
        badges.push('![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)');
    }
    if (frameworks.includes('Flask')) {
        badges.push('![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)');
    }
    
    // Database badges
    if (dependencies.includes('mongodb') || dependencies.includes('mongoose')) {
        badges.push('![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)');
    }
    if (dependencies.includes('postgresql') || dependencies.includes('pg')) {
        badges.push('![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)');
    }
    if (dependencies.includes('mysql')) {
        badges.push('![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)');
    }
    if (dependencies.includes('redis')) {
        badges.push('![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)');
    }
    
    // Tool badges
    if (dependencies.includes('tailwindcss') || dependencies.includes('tailwind')) {
        badges.push('![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)');
    }
    if (dependencies.includes('bootstrap')) {
        badges.push('![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)');
    }
    if (analysis?.hasDocker) {
        badges.push('![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)');
    }
    
    return badges.join('\n');
}

function generateFeatureTable(analysis, repoData) {
    const features = [];
    const detectedFeatures = Array.from(analysis?.features || []);
    
    // Core features based on analysis
    if (repoData.language) {
        features.push({
            icon: '🔧',
            name: `${repoData.language} Implementation`,
            description: `Built with ${repoData.language}`,
            status: '✅ Complete'
        });
    }
    
    if (analysis?.frameworks?.size > 0) {
        const frameworks = Array.from(analysis.frameworks);
        features.push({
            icon: '⚡',
            name: 'Modern Framework',
            description: `Powered by ${frameworks.join(', ')}`,
            status: '✅ Complete'
        });
    }
    
    if (detectedFeatures.includes('Testing suite')) {
        features.push({
            icon: '🧪',
            name: 'Testing Suite',
            description: 'Comprehensive test coverage',
            status: '✅ Complete'
        });
    }
    
    if (analysis?.hasDocker) {
        features.push({
            icon: '🐳',
            name: 'Docker Support',
            description: 'Containerized deployment',
            status: '✅ Complete'
        });
    }
    
    if (analysis?.hasCICD) {
        features.push({
            icon: '🔄',
            name: 'CI/CD Pipeline',
            description: 'Automated testing and deployment',
            status: '✅ Complete'
        });
    }
    
    if (detectedFeatures.some(f => f.includes('database'))) {
        features.push({
            icon: '💾',
            name: 'Database Integration',
            description: 'Persistent data storage',
            status: '✅ Complete'
        });
    }
    
    if (detectedFeatures.some(f => f.includes('authentication'))) {
        features.push({
            icon: '🔐',
            name: 'Authentication',
            description: 'Secure user authentication',
            status: '✅ Complete'
        });
    }
    
    // Add some common features if we have fewer than 4
    if (features.length < 4) {
        features.push({
            icon: '📱',
            name: 'Responsive Design',
            description: 'Works on all devices',
            status: '✅ Complete'
        });
        
        if (features.length < 4) {
            features.push({
                icon: '🎨',
                name: 'Modern UI',
                description: 'Clean and intuitive interface',
                status: '✅ Complete'
            });
        }
    }
    
    return features;
}

// Enhanced README generation with Groq AI
export async function generateEnhancedReadme(repoData, accessToken, customPrompt = null) {
    try {
        // Analyze the repository structure and content
        const repoAnalysis = await analyzeRepository(accessToken, repoData.owner.login, repoData.name);
        
        // Get additional repository insights
        const githubService = createGitHubService(accessToken);
        const repoTree = await githubService.getRepoTree(repoData.owner.login, repoData.name);
        
        // Analyze project structure for better personalization
        const projectType = determineProjectType(repoData, repoAnalysis);
        const usageExamples = generateUsageExamples(repoData, repoAnalysis, projectType);
        const installationSteps = generateInstallationSteps(repoData, repoAnalysis, projectType);
        const techBadges = getDetectedTechBadges(repoAnalysis, repoData);
        const featureTable = generateFeatureTable(repoAnalysis, repoData);
        
        const prompt = `You are a world-class technical writer creating a comprehensive, highly personalized README.md file. Generate a COMPLETE, professional, visually stunning README based on deep code analysis:

## Repository Information:
- **Name**: ${repoData.name}
- **Description**: ${repoData.description || 'No description provided'}
- **Primary Language**: ${repoData.language || 'Not specified'}
- **Topics**: ${repoData.topics?.join(', ') || 'None'}
- **License**: ${repoData.license?.name || 'Not specified'}
- **Stars**: ${repoData.stargazers_count || 0}
- **Forks**: ${repoData.forks_count || 0}
- **Owner**: ${repoData.owner.login}
- **Repository URL**: ${repoData.html_url}
- **Homepage**: ${repoData.homepage || 'Not specified'}
- **Project Type**: ${projectType}
- **Created**: ${new Date(repoData.created_at).toLocaleDateString()}
- **Last Updated**: ${new Date(repoData.updated_at).toLocaleDateString()}

## Deep Code Analysis:
${repoAnalysis ? `
- **Frameworks**: ${repoAnalysis.frameworks.join(', ') || 'None detected'}
- **Key Dependencies**: ${repoAnalysis.dependencies.slice(0, 20).join(', ') || 'None detected'}
- **Features Detected**: ${repoAnalysis.features.join(', ') || 'None detected'}
- **Has Testing**: ${repoAnalysis.hasTests ? 'Yes' : 'No'}
- **Has Docker**: ${repoAnalysis.hasDocker ? 'Yes' : 'No'}
- **Has CI/CD**: ${repoAnalysis.hasCICD ? 'Yes' : 'No'}
- **File Count**: ${repoTree.length || 0} files analyzed
` : 'Repository analysis not available'}

## Personalization Context:
- **Project Type**: ${projectType}
- **Installation Method**: ${installationSteps}
- **Usage Pattern**: ${usageExamples}

## Pre-generated Components:
### Technology Badges:
${techBadges}

### Feature Table Data:
${featureTable.map(f => `- ${f.icon} **${f.name}**: ${f.description} (${f.status})`).join('\n')}

${customPrompt ? `
## Custom Requirements:
${customPrompt}
` : ''}

## CRITICAL REQUIREMENTS - FOLLOW EXACTLY:

🚨 **STRICT EXCLUSION RULES:**
- NEVER mention Docker/Containerization unless hasDocker is true
- NEVER mention Testing unless hasTests is true  
- NEVER mention CI/CD unless hasCICD is true
- NEVER mention API documentation unless APIs are actually detected
- NEVER include features that don't exist in the codebase
- ONLY include sections for features that are actually present

🎨 **HEADER STRUCTURE - USE THIS EXACT FORMAT:**

<div align="center">

# 🚀 ${repoData.name}

*${repoData.description || 'A modern, feature-rich application built with cutting-edge technologies'}*

---

<!-- TECHNOLOGY BADGES ROW -->
${getDetectedTechBadges(repoAnalysis, repoData)}

<!-- STATUS BADGES ROW -->
![License](https://img.shields.io/github/license/${repoData.owner.login}/${repoData.name}?style=for-the-badge&color=blue)
![Stars](https://img.shields.io/github/stars/${repoData.owner.login}/${repoData.name}?style=for-the-badge&logo=github&color=yellow)
![Forks](https://img.shields.io/github/forks/${repoData.owner.login}/${repoData.name}?style=for-the-badge&logo=github&color=green)
![Version](https://img.shields.io/github/v/release/${repoData.owner.login}/${repoData.name}?style=for-the-badge&color=purple)

<!-- ACTIVITY BADGES ROW -->
![Issues](https://img.shields.io/github/issues/${repoData.owner.login}/${repoData.name}?style=for-the-badge&color=red)
![Contributors](https://img.shields.io/github/contributors/${repoData.owner.login}/${repoData.name}?style=for-the-badge&color=orange)
![Last Commit](https://img.shields.io/github/last-commit/${repoData.owner.login}/${repoData.name}?style=for-the-badge&color=brightgreen)

---

**✨ [Live Demo](${repoData.homepage || repoData.html_url}) • 📚 [Documentation](${repoData.html_url}#readme) • 🐛 [Report Bug](${repoData.html_url}/issues) • 💡 [Request Feature](${repoData.html_url}/issues)**

</div>

🎨 **CONTENT STRUCTURE REQUIREMENTS:**

### Required Sections (ONLY include if relevant):
1. **📑 Table of Contents** (always include)
2. **🎯 About The Project** (always include - write 2-3 detailed paragraphs explaining what the project does, its purpose, and value proposition)
3. **✨ Key Features** (ONLY if features detected - use the pre-generated feature table data above formatted as a table)
4. **🛠️ Built With** (use pre-generated technology badges, organize by categories)
5. **🚀 Getting Started** (complete installation guide based on ${installationSteps})
6. **💻 Usage** (real code examples based on ${usageExamples})
7. **🧪 Testing** (ONLY if hasTests is true)
8. **🐳 Docker** (ONLY if hasDocker is true)
9. **🔄 CI/CD** (ONLY if hasCICD is true)
10. **🤝 Contributing** (detailed guidelines)
11. **⭐ Show Your Support** (support section)
12. **📄 License** (license information)

### ✨ Key Features Section Format (use this EXACT structure):
<div align="center">

| Feature | Description | Status |
|---------|-------------|--------|
${featureTable.map(f => `| ${f.icon} **${f.name}** | ${f.description} | ${f.status} |`).join('\n')}

</div>

### 🛠️ Built With Section Format (organize badges by category):
<div align="center">

#### Core Technologies
[Use pre-generated technology badges here]

#### Development Tools  
[Add relevant tool badges if detected]

</div>

🎨 **COMPLETE CONTENT EXAMPLES:**

### About Section Requirements:
Write 2-3 detailed paragraphs explaining:
- What the project does and its main purpose
- Key technologies and architecture decisions
- Target audience and use cases
- Unique value proposition and benefits
- Problem it solves or need it addresses

### Getting Started Section Requirements:
Include step-by-step instructions for:
- Prerequisites and system requirements
- Installation commands (use ${installationSteps} context)
- Environment setup and configuration
- First-time setup procedures
- Verification steps

### Usage Section Requirements:
Provide concrete examples:
- Basic usage scenarios (context: ${usageExamples})
- Code snippets with proper syntax highlighting
- Command-line examples where applicable
- Configuration examples
- Common use cases and workflows

### Contributing Section Requirements:
- Fork and clone instructions
- Development setup
- Code style guidelines
- Pull request process
- Issue reporting guidelines
- Community guidelines

**IMPORTANT FINAL REQUIREMENTS:**
- NEVER use "..." or placeholder text anywhere
- Write complete, detailed sections with real content
- Only include sections for features that actually exist
- Use the pre-generated technology badges exactly as provided
- Use the pre-generated feature table data exactly as provided
- Create professional, engaging, and informative content
- Focus on accuracy and completeness
- Ensure all badge URLs use the correct repository owner/name
- Make the content specific to this repository, not generic

Generate a COMPLETE README with full content for all included sections. Every section must be fully detailed and never truncated.`;

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert developer and designer who creates exceptional README.md files with stunning visual designs. You specialize in creating beautiful animated badge layouts and only include sections for features that actually exist in the repository. You NEVER mention features that don't exist. Your README files are known for their beautiful badge arrangements, professional layouts, and accurate content."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "llama3-8b-8192",
            "temperature": 0.6,
            "max_tokens": 4000,
            "top_p": 0.9,
            "stream": false
        });

        return {
            content: chatCompletion.choices[0].message.content,
            analysis: repoAnalysis
        };
    } catch (error) {
        console.error('Error with enhanced Groq API:', error);
        throw error;
    }
}

export async function generateCustomReadme(customPrompt, repoData) {
    try {
        const prompt = `Generate a modern, visually stunning README.md file with this custom request: "${customPrompt}"

Repository context:
- Name: ${repoData.name}
- Description: ${repoData.description || 'No description provided'}
- Language: ${repoData.language || 'Not specified'}
- Owner: ${repoData.owner.login}
- URL: ${repoData.html_url}

Create a comprehensive README that includes a centered header with multiple badge rows, detailed sections, and professional formatting. Focus on visual appeal with proper badge arrangements and only include features that exist or are specifically requested.`;

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system", 
                    "content": "You are an expert developer and designer who creates exceptional README.md files with stunning animated badge layouts. You specialize in modern, visually stunning documentation that uses beautiful multi-row badge arrangements and NEVER includes sections for features that don't exist. Your README files are known for their gorgeous badge designs and strict content accuracy."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "qwen/qwen3-32b",
            "temperature": 0.6,
            "max_tokens": 40000,
            "top_p": 0.9,
            "stream": false
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error with Groq API:', error);
        throw error;
    }
}

export async function generateReadme(repoData) {
    try {
        const prompt = `Generate a modern and visually stunning README.md file for this GitHub repository:

## Repository Information:
- Name: ${repoData.name}
- Description: ${repoData.description || 'No description provided'}
- Language: ${repoData.language || 'Not specified'}
- Topics: ${repoData.topics?.join(', ') || 'None'}
- License: ${repoData.license?.name || 'Not specified'}
- Stars: ${repoData.stargazers_count || 0}
- Forks: ${repoData.forks_count || 0}
- Owner: ${repoData.owner.login}
- Repository URL: ${repoData.html_url}

Create a comprehensive, professional README with:
- Centered header with multiple badge rows
- Technology badges based on the repository language
- Status badges for license, stars, forks
- Activity badges for issues, contributors, last commit
- Detailed sections with proper formatting
- Professional presentation and visual appeal

Only include sections that are relevant to this specific repository and use the correct badge URLs with the repository owner and name.`;

        const chatCompletion = await groq.chat.completions.create({
            "messages": [
                {
                    "role": "system",
                    "content": "You are a world-class developer and UI/UX designer who creates exceptional README.md files with stunning animated badge layouts. You specialize in creating visually appealing badge arrangements and NEVER include sections for features that don't exist in the repository. Your README files are known for their beautiful badge designs and strict adherence to only including relevant content."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "model": "qwen/qwen3-32b",
            "temperature": 0.6,
            "max_tokens": 40000,
            "top_p": 0.9,
            "stream": false
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error with Groq API:', error);
        throw error;
    }
}
