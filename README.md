<div align="center">

# 🔗 Roolink TypeScript SDK

### Enterprise-grade Akamai sensor generation for Node.js & TypeScript

[![npm](https://img.shields.io/badge/npm-1.0.0-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@roolink/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

**[📚 Documentation](https://docs.roolink.io/)** • **[💬 Discord](https://discord.gg/rooapi)**

---

</div>

## 🚀 Overview

Production-ready APIs for generating Akamai sensor data across web and mobile platforms. This SDK handles authentication, requests, and response parsing with full TypeScript support.

### 🎯 Supported Services

| Service | Features |
|---------|----------|
| **🌐 Web API** | Sensor generation, pixel challenges, SBSD, sec-cpt solving |
| **📱 BMP API** | iOS & Android mobile app sensor generation |

---

## 📦 Installation

```bash
npm install @roolink/sdk
```

## ⚡ Quick Start

```typescript
import { RoolinkClient } from '@roolink/sdk';

const client = new RoolinkClient('your-api-key');
const sensor = await client.generateWebSensor(req);
```

---

## 🌐 Web API

```typescript
// Sensor Generation
await client.generateWebSensor(req);

// Pixel Challenges
await client.generatePixel(req);

// Sec-Cpt Challenges
await client.solveSecCpt(req);

// SBSD Challenges
await client.solveSBSD(req);

// Script Parsing
await client.parseScript(scriptContent);
```

---

## 📱 BMP API

```typescript
// iOS Sensors (android: false)
await client.generateBMPSensor({
  android: false,
});

// Android Sensors (android: true)
await client.generateBMPSensor({
  android: true,
});
```

---

## 🆘 Error Handling

```typescript
try {
  const result = await client.generateWebSensor(req);
} catch (error) {
  // handle error
}
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 💜**

</div>
