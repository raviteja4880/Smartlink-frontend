<div align="center">

# SmartLink AI — AI-Powered Link Intelligence & Security Platform

<p align="center">
  <b><i>"Understand a link before you open it."</i></b>
</p>

<p align="center">
  SmartLink AI is an AI-powered Link Intelligence and Security Platform that analyzes web destinations, provides security and content intelligence, generates an informative preview, and lets users make an informed decision before visiting the destination.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Google%20Gemini-gemini--2.0--flash-8E75C2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/FastAPI-Python%203.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Node.js-Express%20v4-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React-v19%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Cache-Redis%20(Fail--Open)-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS%203-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%7C%20Render-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Deployment" />
</p>

---

</div>

## 🌐 Overview

Every day, billions of web links are shared across social networks, messaging platforms, emails, and developer forums. Traditional URL shorteners treat links as opaque pipes—they transform a long URL into an abbreviated link and immediately redirect users blindfolded to unknown web destinations. This poses severe challenges:

- **Phishing & Spoofing:** Malicious destinations hide behind obfuscated URLs.
- **Wasted Time & Context Switching:** Users are forced to load bloated, tracking-heavy pages just to discover what they contain.
- **Blind Navigation:** Users have no objective indication of SSL health, domain reputation, or content category beforehand.

**SmartLink AI shifts this paradigm completely.**

> **SmartLink AI is an AI-powered Link Intelligence and Security Platform that analyzes web destinations, provides security and content intelligence, generates an informative preview, and lets users make an informed decision before visiting the destination.**

URL shortening is **one component** of SmartLink AI, serving as an entry point. When a destination URL is submitted, SmartLink AI executes an intelligent analysis pipeline:

1. **Destination Accessibility:** Verifies HTTP reachability, server response status, and redirect stability.
2. **Security Signals:** Inspects HTTPS encryption, SSL certificate health, domain reputation, IP formatting, and known phishing indicators.
3. **Deep Content Extraction:** Scrapes clean page content through a multi-engine fallback waterfall (`trafilatura` → `readability-lxml` → `BeautifulSoup4`).
4. **Gemini AI Intelligence:** Synthesizes human-friendly summaries, classifies dynamic industries and categories, derives tailored topics, assesses target audiences ("Best For"), and computes real reading duration.
5. **Multi-Factor Trust Score:** Computes a 100-point transparent trust score combining technical security, redirect stability, domain safety, and content authenticity.
6. **Public Intelligence Layer:** Displays a responsive, glassmorphic preview card with an AI Decision Card, giving recipients the freedom to make an informed choice before continuing.

---

## 🌟 Key Highlights

- **🛡️ 7-Factor Security & Trust Engine:** Evaluates HTTPS, SSL validity, server reachability, domain reputation, redirect behaviors, content quality, and security signals into an aggregated 0–100 Trust Score with risk tiering (`Safe`, `Good`, `Use Caution`, `Risky`).
- **🤖 Dual-Stage Gemini 2.0 Content Intelligence:** Uses Google Gemini (`gemini-2.0-flash`) with structured JSON schema outputs to produce conversational 60–120 word summaries, authentic topic hashtags, dynamic industry categories, and audience matching.
- **⏱️ Algorithmic Reading Time & Word Count:** Real-content extraction calculates accurate read times and word counts instead of generic static placeholders.
- **⚖️ AI Recommendation & Decision Card:** Renders transparent verdicts (`Recommended`, `Open with Caution`, `Not Recommended`) with confidence percentages and factor breakdowns.
- **⚡ Dual Routing Strategy:**
  - `/:shortCode` → Delivers the public intelligence preview page where visitors inspect security and content intelligence before clicking.
  - `/r/:shortCode` → High-performance direct redirect powered by Redis caching for sub-millisecond throughput with asynchronous analytics tracking.
- **🛡️ Resilient Fail-Open Redis Architecture:** High-speed caching for redirects and link lookups that seamlessly falls back to MongoDB with zero downtime if Redis becomes offline or throttled.
- **📊 Real-Time Analytics & Device Telemetry:** Aggregates referrers, operating systems, browsers, device types (`desktop`, `mobile`, `tablet`), click volumes, preview view counts, and chronological history with Recharts charts.
- **📁 Smart Collections & Vault Management:** Organize analyzed SmartLinks into custom collections with dedicated public showcase slugs.
- **🖼️ Bulletproof Fallback Cascade & Safe Image Proxy:** Secure backend image proxy prevents CORS and mixed-content issues for external thumbnails; graceful branded gradient cards ensure the preview UI never breaks if an image fails to load.

