# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# EXPO Push Notification App - 开发进度

## 项目介绍

这是一个基于 Expo 框架开发的移动应用，主要功能包括用户认证、文章发布和浏览、推送通知等功能。

## 已完成功能

### 用户认证模块 (Authentication)

1. **用户界面**
   - ✅ 创建"我的"页面，显示用户信息或登录/注册选项
   - ✅ 实现登录表单，包含邮箱和密码字段
   - ✅ 实现注册表单，包含用户名、邮箱和密码字段
   - ✅ 密码输入框添加显示/隐藏密码功能
   - ✅ 登录后显示用户详细信息（用户名、邮箱等）
   - ✅ 添加退出登录功能

2. **API 集成**
   - ✅ 实现登录 API 调用 (POST /api/auth/login)
   - ✅ 实现注册 API 调用 (POST /api/auth/register)
   - ✅ 实现登出 API 调用 (POST /api/auth/logout)

3. **状态管理**
   - ✅ 创建 AuthContext 用于管理用户认证状态
   - ✅ 使用 AsyncStorage 存储和恢复用户会话信息
   - ✅ 保存用户信息、访问令牌和刷新令牌

### 文章模块 (Articles)

1. **文章浏览**
   - ✅ 创建文章列表页面，支持分页加载
   - ✅ 实现下拉刷新和上拉加载更多功能
   - ✅ 展示文章摘要、作者和发布时间
   - ✅ 实现文章详情页面

2. **文章发布**
   - ✅ 添加发布按钮在 Explore 标签
   - ✅ 创建文章编辑表单，支持标题和内容输入
   - ✅ 实现文章发布功能，需要用户登录

3. **API 集成**
   - ✅ 获取文章列表 API 调用 (GET /api/articles)
   - ✅ 获取文章详情 API 调用 (GET /api/articles/:id)
   - ✅ 发布文章 API 调用 (POST /api/articles)

### 导航

- ✅ 实现标签导航，包含"首页"、"发布"、"文章"和"我的"标签
- ✅ 配置页面路由和导航选项
- ✅ 实现模态页面（如文章发布）和详情页面路由

## 待开发功能

### 推送通知功能

- ⏳ 集成 Expo 推送通知服务
- ⏳ 实现通知管理界面
- ⏳ 允许用户配置通知偏好

### UI/UX 改进

- ⏳ 主题定制和深色模式支持
- ⏳ 添加加载动画和过渡效果
- ⏳ 多语言支持

## 技术栈

- **前端框架**: React Native, Expo
- **路由**: Expo Router
- **状态管理**: React Context API
- **数据存储**: AsyncStorage
- **API 通信**: Fetch API
- **UI 组件**: 原生组件 + 自定义主题组件

## 开始使用

1. 安装依赖

   ```bash
   yarn install
   ```

2. 启动应用

   ```bash
   yarn start
   ```

## API 接口

### 认证相关

#### 登录

- **URL**: `http://localhost:3000/api/auth/login`
- **方法**: POST
- **参数**: `{ email, password }`
- **响应**: 返回用户信息、访问令牌和刷新令牌

#### 注册

- **URL**: `http://localhost:3000/api/auth/register`
- **方法**: POST
- **参数**: `{ username, email, password }`
- **响应**: 返回用户信息、访问令牌和刷新令牌

#### 登出

- **URL**: `http://localhost:3000/api/auth/logout`
- **方法**: POST
- **参数**: `{ refreshToken }`
- **响应**: 登出成功状态

### 文章相关

#### 获取文章列表

- **URL**: `http://localhost:3000/api/articles`
- **方法**: GET
- **参数**: `page, limit`
- **响应**: 返回文章列表和分页信息

#### 获取文章详情

- **URL**: `http://localhost:3000/api/articles/:id`
- **方法**: GET
- **响应**: 返回文章详细信息

#### 发布文章

- **URL**: `http://localhost:3000/api/articles`
- **方法**: POST
- **参数**: `{ title, content }`
- **请求头**: 需要 Authorization Bearer Token
- **响应**: 返回新创建的文章信息
