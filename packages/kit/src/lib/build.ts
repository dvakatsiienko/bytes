/** answers for this server only; the siblings sit on their own path, since two servers probing each other's probe would never end */
export const BUILD_PATH = '/api/build';
export const OTHERS_PATH = '/api/build/others';

/* Types */

export interface Build {
  /** the app's folder name: next apps share one base port, so a sibling on that port may be another app */
  app: string;
  /** `HEAD` on a detached checkout */
  branch: string;
  isDev: boolean;
  sha: string;
}

export interface Other extends Build {
  /** the branch, or the worktree's folder when it is detached */
  name: string;
  port: number;
}
