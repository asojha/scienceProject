import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', routes);

// Serve index.html for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
  🔬 ═══════════════════════════════════════════════════ 🔬

       🧪 SCIENCE QUEST - Fun Science Quiz for Kids! 🧪

  🔬 ═══════════════════════════════════════════════════ 🔬

       🌐 Server running at: http://localhost:${PORT}
       📚 API available at:  http://localhost:${PORT}/api

       Categories: Space 🚀 | Animals 🦁 | Human Body 🫀
                   Plants 🌿 | Weather 🌤️ | Chemistry 🧪
                   Physics ⚡ | Earth 🌍 | Oceans 🐙
                   Dinosaurs 🦕

  🔬 ═══════════════════════════════════════════════════ 🔬
  `);
});

export default app;