---

## 🏛️ System Architecture

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           USER INTERFACE                               │
 │             Vite + React 19 + TailwindCSS 3 + Framer Motion            │
 └──────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
     Preview & Link │ POST /api/links                 │ Direct Redirect
     Management     │ GET /api/preview/:code          │ GET /r/:shortCode
                    ▼                                 ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                           EXPRESS BACKEND                              │
 │                 Node.js 18+ • REST API Gateway (Port 4000)             │
 │                                                                        │
 │  • Helmet & Rate Limiters (Auth, API, Redirects)                       │
 │  • URL & Custom Alias Validation                                       │
 │  • QR Code Generator & Safe Image Proxy                                │
 │  • Link, User, Collection, Admin & Analytics Controllers              │
 └──────┬──────────────────────┬───────────────────────────────┬──────────┘
        │                      │                               │
        │ MongoDB Queries      │ Read/Write Cache              │ POST /analyze
        ▼                      ▼                               ▼
 ┌─────────────┐       ┌───────────────┐       ┌──────────────────────────┐
 │   MONGODB   │       │     REDIS     │       │     FASTAPI AI SERVICE   │
 │   ATLAS     │       │   (Fail-Open) │       │     Python 3.10+ (8000)  │
 │             │       │               │       │                          │
 │ • Links     │       │ • link:code   │       │ • Trafilatura Scraping   │
 │ • Analytics │       │   redirects   │       │ • Readability / BS4      │
 │ • Users     │       │ • Sub-ms      │       │ • In-Memory TTLCache     │
 │ • Collection│       │   lookups     │       │ • Google Gemini Flash    │
 └─────────────┘       └───────────────┘       └──────────────┬───────────┘
                                                              │
                                                              ▼
                                               ┌──────────────────────────┐
                                               │   GOOGLE GEMINI 2.0 API  │
                                               │    gemini-2.0-flash      │
                                               └──────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend Client
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.2.7` | Reactive component architecture & modern rendering |
| **Vite** | `5.4.10` | Lightning-fast build tooling and HMR environment |
| **TailwindCSS** | `3.4.17` | Utility-first styling with custom design tokens |
| **Framer Motion** | `11.11.6` | Smooth UI transitions, interactive accordions, and animations |
| **TanStack React Query** | `5.59.1` | Asynchronous state management, server cache, and mutations |
| **React Router DOM** | `6.21.2` | Client-side routing, protected routes, and preview routing |
| **Recharts** | `3.9.2` | Responsive data visualization for analytics telemetry |
| **Lucide React** | `0.469.0` | Comprehensive iconography system |
| **Axios** | `1.7.3` | HTTP client for authenticated API requests |

### Backend API Server
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `18+` / `ES Modules` | High-performance asynchronous JavaScript runtime |
| **Express.js** | `4.21.1` | REST API routing, error middleware, and static serving |
| **Mongoose** | `8.17.1` | Object Data Modeling (ODM) for MongoDB persistence |
| **Redis Client** | `4.6.0` | In-memory key-value caching with fail-open offline tolerance |
| **Helmet** | `8.1.0` | Secure HTTP response headers |
| **Express Rate Limit** | `7.1.0` | DDoS & brute-force mitigation (auth, API, redirect tiers) |
| **Express Mongo Sanitize**| `2.2.0` | Prevention against NoSQL operator injection |
| **JSONWebToken & Bcrypt**| `9.0.2` / `2.1.1` | Stateless HMAC-SHA256 authentication & salted hashing |
| **UA-Parser-JS** | `1.0.40` | User-agent parsing for browser, OS, and device classification |
| **QRCode** | `1.1.1` | Dynamic QR code generation for shortened links |

### AI Content & Security Microservice
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | `0.115.0+` | High-performance asynchronous Python API framework |
| **Uvicorn** | `0.30.0+` | Production ASGI web server |
| **Google Gemini API** | `gemini-2.0-flash` | Multimodal LLM reasoning for conversational summary & semantics |
| **Trafilatura** | `1.12.0+` | High-precision web text and metadata extraction |
| **Readability-lxml** | `0.8.1+` | Fallback HTML article content extraction |
| **BeautifulSoup4** | `4.12.0+` | DOM parsing, tag extraction, Open Graph, and favicon resolution |
| **Cachetools** | `5.3.0+` | Process-level 1-hour TTL URL cache |
| **Pydantic** | `2.7.0+` | Strict request/response data validation and typing |

---


## ⚡ Advanced Features

### 1. Dual-Path Redirect Engine
- **Preview Path (`/:shortCode`):** Presents the destination intelligence layer and increments preview counters.
- **Direct Redirect Path (`/r/:shortCode`):** High-speed bypass for verified redirects with background asynchronous analytics logging.

### 2. Deep Full-Text Search
Mongoose full-text indexing with custom relevance scoring across fields:
- `title` (weight: 10)
- `tags` (weight: 8)
- `keywords` (weight: 6)
- `category` (weight: 6)
- `notes` (weight: 5)
- `summary` (weight: 4)
- `topics` (weight: 3)

### 3. Asynchronous Device & Geolocation Analytics
Logs visits without blocking redirect execution:
- Captures browser engine, operating system, and hardware device type via `ua-parser-js`.
- Logs referrers and request timestamps for timeline charts.
- Provides click-through-rate (CTR) comparisons between preview views and actual destination visits.

### 4. Enterprise Security Controls
- **Helmet:** Hardens HTTP headers.
- **Multi-Tier Rate Limiting:** Dedicated rate limit buckets for authentication (20 req/15 min), general API routes (200 req/15 min), and redirects (300 req/1 min).
- **Data Sanitization:** Strips MongoDB operator keys (`$`, `.`) from request bodies.
- **Fail-Safe Fallbacks:** Deterministic heuristic summaries ensure link creation never fails even if external AI APIs experience outages.

---

## 📡 API Reference

### Public & Link Preview Routes
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/:shortCode` | Redirects visitor to the frontend preview page | Public |
| `GET` | `/r/:shortCode` | Fast direct redirect to original destination | Public |
| `GET` | `/api/preview/:shortCode` | Returns comprehensive AI analysis & security data | Public |
| `GET` | `/api/image-proxy?url=...` | Proxies external images securely with caching headers | Public |
| `GET` | `/health` | Healthcheck showing DB, Redis, and AI service status | Public |

