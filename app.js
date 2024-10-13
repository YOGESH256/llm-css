import express from 'express';
import reviewsRouter from './routes/reviews.js';
import 'dotenv/config'

const app = express();
const PORT = process.env.PORT || 3010;

app.use('/api', reviewsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default  app;