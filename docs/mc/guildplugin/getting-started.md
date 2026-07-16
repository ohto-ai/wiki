# GuildPlugin 入门使用教程

> 适用于 Minecraft 1.20.6+ | Spigot / Paper / Purpur / Folia

---

## 一、安装插件

### 1.1 单服部署

```
plugins/
├── GuildPlugin.jar              ← 主插件（必须）
├── PlaceholderAPI.jar           ← 可选，提供变量支持
└── Vault.jar                    ← 可选，提供经济系统
```

### 1.2 群组部署

```
BungeeCord/plugins/
└── GuildBungee.jar              ← 跨服同步

各子服/plugins/
├── GuildPlugin.jar              ← 每个子服都放
├── PlaceholderAPI.jar
└── Vault.jar
```

### 1.3 数据库配置（群组必改）

编辑 `plugins/GuildPlugin/database.yml`：

```yaml
type: mysql                              # 从 sqlite 改为 mysql
mysql:
  host: localhost
  port: 3306
  database: guild
  username: root
  password: "你的密码"
```

> ⚠️ 所有子服必须指向**同一个 MySQL 数据库**，否则各服数据不互通。

### 1.4 基础配置（可选项）

编辑 `plugins/GuildPlugin/config.yml`：

```yaml
language:
  default: "zh"                # 中文界面，可选 en/pl/br

guild:
  creation-cost: 1000.0        # 创建公会费用（需 Vault）
  max-members: 50              # 公会人数上限
  home-teleport-delay: 3       # 传送回家等待秒数（0=立即）
  no-economy-mode: false       # 没装 Vault 时设为 true

guild-chat:
  format: "&7[&b公会&7]&r {role} {player}&f: {message}"  # 聊天格式
```

配置完成后运行 `/ga reload` 或重启服务器生效。

---

## 二、第一天：创建你的公会

### 步骤 1：准备资金

创建公会需要费用（默认 1000 金币），确保你钱包里有足够的钱。

### 步骤 2：创建

```
/guild create 龙之巢穴 DN 最强的冒险者公会
           │      │  └─ 描述（可选）
           │      └─ 标签，最多6字符（可选）
           └─ 公会名，3-20字符（必填）
```

或者打开 GUI 创建：

```
/guild
```

点击绿色玻璃板进入创建流程 → 输入名称 → 输入标签 → 输入描述 → 点击确认。

### 步骤 3：设置据点

走到公会基地位置，输入：

```
/guild sethome
```

之后任何时候用 `/guild home` 就能传送回来。

---

## 三、管理成员

### 邀请成员

```
/guild invite Steve    # 邀请 Steve
```

被邀请的玩家会收到提示，用以下命令回应：

```
/guild accept Steve     # 接受邀请
/guild decline Steve    # 拒绝邀请
```

### 提升/降级

```
/guild promote Steve    # 提升为副会（副会长）
/guild demote Steve     # 降级为普通成员
```

### 踢出成员

```
/guild kick Steve       # 踢出 Steve
```

### 申请入会

玩家对某个公会感兴趣但没被邀请？用 `/guild` 打开 GUI，在公会列表中点击目标公会，点击"申请加入"。会长/副会可在 `/guild applications` 中审批。

---

## 四、公会经济

### 查看余额

```
/guild economy info
```

### 存钱

```
/guild deposit 500     # 存入 500 金币
```

任何成员都可以存钱，资金用于升级公会。

### 取钱（仅会长）

```
/guild withdraw 200    # 取出 200 金币
```

### 转账

```
/guild transfer 星辰公会 1000    # 转 1000 金币给另一个公会
```

---

## 五、公会升级

公会升级需要累积资金，资金达到门槛自动升级。默认的升级表：

| 等级 | 所需资金 |
|---|---|
| 1→2 | 5,000 |
| 2→3 | 10,000 |
| 3→4 | 20,000 |
| 4→5 | 35,000 |
| 5→6 | 50,000 |
| 6→7 | 75,000 |
| 7→8 | 100,000 |
| 8→9 | 150,000 |
| 9→10 | 200,000 |

最大等级和各级费用可在 `config.yml` 中自定义。

---

## 六、公会关系

你可以和其他公会建立外交关系：

```
/guild relation create 星辰公会 ally     # 结盟
/guild relation create 黑暗公会 enemy    # 宣敌
/guild relation list                     # 查看所有关系
/guild relation accept 星辰公会          # 接受对方的结盟请求
/guild relation delete 星辰公会          # 解除关系
```

**关系类型：** `ally`（盟友）`enemy`（敌对）`war`（宣战）`truce`（停战）`neutral`（中立）

---

## 七、公会聊天

### 切换聊天模式

```
/guild chat
```

切换后你所有的发言都会发到公会频道。再次输入退出公会聊天模式。

### 发单条消息

```
/guild chat 今晚8点集合打龙！
/guild c 收到！
```

---

## 八、常用快捷操作

| 你想做什么 | 指令 |
|---|---|
| 看看我公会的信息 | `/guild info` |
| 看成员列表 | `/guild members` |
| 打开管理面板 | `/guild` |
| 回家 | `/guild home` |
| 查看帮助 | `/guild help` |
| 公会成立多久了 | `/guild time` |

---

## 九、管理员常用操作

| 场景 | 指令 |
|---|---|
| 查看所有公会 | `/ga list` |
| 查看某公会详情 | `/ga info 龙之巢穴` |
| 强制删除违规公会 | `/ga delete 违规公会` |
| 冻结公会 | `/ga freeze 违规公会` |
| 给公会发钱 | `/ga economy 龙之巢穴 add 10000` |
| 强制转让会长 | `/ga transfer 龙之巢穴 Steve` |
| 重载配置 | `/ga reload` |
| 安装模块 | `/gm cloud download announcement` |

---

## 十、常见问题

### Q: 创建公会时提示余额不足？

**A:** 三种解决办法：
1. 赚够钱再创建
2. 在 `config.yml` 中调低 `guild.creation-cost`
3. 设 `guild.no-economy-mode: true` 跳过经济检查

### Q: 如何限制只有管理员能创建公会？

**A:** 使用权限插件（以 LuckPerms 为例）：

```
/lp group default permission set guild.create false
```

### Q: 群组下怎么保证数据同步？

**A:**
1. 所有子服使用同一个 MySQL 数据库
2. 在 BungeeCord 装 `GuildBungee.jar`

### Q: 没有装 Vault 能创建公会吗？

**A:** 设 `no-economy-mode: true` 即可跳过经济检查。没有 Vault 时存款/取款等功能不可用。

### Q: 怎么安装额外模块（公告/任务/排行榜）？

**A:**
```
/gm cloud                      # 查看云端可用模块
/gm cloud download quest       # 下载任务模块
/gm list                       # 确认已加载
```

模块会出现在 `/guild` GUI 中。
