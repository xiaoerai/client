export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/checkin/index',
    // 'pages/login/index', // 暂时禁用，保留代码
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
})
