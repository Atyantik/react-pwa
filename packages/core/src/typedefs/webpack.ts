import { Configuration } from 'webpack';

export type WebpackHandlerConstructorOptions = {
  mode: Configuration['mode'];
  target: Configuration['target'];
  projectRoot: string;
  buildWithHttpServer: boolean;
  serverSideRender: boolean;
  envVars: Record<string, any>;
  config: Record<string, any>;
  copyPublicFolder: Boolean;
};
