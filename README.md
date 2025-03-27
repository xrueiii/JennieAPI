# Jennie API: Mastering API Integration with AI  

## 📚 Table of Contents

- [🧪 Test Instructions](#test-instructions)
  - [🚀 Extension Features You Can Test](#extension-features-you-can-test)
- [📖 Project Story](#project-story)
  - [💡 Inspiration](#inspiration)
  - [⚙️ What It Does](#what-it-does)
  - [🧱 How We Built It](#how-we-built-it)
  - [🧗 Challenges We Ran Into](#challenges-we-ran-into)
  - [🏆 Accomplishments That We're Proud Of](#accomplishments-that-were-proud-of)
  - [📚 What We Learned](#what-we-learned)
  - [🚀 What's Next for Jennie API](#whats-next-for-jennie-api)



# Test Instructions

### 1. Clone the Repository

Go to the [JennieAPI GitHub Repository](https://github.com/xrueiii/JennieAPI/tree/main) and run:

```bash
git clone https://github.com/xrueiii/JennieAPI.git
```
## 🧪 Test Instructions

### 2. Install Extension Dependencies

Navigate to the `/JennieAPI-Extension` folder and install required packages:

```bash
cd JennieAPI-Extension
yarn install
```
### 3. Launch Extension in VS Code
Open the `extension.ts file and press:

`F5` on Windows

`fn` + `F5` on Mac

This will start a virtual VS Code environment for extension development.

### 4. Open the API Project
Inside the virtual environment, open the `/JennieAPI` folder.

### 5. Install Web Testing Project Dependencies
Navigate to `/Extension-Test-Web` and install dependencies for both frontend and backend:

```bash
cd Extension-Test-Web/frontend
yarn install

cd ../backend
yarn install
```
### 6. Start Backend Server
In `/Extension-Test-Web/backend`, run:

```bash
yarn dev
```
If successful, the backend server will start on http://localhost:3001

### 7. Start Frontend Test App
In `/Extension-Test-Web/frontend`, run:

```bash
yarn start
```
If successful, the app will open on http://localhost:3000, showing a basic to-do list UI.
## 🚀 Extension Features You Can Test

### 🔧 Generate API JSON from Folder
- Go to the `/backend` folder.
- Right-click the `/api` folder in the Explorer panel.
- Select `JennieAPI: Generate API JSON from Folder`.
- The extension will scan all files and generate `api.json` at the project root.

### 🤖 Suggest API Endpoints
- While editing code, type your desired API function name.
- Right-click at the end of the line (or double-tap on Mac).
- Select `JennieAPI: Suggest API Endpoints`.
- Jennie will detect intent and insert a ready-to-use `fetch()` call for the correct endpoint.

### 🌐 Open API Connector Panel
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Win/Linux).
- Open the Command Palette and search:

```makefile
JennieAPI: Open API Connector
```
- Select it to open a testing panel for trying your APIs directly in VS Code.


Need more information? 
Please checkout the README.md in both `/JennieAPI-Extensions` and `/Extension-test-web` for more detail instruction.

# Project Story

## Inspiration  
APIs are the backbone of modern applications, yet working with them is often frustrating. Developers waste hours manually documenting APIs, writing fetch code, and debugging integration issues. We wanted to change that. Inspired by the need for a **faster, smarter, and more seamless API workflow**, we built **Jennie API**—an AI-powered solution that done the above all within VS Code.  

## What It Does  
Jennie API **streamlines API development** by integrating key features directly into the developer’s workflow:  
- **Automated API Documentation** – Instantly generates accurate API documentation using AI.  
- **Fetch Code Generation** – Produces ready-to-use API requests, reducing manual effort.  
- **In-Editor API Testing** – Enables developers to test APIs inside VS Code, eliminating the need for external tools.  
- **Natural Language API Matching** – Finds the correct API endpoint based on simple descriptions.  

## How We Built It  
We leveraged **Azure OpenAI** to analyze API structures and generate documentation and fetch code dynamically. The **VS Code extension** was developed using **TypeScript**, while the backend, built with **Node.js and Express**, ensures efficient API processing. We use well-structured prompt engineering to ensure the functionality.  

## Challenges We Ran Into   
- **VS Code UI Integration** – Ensuring a smooth and intuitive user interface within VS Code was a major challenge.  
- **Optimizing Performance** – Balancing speed, accuracy, and usability without overwhelming system resources.  

## Accomplishments That We're Proud Of  
- Successfully integrating **AI-powered automation** into the API development process.  
- Creating a **developer-friendly extension** that enhances productivity and reduces errors.  
- Streamlining API testing, documentation, and integration into **one seamless workflow**.  

## What We Learned  
Through this project, we gained **deep insights into API management, AI-driven automation, and developer workflows**. We learned that even small inefficiencies—like outdated docs or minor request errors—can create significant delays. By focusing on **usability, accuracy, and automation**, we developed a tool that truly improves API development.  

## What's Next for Jennie API  
Jennie API is just the beginning. We plan to:  
- **Expand AI Capabilities** – Improve API understanding and optimize auto-generated fetch requests.  
- **Support More API Formats** – Enhance compatibility with GraphQL, WebSockets, and other API types.  
- **Enable Team Collaboration** – Introduce features that allow teams to share, review, and manage API integration more effectively.  

Jennie API **is redefining how developers work with APIs**—and we’re just getting started! 🚀

