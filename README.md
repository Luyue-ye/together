# Together 同窗：上线步骤

整个过程大约 45 分钟，全部免费。需要一个 Google 账号（用来开 Firebase）和你的 GitHub 账号。

在完成第 3 步之前，App 以「预览模式」运行：界面都能用，数据只存在当前设备上，楼里的同窗是示例。

---

## 第 1 步：建 Firebase 项目，打开登录功能

1. 打开 https://console.firebase.google.com ，点「创建项目」，名字填 `together`。Google Analytics 可以关掉。
2. 左侧菜单 **Build → Authentication**，点「开始使用」。
3. 在「登录方法」里选 **电子邮件/密码**，打开第一个开关，保存。

## 第 2 步：建数据库，贴上安全规则

1. 左侧菜单 **Build → Realtime Database**，点「创建数据库」。位置选 **United States (us-central1)**，选「以锁定模式启动」。
2. 打开 **规则（Rules）** 标签，删掉里面的全部内容，换成本文件夹里 `database.rules.json` 的全部内容，点「发布」。

这些规则做了几件事：
- 任何邮箱都能注册，但必须点过验证邮件才能读写数据。
- 每个人只能改自己的资料、心情、备忘和学习时长。心情原始记录只有本人能读，大家只能看到每晚的汇总。
- 预约自习室的密码在数据库里做了加密比对，不知道密码就看不到房间里的聊天。
- 约局、求助、文件夹、留言只有发起人（或管理员）能删。

## 第 3 步：把 Firebase 配置填进 App

1. 点左上角齿轮 **项目设置**，往下找到「你的应用」，点 `</>`（Web）图标，应用昵称填 `together`，**不用**勾选 Firebase Hosting，点注册。
2. 页面会显示一段 `firebaseConfig = { ... }`。打开本文件夹的 `config.js`，把大括号里的内容替换到 `firebase:` 后面。
3. 检查一下里面有没有 `databaseURL`。如果没有，去 Realtime Database 页面顶部复制那个 `https://...firebaseio.com` 地址，自己加一行 `databaseURL: "https://....firebaseio.com",`。

## 第 4 步：打开推送用的密钥

1. 还是在 **项目设置**，切到 **Cloud Messaging** 标签。
2. 找到「网络配置」里的 **Web Push 证书**，点「生成密钥对」。
3. 复制生成的那一长串，粘贴到 `config.js` 里的 `vapidKey: ""` 引号中间。

## 第 5 步：放到 GitHub Pages

1. 在 GitHub 新建一个仓库，名字填 `together`，设为 **Public**。
2. 在仓库页面点 **Add file → Upload files**，把本文件夹里的所有文件、`icons` 和 `scripts` 文件夹一起拖进去，点 Commit。
   - `.github` 是隐藏文件夹，Mac 上拖不进去也没关系：在仓库页面点 **Add file → Create new file**，文件名一栏输入 `.github/workflows/nightly.yml`，把本文件夹里同名文件的内容粘贴进去，点 Commit。
3. 进入仓库 **Settings → Pages**，Source 选 **Deploy from a branch**，分支选 `main`、文件夹选 `/ (root)`，保存。
4. 等一两分钟，App 地址就是：`https://luyue-ye.github.io/together/`
5. 回到 Firebase：**Authentication → 设置 → 已获授权的网域**，添加 `luyue-ye.github.io`。

## 第 6 步：自己先注册，设成管理员

1. 用手机打开上面的地址，用你的邮箱注册，去邮箱点验证链接，回到 App 点「我已经点了验证链接」。
   - 验证邮件有时会进垃圾箱（GSU 邮箱可能进隔离区），第一次请确认你自己能收到。
2. 回到 Firebase **Authentication → 用户**，复制你那一行的「用户 UID」。
3. 打开 **Realtime Database → 数据**，在根节点点 `+`：名字填 `admins`；再在它下面加一项，名字填你的 UID，值填 `true`。
4. 刷新 App，「我」页面会出现「你是管理员」，你就能删除任何人发的内容了。

