export type EnvironmentName = 'local' | 'staging';

export type AppConfig = {
  name: EnvironmentName;
  baseUrl: string;
  demoPort: number;
  timeouts: {
    actionMs: number;
    navigationMs: number;
    healMs: number;
  };
};
