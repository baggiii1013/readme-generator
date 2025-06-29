
<div align="center">

# 🚀 readme-generator

*This reposistory was created with a goal of taking the burden of the developers to create a decent readme's *

---

<!-- TECHNOLOGY BADGES ROW -->
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<!-- STATUS BADGES ROW -->
![License](https://img.shields.io/github/license/baggiii1013/readme-generator?style=for-the-badge&color=blue)
![Stars](https://img.shields.io/github/stars/baggiii1013/readme-generator?style=for-the-badge&logo=github&color=yellow)
![Forks](https://img.shields.io/github/forks/baggiii1013/readme-generator?style=for-the-badge&logo=github&color=green)
![Version](https://img.shields.io/github/v/release/baggiii1013/readme-generator?style=for-the-badge&color=purple)

<!-- ACTIVITY BADGES ROW -->
![Issues](https://img.shields.io/github/issues/baggiii1013/readme-generator?style=for-the-badge&color=red)
![Contributors](https://img.shields.io/github/contributors/baggiii1013/readme-generator?style=for-the-badge&color=orange)
![Last Commit](https://img.shields.io/github/last-commit/baggiii1013/readme-generator?style=for-the-badge&color=brightgreen)

---

**✨ [Live Demo](https://github.com/baggiii1013/readme-generator) • 📚 [Documentation](https://github.com/baggiii1013/readme-generator#readme) • 🐛 [Report Bug](https://github.com/baggiii1013/readme-generator/issues) • 💡 [Request Feature](https://github.com/baggiii1013/readme-generator/issues)**

</div>

### 🎯 About The Project

The `readme-generator` is a Next.js application designed to simplify the process of creating a decent README file for your repository. It uses a combination of technologies such as JavaScript, Next.js, and Tailwind CSS to provide a robust and customizable solution. The project aims to reduce the burden on developers by providing a pre-built solution that can be easily customized to fit their needs.

## 📋 Prerequisites

Before you begin, ensure you have:

1. Node.js 18+ installed
2. A GitHub account
3. A Groq API key
4. A GitHub OAuth App configured

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd readme-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Groq AI API Key
GROQ_API_KEY=your_groq_api_key_here

# GitHub OAuth App credentials
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. Create GitHub OAuth App

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: README Generator
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env.local` file

### 5. Get Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login and create an API key
3. Add it to your `.env.local` file

### 6. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Add the generated secret to your `.env.local` file.

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🎯 How to Use

1. **Sign In**: Click "Sign in with GitHub" to authenticate
2. **Select Repository**: Choose a repository from your GitHub account
3. **Add Custom Instructions** (Optional): Specify any custom requirements
4. **Generate README**: Click the generate button to create your README
5. **Copy & Use**: Copy the generated content and use it in your repository

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth configuration
│   │   ├── generate-readme/        # README generation API
│   │   └── repositories/           # GitHub repositories API
│   ├── components/
│   │   └── AuthProvider.js         # Authentication provider
│   ├── lib/
│   │   └── auth.js                 # NextAuth setup
│   ├── utils/
│   │   ├── aiService.js            # Groq AI integration
│   │   └── githubService.js        # GitHub API integration
│   ├── layout.js                   # Root layout
│   └── page.js                     # Main application page
└── ...
```

## 🔧 API Endpoints

- `GET /api/repositories` - Fetch user's GitHub repositories
- `POST /api/generate-readme` - Generate README content for a repository
- `/api/auth/*` - NextAuth authentication endpoints

## 🎨 Customization

### Adding New AI Models

Edit `src/app/utils/aiService.js` to use different Groq models:

```javascript
"model": "llama3-70b-8192", // or other available models
```

### Modifying README Templates

Customize the AI prompts in `aiService.js` to change the generated README structure and content.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Groq](https://groq.com/) for providing fast AI inference
- [GitHub](https://github.com/) for the excellent API
- [NextAuth.js](https://next-auth.js.org/) for seamless authentication
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling

## 📞 Support

If you have any questions or run into issues, please [create an issue](https://github.com/yourusername/readme-generator/issues) on GitHub.

---

