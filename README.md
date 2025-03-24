# JennieAPI

<p align="center">
  <img src="icon/button1" width="200" alt="JennieAPI Logo">
</p>

<p align="center">
  <b>Effortless API Integration for Developers</b>
  <br>
  <a href="#installation">Installation</a> •
  <a href="#features">Features</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## 🚀 Introduction

**JennieAPI** is a powerful VS Code extension designed to streamline API integration in your projects. It automatically reads API specifications from your project and generates the necessary frontend integration code, reducing development time and minimizing errors.

---

## 🔥 Features

- 📌 **Automatic API Parsing** – Reads API specs from your project and generates integration code.
- ⚡ **Supports OpenAPI & REST** – Works seamlessly with OpenAPI-based APIs and standard REST endpoints.
- 🛠️ **One-Click Code Generation** – Instantly creates API request functions with proper types.
- 🌍 **Supports Multiple Languages** – JavaScript, TypeScript, Python, and more.
- 🚀 **Works with Azure OpenAI** – Parses API files intelligently using AI-powered analysis.

---

## 📦 Installation

To install JennieAPI in VS Code:

1. Open VS Code and go to **Extensions** (`Ctrl+Shift+X`).
2. Search for `JennieAPI`.
3. Click **Install**.
4. Reload VS Code if necessary.

Or install manually via VS Code Marketplace:

```sh
code --install-extension jennieapi
```

---

## 🛠 Usage

1. Place your API specification file (e.g., `openapi.json`) in the root of your project.
2. Open the **JennieAPI** panel in VS Code.
3. Select the API endpoint you want to use.
4. Click **Generate Code** – the API request function will be automatically created.

Example output (TypeScript):

```typescript
import axios from 'axios';

export async function fetchUserData(userId: string) {
  const response = await axios.get(`/api/users/${userId}`);
  return response.data;
}
```

---

## 📖 Documentation

For detailed usage instructions, visit our [Official Documentation](https://your-docs-link.com).

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit (`git commit -m "Added new feature"`).
4. Push to your fork (`git push origin feature-name`).
5. Open a pull request.

---

## ⚠️ Known Issues

- Some OpenAPI 2.0 specs may not be fully supported.
- Ensure the API file is in the root directory for automatic detection.

Check out our [issue tracker](https://github.com/your-repo/issues) for reported bugs and feature requests.

---

## 📝 License

JennieAPI is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

---

<p align="center">💙 Built with love for developers 💙</p>
