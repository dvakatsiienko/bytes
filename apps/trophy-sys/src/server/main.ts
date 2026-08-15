import { createServer } from 'node:http';

import requestHandle from './handler.ts';

const PORT = Number(process.env.API_PORT ?? 5178);

createServer(requestHandle).listen(PORT, () =>
  console.log(`trophy api → http://localhost:${PORT}/api`),
);
