# Science Quest

A fun science questionnaire for 10-year-old kids! Explore the wonders of science through interactive quizzes across multiple categories.

## Features

- **10 Science Categories**: Space, Animals, Human Body, Plants, Weather, Chemistry, Physics, Earth, Oceans, and Dinosaurs
- **40+ Questions**: Age-appropriate questions with fun facts
- **Difficulty Levels**: Easy, Medium, and Hard questions
- **Scoring System**: Points based on difficulty with streak bonuses
- **Kid-Friendly UI**: Colorful, animated interface with confetti celebrations

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/categories` | Get all quiz categories |
| GET | `/api/question` | Get a random question |
| POST | `/api/answer` | Submit an answer |
| GET | `/api/score` | Get current session score |
| POST | `/api/reset` | Reset session |
| GET | `/api/count` | Get question count |

### Query Parameters

- `sessionId` - Track user progress across questions
- `category` - Filter questions by category
- `difficulty` - Filter by difficulty (easy, medium, hard)

## Project Structure

```
scienceProject/
  src/
    data/          # Science questions database
    routes/        # Express API routes
    services/      # Quiz logic
    types/         # TypeScript type definitions
    index.ts       # Server entry point
  public/
    index.html     # Quiz UI
    style.css      # Styles
    app.js         # Frontend logic
  tests/           # Unit tests
```

## Technologies

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Testing**: Jest, Supertest

## License

MIT