## 第 7 步：开启每晚 21:00 的汇总和推送

汇总和推送由 GitHub Actions 每晚自动运行（免费）。

1. Firebase **项目设置 → 服务账号**，点「生成新的私钥」，会下载一个 `.json` 文件。**这个文件是密钥，千万不要上传到仓库里，也不要发给别人。**
2. 回到 GitHub 仓库，**Settings → Secrets and variables → Actions → New repository secret**，依次添加三个：
   - `FIREBASE_SERVICE_ACCOUNT`：用文本编辑器打开刚下载的 `.json`，把全部内容粘贴进去
   - `FIREBASE_DB_URL`：数据库地址，就是 `config.js` 里的 `databaseURL`
   - `APP_URL`：`https://luyue-ye.github.io/together/`
3. 打开仓库的 **Actions** 标签，如果提示要启用就点启用。左边选「Together nightly 21:00」，点 **Run workflow**，勾选「不管现在几点，立即汇总」，运行一次试试。成功后 App 里「21:00 汇总」页面会出现今天的数字。

几点说明：
- 当天记录心情的人少于 3 位时，不显示数字，也不推送，避免人少时被猜出是谁。
- 脚本还会顺手清理旧数据：聊天只保留 2 天，心情原始记录保留 3 天，留言板保留 60 天。
- GitHub 规定：仓库 60 天没有任何改动时，定时任务会被自动暂停。到时 Actions 页面会提示，点一下重新启用就行。
- iPhone 只有把 App 添加到主屏幕、并从主屏幕打开后，才能在「我」页面开启推送。

## 第 8 步：装到手机上，发给同学

- **iPhone**：用 Safari 打开地址，点底部「分享」，选「添加到主屏幕」。
- **Android**：用 Chrome 打开地址，点右上角「⋮」，选「安装应用」。

把地址发到系里的群里就行。任何邮箱都能注册，有人乱发内容的话，管理员可以删除。

---

## 以后怎么更新

- **改了任何文件**：打开 `sw.js`，把第 3 行的 `together-v1` 改成 `together-v2`（每次加 1），再把改过的文件上传到 GitHub。大家下次打开 App 就会拿到新版本。
- **更新会议日历**：编辑 `conferences.js`。每个会议一行，`deadline` 填 `YYYY-MM-DD`，还没公布就填 `null`。大家自己添加的会议存在数据库里，不用改代码。
- **改翻译**：编辑 `i18n.js`。孟加拉语（bn）和波斯语（fa）建议请会说的同学校对一遍。

## 文件说明

| 文件 | 作用 |
|---|---|
| `index.html`、`style.css` | 入口和样式 |
| `app.js` | 启动、登录注册、页面切换 |
| `core.js` | 共用工具、数据连接、预览模式的示例数据、团子 |
| `home.js` | 主页：心情滑块、备忘、本周平衡、汇总、正在进行 |
| `study.js` | 一起学习：自习室列表、会议日历、资料室 |
| `room.js` | 自习室里面：背景、团子、计时、休息、聊天、递茶 |
| `life.js` | 一起生活：一起玩、需要帮忙 |
| `digest.js` | 21:00 汇总和留言板 |
| `me.js` | 我：名字、团子颜色、语言、推送、安装 |
| `i18n.js` | 五种语言的界面文字 |
| `conferences.js` | 内置会议数据（2026 年 11 月 12 日核对） |
| `config.js` | 你的 Firebase 配置（第 3、4 步填写） |
| `database.rules.json` | 数据库安全规则（第 2 步贴到 Firebase） |
| `sw.js`、`manifest.webmanifest`、`icons/` | 让它能装到手机上、离线打开、接收推送 |
| `scripts/nightly.mjs`、`.github/workflows/nightly.yml` | 每晚 21:00 的汇总、推送和清理 |
