# SASTCsharpBlogPart

![极简的代码](/wwwroot/img/image.png)

这里有一份极简的 Blog 的 API 代码~
目前这份 Blog 采用的是 MiniAPI，假如你对其他类型的框架更熟悉的话也可以自行选择简单重构这个项目
至于样例 Bolg 我们在 [blogs](/wwwroot/blogs/) 文件夹中提供了一部分（均为 markdown 格式），你也可以自行上传自己喜欢的内容
注意：对于本套题目，我们最注重的部分正是 **评论区功能** 的实现

## (1) 基础要求

- [ ] 在自己的电脑上完成数据库绑定
- [ ] 给当前的 Blog API 添加测试（Swagger、REST Client 等均可）
- [ ] 添加一整套用户或评论区功能（我说俩都端上来吧）
- [ ] 为他搭建起一套前端！（允许 vibe coding~~，但是并不妨碍我们进行批斗~~）

## (2) 进阶要求

- [ ] 为用户界面添加实时可视化数据
- [ ] 把数据库部署到云端（neon、Azure DB、AWS、阿里云、腾讯云甚至华为云均可）
- [ ] 部署这个 Blog（vercel、render、github pages、cloudflare、Azure Web App、AWS、阿里云、腾讯云甚至华为云均可）
- [ ] 为实现的所有功能添加覆盖面全的单元测试

## （3）开放内容

1. 顺手尽可能美化一下你的前端
2. 添加一些你觉得可能用的到的功能

## 4、项目结构

```txt

SASTCsharpBlogPart
├─📂Data
│ └─BlogSeeder.cs             // 数据生成种子
├─📂Endpoints
│ └─BlogItemEndpoints.cs
├─📂Models
│ └─BlogItem.cs
├─📂Properties
│ └─launchSettings.json
├─📂wwwroot
│ └─📂blogs                     // 一些 Blog 文件
├─Program.cs
├─appsettings.Development.json
├─appsettings.json
└─SASTCSharpBlogPart.csproj

```

## 启动方式
```powershell
dotnet run #后端

cd frontend
npm install
npm run dev#前端
