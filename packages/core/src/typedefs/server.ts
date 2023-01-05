export type RunOptions = {
  projectRoot: string;
  mode: 'production' | 'development';
  envVars: Record<string, any>;
  config: Record<string, any>;
  serverSideRender: boolean;
};