### Links Management (`/api/links`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/links` | Create new SmartLink with AI analysis | JWT |
| `GET` | `/api/links` | List user links with search, category & sort filters | JWT |
| `GET` | `/api/links/:id` | Get link details by ID | JWT |
| `PUT` | `/api/links/:id` | Update link tags, notes, or metadata | JWT |
| `DELETE`| `/api/links/:id` | Delete link and invalidate Redis cache entry | JWT |
| `POST` | `/api/links/:id/refresh-health` | Re-test destination reachability & SSL status | JWT |

### Analytics & Collections (`/api/analytics`, `/api/collections`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/analytics/:linkId` | Aggregate analytics (device, browser, OS, timeline) | JWT |
| `GET` | `/api/analytics/:linkId/events`| Detailed telemetry log events | JWT |
| `POST` | `/api/collections` | Create a new collection of SmartLinks | JWT |
| `GET` | `/api/collections` | List user collections | JWT |
| `GET` | `/api/collections/public/:slug` | View public curated collection by slug | Public |

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue signed JWT | Public |

---

## ☁️ Deployment Architecture

| Tier | Service | Provider | Production URL |
| :--- | :--- | :---: | :--- |
| **Frontend** | React 19 Client SPA | **Vercel** | `https://smartlinkai.vercel.app` |
| **Backend** | Express API Gateway | **Render** | `https://smartlink-backend-ytgp.onrender.com` |
| **AI Service** | FastAPI + Gemini Microservice | **Render** | `https://smartlink-ai.onrender.com` |
| **Database** | MongoDB Mongoose Cluster | **MongoDB Atlas** | Managed Cloud DB |
| **Cache** | In-Memory Key-Value Store | **Redis Cloud / Upstash** | Managed Redis Cluster |

---

## 📬 Contact & Support

- **Project Lead & Developer:** Ravi Teja
- **Repository:** [SmartLink AI on GitHub](https://github.com/your-username/smartlink-ai)
- **Live Platform:** [https://smartlinkai.vercel.app](https://smartlinkai.vercel.app)

---

<div align="center">

<b>SmartLink AI — Understand a link before you open it.</b>

<sub>Built with ❤️ for a safer, more transparent, and intelligent web.</sub>

</div>
