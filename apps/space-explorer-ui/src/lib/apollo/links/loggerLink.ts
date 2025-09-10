import { ApolloLink, Observable } from '@apollo/client';
import debug from 'debug';

const logGql = debug('[GraphQL]');

export const loggerLink = new ApolloLink((operation, forward) => {
  const startTime = Date.now();

  logGql(`Starting operation: ${operation.operationName}`);
  logGql('Variables:', operation.variables);

  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      complete: () => {
        observer.complete();
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        logGql(
          `Operation ${operation.operationName} failed after ${duration}ms`,
        );
        logGql('Error:', error);
        observer.error(error);
      },
      next: (response) => {
        const duration = Date.now() - startTime;
        logGql(
          `Operation ${operation.operationName} completed in ${duration}ms`,
        );
        logGql('Response:', response);
        observer.next(response);
      },
    });

    return () => subscription.unsubscribe();
  });
});
