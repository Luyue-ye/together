// 第 3 步：把 Firebase 控制台给你的配置粘贴到 firebase 里；第 6 步：把 Web Push 证书的密钥对粘贴到 vapidKey。
// 这些值放在公开网页里是正常的，真正保护数据的是 database.rules.json 里的规则。
// 在填好之前，App 会以「预览模式」运行：数据只留在当前设备上，楼里是示例同窗。
self.TOGETHER_CONFIG = {
  firebase: {
    apiKey: "AIzaSyD4QQYyRhPIjBz7CMCRFJPbUNTWMCqWSI0",
    authDomain: "together-ccf51.firebaseapp.com",
    databaseURL: "https://together-ccf51-default-rtdb.firebaseio.com",
    projectId: "together-ccf51",
    storageBucket: "together-ccf51.firebasestorage.app",
    messagingSenderId: "1036055597772",
    appId: "1:1036055597772:web:ec9e6a952e16bd0e8fa869"
  },
  vapidKey: "BAbAfHJ7WyDd8eTjX5HcknykCJwuOqpLjo3-lx4f9EkyTQFc4n34Tsgj5dsYp2_dYHx5EJ2SbIKWpvknXYtDdGY"
};
