import cors from 'cors';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import express from 'express';
import morganBody from 'morgan-body';
import cookieParser from 'cookie-parser';
import { StatusCodes } from 'http-status-codes';
import router from './routes.index.js';
import { formatResponse, logger } from './util/index.js';
import { checkAndStartCronJob } from './services/invitation/invitation.cronjob.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { OK, NOT_FOUND } = StatusCodes;

const app = express();

morganBody(app, {
  stream: {
    write: (message) => {
      logger.info(message);
    },
  },
});


app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        // 'http://localhost:3001',
        // 'http://127.0.0.1:3001',
        // 'http://ksa.cherdianto.com',
        // 'https://ksa.cherdianto.com',
        // '*',
        'http://onlinecbtindonesia.web.rug.nl',
        'https://onlinecbtindonesia.web.rug.nl',
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Explicitly allow necessary methods
  })
);


app.options('*', cors()); // Handle preflight requests (OPTIONS)
app.use(cookieParser());
app.use('/asset', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('Referer:', req.headers.referer);
  // UNCOMMENT BELOW FOR RUG
  res.setHeader('Access-Control-Allow-Origin', 'http://onlinecbtindonesia.web.rug.nl');
  res.setHeader('Access-Control-Allow-Origin', 'https://onlinecbtindonesia.web.rug.nl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Respond with no content for preflight
  }
  
  next();
});


checkAndStartCronJob();

app.get('/ping', (req, res) =>
  res.status(OK).send(formatResponse('pong v.2.3.02', true)) // versi 2 bulan 3, tgl 02
);
app.use(router);

app.use((req, res) => {
  res
    .status(NOT_FOUND)
    .json(formatResponse('Route not found', false, NOT_FOUND));
});

export default app;
