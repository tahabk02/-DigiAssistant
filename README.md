# Digital Assistant Assessment Platform

A comprehensive digital maturity assessment platform with adaptive questioning and intelligent scoring.

## Features

- **Adaptive Assessment Engine**: Dynamic question selection based on responses
- **Multi-dimensional Scoring**: Comprehensive evaluation across different maturity dimensions
- **Interactive Dashboard**: Real-time visualization of assessment results
- **PDF Export**: Professional assessment reports
- **RESTful API**: Complete backend API with authentication

## Architecture

```
digiassistant/
├── backend/          # Node.js/Express API server
├── frontend/         # React/Vite SPA
├── data/            # Assessment data and configurations
└── docker-compose.yml # Container orchestration
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT
- **Testing**: Jest + Supertest
- **Documentation**: Auto-generated API docs

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **State Management**: Zustand
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 7+
- Redis (optional, for caching)
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone and setup**
   ```bash
   git clone <repository-url>
   cd digiassistant
   ```

2. **Backend setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Frontend setup** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/docs

### Docker Setup

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Endpoints

### Assessment
- `POST /api/assessment/start` - Start new assessment
- `GET /api/assessment/:id/question` - Get next question
- `POST /api/assessment/:id/answer` - Submit answer
- `GET /api/assessment/:id/results` - Get final results

### Results
- `GET /api/results/:id` - Get assessment results
- `GET /api/results/:id/export` - Export PDF report

## Project Structure

### Backend (`/backend`)
```
src/
├── config/          # Database and app configuration
├── models/          # MongoDB schemas
├── services/        # Business logic layer
├── controllers/     # HTTP request handlers
├── routes/          # API route definitions
├── middleware/      # Custom middleware
└── utils/           # Helper functions
```

### Frontend (`/frontend`)
```
src/
├── components/      # React components
│   ├── Assessment/  # Assessment flow components
│   ├── Results/     # Results display components
│   └── Common/      # Shared UI components
├── services/        # API communication
├── hooks/           # Custom React hooks
├── utils/           # Helper functions
└── styles/          # Global styles
```

## Testing

### Backend
```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend
```bash
cd frontend
npm test              # Run all tests
npm run test:ui       # Visual test runner
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support, please contact [your-email@domain.com](mailto:your-email@domain.com).