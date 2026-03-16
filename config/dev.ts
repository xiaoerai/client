import type { UserConfigExport } from "@tarojs/cli";
export default {
  defineConstants: {
    // 开发环境 API 地址（H5 调试用）
    API_BASE_URL: '"http://localhost:7001"',
    // 微信云环境 ID（开发环境留空，用 H5 调试）
    CLOUD_ENV_ID: '""',
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport<'vite'>
