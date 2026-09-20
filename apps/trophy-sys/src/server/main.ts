import { createServer } from 'node:http';

import requestHandle from './handler.ts';
import { resolverInstall } from './resolver.ts';

const PORT = Number(
  process.env.API_PORT ?? 5178 + Number(process.env.PORT_OFFSET ?? 0),
);

resolverInstall();

createServer(requestHandle).listen(PORT, () =>
  console.log(`trophy api → http://localhost:${PORT}/api`),
);
