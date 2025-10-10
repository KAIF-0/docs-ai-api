# DocsAI Server - Restructured

A clean, modular web scraping server built with Hono.js, featuring documentation scraping, AI-powered chat responses, and subscription management.

## 📁 Project Structure

```
src/
├── config/
│   ├── env.js                 # Environment configuration
│   ├── database.js            # Prisma database configuration
│   ├── redis.js              # Redis clients configuration
│   ├── redisManager.js        # Redis connection management
│   ├── genai.js              # Google Generative AI configuration
│   └── razorpay.js           # Razorpay payment configuration
├── controllers/
│   ├── chatController.js      # Chat-related request handlers
│   ├── paymentController.js   # Payment-related request handlers
│   └── scrapingController.js  # Scraping-related request handlers
├── database/
│   └── repositories.js       # Database access layer
├── helpers/
│   ├── cacheHelper.js        # Cache management utilities
│   └── ragHelper.js          # RAG (Retrieval Augmented Generation) utilities
├── jobs/
│   ├── publishers/
│   │   └── scrapePublisher.js # Job queue publisher for scraping
│   └── workers/
│       └── scrapeWorker.js    # Background worker for scraping jobs
├── middleware/
│   └── errorMiddleware.js     # Error handling middleware
├── routes/
│   ├── chatRoutes.js         # Chat API routes
│   ├── paymentRoutes.js      # Payment API routes
│   └── scrapingRoutes.js     # Scraping API routes
├── services/
│   ├── chatService.js        # Chat business logic
│   ├── paymentService.js     # Payment business logic
│   └── subscriptionService.js # Subscription business logic
├── utils/
│   ├── common.js             # Common utility functions
│   └── htmlCleaner.js        # HTML cleaning utilities
└── app.js                    # Main application entry point
```

## 🚀 Features

- **Documentation Scraping**: Automated scraping of documentation websites
- **AI Chat Integration**: AI-powered responses using Google Generative AI
- **Subscription Management**: Razorpay integration for payment processing
- **Redis Caching**: Efficient caching for chat data and subscriptions
- **Background Jobs**: Queue-based processing using BullMQ
- **Clean Architecture**: Modular structure with separation of concerns

## 🛠️ Technology Stack

- **Framework**: Hono.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Queue**: BullMQ
- **AI**: Google Generative AI
- **Payments**: Razorpay
- **Web Scraping**: Cheerio

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://username:password@localhost:5432/docsai
REDIS_CHAT_INSTANCE_URL=redis://localhost:6379/0
REDIS_SUBSCRIPTIONS_INSTANCE_URL=redis://localhost:6379/1
GENERATIVE_AI_API_KEY=your_google_ai_api_key
RAZORPAY_ID_KEY=your_razorpay_key_id
RAZORPAY_SECRET_KEY=your_razorpay_secret_key
RAG_SERVER_URL=http://localhost:8000
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📚 API Endpoints

### Chat Routes (`/chat`)
- `POST /chat/feed-docs` - Add documentation for scraping
- `GET /chat/getUserChats/:userId` - Get user's chat history
- `POST /chat/getResponse/:chatId` - Get AI response

### Payment Routes (`/subscription`)
- `POST /subscription/createOrder` - Create payment order
- `POST /subscription/saveDetails` - Save subscription details
- `GET /subscription/getDetails/:userId` - Get subscription details

### Scraping Routes (`/`)
- `GET /scrap` - Trigger documentation scraping

## 🏗️ Architecture Overview

### Controllers
Handle HTTP requests and responses, delegating business logic to services.

### Services  
Contain business logic and coordinate between repositories and external services.

### Repositories
Handle database operations using Prisma ORM.

### Jobs
- **Publishers**: Add jobs to the queue
- **Workers**: Process background jobs

### Helpers
Utility functions for specific operations like caching and RAG integration.

### Utils
Common utility functions used across the application.

## 🔄 Background Processing

The application uses BullMQ for background job processing:

1. **Scrape Publisher**: Adds scraping jobs to the queue
2. **Scrape Worker**: Processes scraping jobs, extracts content, and caches results

## 💾 Caching Strategy

- **Chat Cache**: User chat histories cached in Redis
- **Subscription Cache**: Subscription details cached with TTL
- **Documentation Cache**: Scraped documentation cached for 7 days

## 🚨 Error Handling

Global error handling middleware catches and processes all application errors, returning consistent error responses.

## 📊 Database Schema

The application uses Prisma with PostgreSQL for data persistence:

- **Chat**: Stores chat sessions
- **Message**: Stores chat messages
- **Subscription**: Stores user subscription details

## 🔒 Security Features

- CORS configuration for frontend integration
- Environment-based configuration
- Redis connection error handling and auto-reconnection

## 🧪 Testing

```bash
npm test
```

## 📝 License

ISC License