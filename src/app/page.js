'use client';

import 'highlight.js/styles/github.css';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const { data: session, status } = useSession();
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedReadme, setGeneratedReadme] = useState('');
  const [repoAnalysis, setRepoAnalysis] = useState(null);
  const [useEnhancedAnalysis, setUseEnhancedAnalysis] = useState(true);
  const [previewMode, setPreviewMode] = useState('raw'); // 'raw' or 'rendered'
  const [loading, setLoading] = useState(false);
  const [fetchingRepos, setFetchingRepos] = useState(false);

  useEffect(() => {
    if (session) {
      fetchRepositories();
    }
  }, [session]);

  const fetchRepositories = async () => {
    setFetchingRepos(true);
    try {
      const response = await fetch('/api/repositories');
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories);
      }
    } catch (error) {
      console.error('Failed to fetch repositories:', error);
    } finally {
      setFetchingRepos(false);
    }
  };

  const generateReadme = async () => {
    if (!selectedRepo) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-readme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner: selectedRepo.owner.login,
          repo: selectedRepo.name,
          customPrompt: customPrompt.trim() || null,
          useEnhancedAnalysis: useEnhancedAnalysis,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedReadme(data.content);
        setRepoAnalysis(data.analysis);
      } else {
        console.error('Failed to generate README');
      }
    } catch (error) {
      console.error('Error generating README:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReadme);
    // Show a brief success message
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    button.innerHTML = '✅ Copied!';
    button.style.color = '#10b981';
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.color = '';
    }, 2000);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 README Generator
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create stunning README files for your GitHub repositories with AI
          </p>
          <button
            onClick={() => signIn('github')}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
            </svg>
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">🚀 README Generator</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Repository Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Select Repository</h2>
              
              {fetchingRepos ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading repositories...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedRepo?.id === repo.id
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md transform scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{repo.name}</h3>
                            {repo.private && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                🔒 Private
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {repo.description || 'No description available'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                              {repo.language || 'Unknown'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              ⭐ {repo.stargazers_count}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              🍴 {repo.forks_count}
                            </span>
                          </div>
                        </div>
                        {selectedRepo?.id === repo.id && (
                          <div className="ml-2 text-blue-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Prompt */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Custom Instructions (Optional)</h3>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add specific requirements for your README (e.g., 'Include Docker setup instructions', 'Add API documentation section')"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Analysis Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Analysis Options</h3>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enhancedAnalysis"
                  checked={useEnhancedAnalysis}
                  onChange={(e) => setUseEnhancedAnalysis(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="enhancedAnalysis" className="text-sm text-gray-700">
                  <span className="font-medium">Enhanced Code Analysis</span>
                  <br />
                  <span className="text-gray-500">
                    Analyze repository structure, dependencies, and features for more accurate README generation
                  </span>
                </label>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReadme}
              disabled={!selectedRepo || loading}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
                !selectedRepo || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="animate-pulse">
                    {useEnhancedAnalysis ? 'Analyzing Repository...' : 'Generating...'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  <span>Generate README</span>
                  {useEnhancedAnalysis && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Enhanced</span>}
                </>
              )}
            </button>
          </div>

          {/* Right Panel - Generated README */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Generated README</h2>
                <div className="flex items-center gap-3">
                  {generatedReadme && (
                    <>
                      <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setPreviewMode('raw')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            previewMode === 'raw'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          📝 Raw
                        </button>
                        <button
                          onClick={() => setPreviewMode('rendered')}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            previewMode === 'rendered'
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          👁️ Preview
                        </button>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        📋 Copy
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {generatedReadme ? (
                <div className="border rounded-lg overflow-hidden">
                  {previewMode === 'raw' ? (
                    <div className="p-4 bg-gray-50 h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                        {generatedReadme}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-6 bg-white h-96 overflow-y-auto prose prose-sm max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                          // Custom components for better styling
                          h1: ({children}) => <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b">{children}</h1>,
                          h2: ({children}) => <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-6">{children}</h2>,
                          h3: ({children}) => <h3 className="text-xl font-medium text-gray-700 mb-2 mt-4">{children}</h3>,
                          p: ({children}) => <p className="text-gray-600 mb-3 leading-relaxed">{children}</p>,
                          code: ({inline, children}) => 
                            inline ? 
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code> :
                              <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">{children}</code>,
                          blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 text-blue-900 italic">{children}</blockquote>,
                          ul: ({children}) => <ul className="list-disc list-inside space-y-1 text-gray-600">{children}</ul>,
                          ol: ({children}) => <ol className="list-decimal list-inside space-y-1 text-gray-600">{children}</ol>,
                          a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                        }}
                      >
                        {generatedReadme}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 h-96 flex items-center justify-center">
                  <div>
                    <p className="text-lg mb-2">📝</p>
                    <p>Select a repository and click "Generate README" to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results Panel */}
            {repoAnalysis && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">🔍 Repository Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repoAnalysis.frameworks.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Frameworks Detected</h3>
                      <div className="flex flex-wrap gap-1">
                        {repoAnalysis.frameworks.map((framework, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {framework}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {repoAnalysis.features.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Features Identified</h3>
                      <div className="flex flex-wrap gap-1">
                        {repoAnalysis.features.slice(0, 6).map((feature, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {feature}
                          </span>
                        ))}
                        {repoAnalysis.features.length > 6 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            +{repoAnalysis.features.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Project Info</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Has Tests:</span>
                        <span className={repoAnalysis.hasTests ? "text-green-600" : "text-gray-400"}>
                          {repoAnalysis.hasTests ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Has Docker:</span>
                        <span className={repoAnalysis.hasDocker ? "text-green-600" : "text-gray-400"}>
                          {repoAnalysis.hasDocker ? "✓ Yes" : "✗ No"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Files Analyzed:</span>
                        <span className="text-gray-900">{repoAnalysis.fileAnalysis?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {repoAnalysis.dependencies.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Key Dependencies</h3>
                      <div className="flex flex-wrap gap-1">
                        {repoAnalysis.dependencies.slice(0, 8).map((dep, index) => (
                          <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                            {dep}
                          </span>
                        ))}
                        {repoAnalysis.dependencies.length > 8 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                            +{repoAnalysis.dependencies.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
