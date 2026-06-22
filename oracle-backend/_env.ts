declare const process: {
  env: Record<string, string | undefined>;
};

export function hasComputeConfig() {
  return Boolean(process.env.OG_COMPUTE_BASE_URL && process.env.OG_COMPUTE_MODEL);
}

export function getComputeConfig() {
  return {
    baseUrl: process.env.OG_COMPUTE_BASE_URL,
    model: process.env.OG_COMPUTE_MODEL,
    brokerKey: process.env.OG_COMPUTE_BROKER_KEY,
  };
}
