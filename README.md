# Real-Time Chat Application

A modern real-time chat application built with NestJS, WebSockets, MySQL, and AWS Lambda for serverless message processing.

## 🏗️ Architecture Overview

- **Backend**: NestJS with TypeORM for database integration
- **Real-time Communication**: WebSockets using Socket.IO
- **Database**: MySQL for message persistence
- **Message Processing**: AWS Lambda for content sanitization
- **Frontend**: Simple HTML/JavaScript client
- **Deployment**: Serverless Framework for AWS Lambda

## ✨ Features

- ✅ Real-time message broadcasting via WebSockets
- ✅ Message persistence in MySQL database
- ✅ AWS Lambda integration for message processing
- ✅ REST API for message history with pagination
- ✅ Simple web client for testing
- ✅ Message sanitization and content filtering
- ✅ Room-based chat functionality

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **AWS RDS MySQL Instance** (v8.0 or higher) - already configured
- **AWS CLI** configured with appropriate permissions
- **NPM** or **Yarn** package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd recman_test
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with your RDS MySQL instance details:

```env
# Application
PORT=3000
NODE_ENV=development
STAGE=dev

# RDS MySQL Database Configuration
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=realtime_chat

# AWS Configuration (for Lambda deployment)
AWS_REGION=eu-central-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

**Database Requirements:**
- Ensure your RDS MySQL instance has a database named `realtime_chat`
- If the database doesn't exist, connect to your RDS instance and create it:
  ```bash
  # Connect to RDS MySQL
  mysql -h your-rds-endpoint.region.rds.amazonaws.com -u your_username -p
  
  # Create database
  CREATE DATABASE realtime_chat;
  ```
- The application will automatically create the required `message` table using TypeORM synchronization
- Make sure your RDS security group allows connections from your application (port 3306)
- Verify your RDS instance is publicly accessible (if connecting from local development)

### 4. Build the Application

```bash
npm run build
```

## 🔧 AWS Lambda Setup

### Prerequisites

1. Install Serverless Framework globally:
```bash
npm install -g serverless
```

2. Configure AWS credentials:
```bash
aws configure
```

### Deploy Lambda Function

1. **Deploy the Lambda function**:
```bash
npm run sls:deploy
```

2. **Test Lambda locally** (optional):
```bash
npm run sls:offline
```

### Lambda Function Details

The Lambda function (`processMessage`) performs:
- Content sanitization (removes HTML tags, scripts)
- Content length validation (max 1000 characters)
- Bad word filtering
- Metadata addition

**Function Name**: `nestjs-chat-app-{stage}-processMessage`
**Runtime**: Node.js 20.x
**Memory**: 512MB
**Timeout**: 30 seconds

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run start:prod
```

The application will be available at:
- **API**: http://localhost:3000
- **Chat Client**: http://localhost:3000/chat-client.html

## 📡 API Endpoints

### Get Messages

```http
GET /chats/messages?limit=10&offset=0
```

**Query Parameters**:
- `limit` (optional): Number of messages to retrieve (default: 10)
- `offset` (optional): Number of messages to skip (default: 0)

**Response**:
```json
{
  "messages": [
    {
      "id": 1,
      "userId": "user_123",
      "content": "Hello, world!",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

## 🔌 WebSocket Events

### Client Events

#### Connect to Room
```javascript
const socket = io('ws://localhost:3000', {
  query: { roomId: 'room1' }
});
```

#### Send Message
```javascript
socket.emit('message', {
  content: 'Hello everyone!',
  roomId: 'room1'
});
```

### Server Events

#### Receive Message
```javascript
socket.on('message', (data) => {
  console.log('New message:', data);
  // data: { id, content, userId, roomId, timestamp, processed }
});
```

#### User Events
```javascript
socket.on('user-joined', (data) => {
  console.log('User joined:', data.userId);
});

socket.on('user-left', (data) => {
  console.log('User left:', data.userId);
});
```

## 🌐 Testing the Application

### Using the Web Client

1. Open http://localhost:3000/chat-client.html
2. Enter a Room ID (e.g., "room1")
3. Click "Connect"
4. Start sending messages
5. Open multiple browser tabs to test real-time functionality

### Using cURL

```bash
# Get messages
curl "http://localhost:3000/chats/messages?limit=5&offset=0"
```

## 📁 Project Structure

```
src/
├── core/
│   ├── config/               # Configuration management
│   ├── database/             # Database providers
│   ├── entities/             # TypeORM entities
│   └── services/             # Shared services (AWS)
├── modules/
│   └── chat/                 # Chat module
│       ├── services/         # Business logic
│       ├── dtos/             # Data transfer objects
│       ├── chat.controller.ts # REST API controller
│       ├── chat.gateway.ts   # WebSocket gateway
│       ├── chat.service.ts   # Chat business logic
│       └── chat.module.ts    # Module definition
├── handlers.ts               # Lambda handlers
├── main.ts                   # Application entry point
└── serverless.ts             # Serverless wrapper

public/
└── chat-client.html          # Simple web client

Configuration Files:
├── serverless.yaml           # Serverless Framework config
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.js              # ESLint rules
└── .prettierrc               # Prettier formatting
```

## 🛠️ Development Scripts

```bash
# Development
npm run start:dev              # Start in watch mode
npm run build                  # Build the application

# Serverless
npm run sls:offline           # Run Lambda locally
npm run sls:deploy            # Deploy to AWS
node test-lambda.js           # Test Lambda function (after build)

# Code Quality
npm run format                # Format code with Prettier
npm run format:check          # Check code formatting
npm run lint                  # Run ESLint with auto-fix
npm run lint:check            # Check linting without fixing
```