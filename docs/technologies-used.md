# Technologies Used — Rush Bites

A comprehensive overview of the technologies, frameworks, libraries, and tools utilized across the Rush Bites platform, along with the technical rationale for each selection.

---

## 1. Technology Stack Summary

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^19.1.0` | Declarative UI rendering, component lifecycle, Context API |
| **Build Tool & Bundler** | Vite | `^7.1.0` | Fast development server, hot module replacement (HMR), Rollup bundling |
| **Authentication (Client)** | `@clerk/clerk-react` | `^5.46.0` | User login, session management, token handling, OAuth |
| **QR Code Rendering** | `react-qr-code` | `^2.2.0` | Client-side vector SVG rendering of NPCI UPI payment links |
| **Audio Synthesis** | Web Audio API | *Native* | In-browser sine-wave audio synthesis for real-time kitchen & order alerts |
| **Styling & Theming** | Vanilla CSS3 | *Native* | Custom theme design system, CSS variables, dark/light modes, print stylesheets |
| **Backend Runtime** | Node.js | `v20+` | Asynchronous, non-blocking event-driven JavaScript runtime |
| **Backend Framework** | Express | `^5.2.1` | REST API routing, error middleware, request lifecycle management |
| **Authentication (Server)** | `@clerk/express` | `^2.1.69` | Middleware for Clerk JWT verification and user context attachment |
| **Database** | MongoDB Atlas | `v7.0+` | Cloud-hosted NoSQL document database |
| **Object Data Modeling** | Mongoose | `^9.10.1` | Strict schema validation, atomic updates, aggregation pipelines |
| **Rate Limiting** | `express-rate-limit` | `^8.7.0` | Tiered request throttling per user and per IP subnet |
| **Media & CDN Storage** | Cloudinary SDK | `^2.11.0` | Cloud image storage, on-the-fly resizing, WebP compression |
| **Cross-Origin Handling** | CORS | `^2.8.6` | Whitelisted cross-origin resource sharing between client and server |
| **Environment Config** | dotenv | `^18.0.1` | Secure environment variable injection from `.env` files |

---

## 2. Frontend Technologies

### 2.1. React 19
- **Why React 19**: Delivers enhanced performance with concurrent rendering improvements and native compiler optimizations.
- **State Management**: Rather than introducing bulky third-party libraries (e.g., Redux, MobX), state is architected using modular, domain-specific React Contexts:
  - `ProfileContext`: Manages synchronized MongoDB user identity, roles (`customer`, `staff`, `admin`), and session status.
  - `CanteenContext`: Encapsulates vendor self-service state, active canteen document, and registration hooks.
  - `CartContext`: Manages item quantities, single-canteen cart boundaries, and dynamic order totals.
  - `ToastProvider`: Powers unobtrusive floating system notifications across customer and vendor flows.

### 2.2. Vite 7
- **Why Vite**: Replaced legacy Webpack tooling with instant server start via native ES modules and lightning-fast Hot Module Replacement (HMR).
- **Production Optimization**: Pre-configures Rollup to generate minified CSS (`~37KB`) and split JavaScript chunks with tree-shaking, resulting in sub-second load times on mobile 4G networks.

### 2.3. Clerk Authentication (`@clerk/clerk-react`)
- **Modern Identity Management**: Eliminates insecure homegrown password hashing and session cookies in favor of secure OAuth (Google) and Email OTP login flows.
- **Session Lifecycle**: Handles automatic silent JWT rotation (`~60-second TTL`) with cross-tab session synchronization.

### 2.4. Web Audio API
- **Zero-Dependency Audio Synthesis**: Rather than loading external `.mp3` or `.wav` sound files that can fail due to 404s, CORS policies, or slow network connections, Rush Bites synthesizes audio directly in the browser:
  - **Vendor Alert (`playNewOrderSound`)**: Two ascending sine waves (660 Hz and 880 Hz) signaling incoming kitchen work.
  - **Customer Chime (`playReadySound`)**: A three-note melodic sequence (523 Hz, 659 Hz, 784 Hz) alerting the customer that their food is waiting at the counter.
  - **Autoplay Compliance**: Lazily initializes and resumes the `AudioContext` upon user interaction to comply with modern browser autoplay restrictions.

### 2.5. Custom CSS3 & Design System
- **CSS Custom Properties (Variables)**: Powers a complete semantic design system with seamless dynamic dark/light mode toggling (`data-theme="dark"`).
- **Print Media Query (`@media print`)**: Dedicated stylesheet for `TokenSlip.jsx` that automatically hides headers, navigation tabs, and drawers during browser print invocations, leaving only a clean, formatted receipt slip for thermal or standard counter printers.

---

## 3. Backend Technologies

### 3.1. Express 5
- **Next-Gen Express**: Utilizes Express 5, featuring native support for asynchronous route handlers (`async/await`) without requiring unhandled rejection wrappers.
- **Modular Routing**: Organized into clean route sub-modules (`auth`, `canteen`, `menu`, `order`, `review`, `upload`) mounted under `/api`.

### 3.2. MongoDB Atlas & Mongoose 9
- **Flexible Document Model**: Adapts seamlessly to nested order line items, flexible dietary tags, dynamic canteen hours, and denormalized review stats.
- **Atomic Operations**: Leverages MongoDB atomic operators (`$inc`, `$set`, `$cond`) and `{ returnDocument: "after" }` to prevent concurrency conflicts during simultaneous order placement and token assignment.
- **Aggregation Pipelines**: Executes multi-stage aggregations (`$match`, `$lookup`, `$group`, `$project`) on the database cluster to calculate live canteen queue sizes and daily vendor analytics in a single database roundtrip.

### 3.3. Dual-Tier Rate Limiting (`express-rate-limit`)
- Protects the database against denial-of-service attempts and malicious script scraping.
- Implements specialized key generators that differentiate authenticated user tokens from shared university campus NAT IP addresses.

### 3.4. Cloudinary Cloud Media Pipeline
- **Automatic Optimization**: Incoming base64 food photographs and UPI QR images are uploaded to Cloudinary with automated formatting (`fetch_format: auto`) and quality optimization (`quality: auto`).
- **Aspect Scaling**: Caps image dimensions at `1200×1200` to prevent mobile cameras from uploading unnecessarily heavy 12-megapixel payloads to customer feeds.
