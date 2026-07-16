# GuildPlugin 指令参考文档

> 适用于 Minecraft 1.20.6+ | Spigot / Paper / Purpur / Folia

---

## 指令总览

| 指令 | 别名 | 权限 | 说明 |
|---|---|---|---|
| `/guild` | `/g` `/工会` | `guild.use` (默认: 所有人) | 玩家公会主指令 |
| `/guildadmin` | `/ga` `/工会管理` | `guild.admin` (默认: OP) | 管理员指令 |
| `/guildmodule` | `/gm` | `guild.admin.module` (默认: OP) | 模块热管理 |

---

## 一、玩家指令 `/guild`

无参数时打开公会主菜单 GUI。

### 1.1 创建与管理

| 指令 | 说明 |
|---|---|
| `/guild create <名称> [标签] [描述]` | 创建公会。名称 3-20 字符，标签最多 6 字符 |
| `/guild delete` | 删除自己的公会（需确认） |
| `/guild leave` | 离开当前公会（会长需先转让或解散） |

**示例：**
```
/guild create 龙之巢穴 DN 我们是最强的公会
/guild delete
/guild leave
```

### 1.2 信息查询

| 指令 | 说明 |
|---|---|
| `/guild info` | 查看所在公会的详细信息（名称/标签/等级/资金/成员数） |
| `/guild members` | 查看公会成员列表及角色 |
| `/guild time` | 查看公会创建时间和存活时长 |
| `/guild help` | 显示帮助信息 |

### 1.3 成员管理

| 指令 | 说明 |
|---|---|
| `/guild invite <玩家名>` | 邀请玩家加入公会 |
| `/guild accept <邀请者>` | 接受公会邀请 |
| `/guild decline <邀请者>` | 拒绝公会邀请 |
| `/guild kick <玩家名>` | 踢出公会成员 |
| `/guild promote <玩家名>` | 提升成员为副会 |
| `/guild demote <玩家名>` | 降级副会为普通成员 |
| `/guild applications` | 打开入会申请管理 GUI |

### 1.4 公会领地

| 指令 | 说明 |
|---|---|
| `/guild sethome` | 设置公会传送点（在当前位置） |
| `/guild home` | 传送到公会传送点（可配置倒计时） |

### 1.5 公会经济

| 指令 | 说明 |
|---|---|
| `/guild economy info` | 查看公会资金余额 |
| `/guild deposit <金额>` | 向公会存入资金 |
| `/guild withdraw <金额>` | 从公会提取资金 |
| `/guild transfer <公会名> <金额>` | 转账给其他公会 |

**快捷写法：**
```
/guild economy deposit 1000   ← 等效于 /guild deposit 1000
/guild economy withdraw 500   ← 等效于 /guild withdraw 500
```

### 1.6 公会关系

| 指令 | 说明 |
|---|---|
| `/guild relation list` | 查看当前所有公会关系 |
| `/guild relation create <公会名> <关系类型>` | 发起关系请求（ally/enemy/war/truce/neutral） |
| `/guild relation accept <公会名>` | 接受关系请求 |
| `/guild relation reject <公会名>` | 拒绝关系请求 |
| `/guild relation delete <公会名>` | 删除已有关系 |

### 1.7 公会聊天

| 指令 | 说明 |
|---|---|
| `/guild chat` | 切换公会聊天模式（开启后所有发言发到公会频道） |
| `/guild chat <消息>` | 发送一条公会消息（不切换模式） |
| `/guild c <消息>` | 同上，快捷写法 |

### 1.8 占位符

| 指令 | 说明 |
|---|---|
| `/guild placeholder player` | 获取玩家占位符格式 |
| `/guild placeholder guild` | 获取公会占位符格式 |
| `/guild placeholder rank` | 获取职位占位符格式 |

---

## 二、管理指令 `/guildadmin`

> 权限：`guild.admin`（默认 OP）

无参数时打开管理 GUI（仅玩家）。

### 2.1 公会管理

| 指令 | 说明 |
|---|---|
| `/ga list` | 列出所有公会（名称/会长/等级/状态） |
| `/ga info <公会名>` | 查看指定公会详情 |
| `/ga delete <公会名>` | 强制删除指定公会（玩家执行会弹确认 GUI） |
| `/ga freeze <公会名>` | 冻结公会（冻结后无法操作） |
| `/ga unfreeze <公会名>` | 解冻公会 |
| `/ga transfer <公会名> <新会长>` | 强制转让会长（新会长需在线且为该会成员） |

### 2.2 经济管理

| 指令 | 说明 |
|---|---|
| `/ga economy <公会名> set <金额>` | 设置公会资金 |
| `/ga economy <公会名> add <金额>` | 增加公会资金 |
| `/ga economy <公会名> remove <金额>` | 扣除公会资金 |

### 2.3 关系管理

| 指令 | 说明 |
|---|---|
| `/ga relation list` | 查看所有公会关系 |
| `/ga relation create <公会1> <公会2> <类型>` | 强制创建关系 |
| `/ga relation delete <公会1> <公会2>` | 强制删除关系 |
| `/ga relation gui` | 打开关系管理 GUI |

**关系类型：** `ally`（盟友）`enemy`（敌对）`war`（战争）`truce`（停战）`neutral`（中立）

### 2.4 系统管理

| 指令 | 说明 |
|---|---|
| `/ga reload` | 重新加载所有配置、语言文件、权限并刷新 GUI |
| `/ga update check` | 检查插件更新 |
| `/ga update download` | 下载更新（需权限 `guild.admin.update`） |

### 2.5 测试工具

| 指令 | 说明 |
|---|---|
| `/ga test gui` | 测试 GUI |
| `/ga test economy` | 测试经济系统 |
| `/ga test relation` | 测试关系系统 |
| `/ga test lang` | 语言调试工具集 |

---

## 三、模块指令 `/guildmodule`

> 权限：`guild.admin.module`（默认 OP）

| 指令 | 说明 |
|---|---|
| `/gm list` | 列出所有已加载模块及其状态 |
| `/gm load <文件名.jar>` | 从 modules 目录加载新模块 |
| `/gm unload <模块ID>` | 卸载指定模块 |
| `/gm reload <模块ID>` | 重新加载指定模块 |
| `/gm info <模块ID>` | 查看指定模块详情 |
| `/gm cloud` | 列出云端可用模块 |
| `/gm cloud download <模块名>` | 从云端下载模块 |

**状态标识：** `ACTIVE`(绿) `LOADING`(黄) `ERROR`(红) `DISABLED`(灰)

---

## 四、权限节点完整列表

| 权限节点 | 默认 | 说明 |
|---|---|---|
| `guild.use` | true | 使用公会系统的基础权限 |
| `guild.create` | true | 创建公会 |
| `guild.invite` | true | 邀请玩家加入 |
| `guild.kick` | true | 踢出成员 |
| `guild.promote` | true | 提升成员为副会 |
| `guild.demote` | true | 降级副会为成员 |
| `guild.delete` | op | 解散公会 |
| `guild.sethome` | true | 设置公会传送点 |
| `guild.home` | true | 传送到公会传送点 |
| `guild.relation` | true | 管理公会关系 |
| `guild.economy` | true | 管理公会经济 |
| `guild.deposit` | true | 存入公会资金 |
| `guild.withdraw` | true | 提取公会资金 |
| `guild.transfer` | true | 转账给其他公会 |
| `guild.chat` | true | 使用公会聊天 |
| `guild.admin` | op | 管理指令总权限 |
| `guild.admin.module` | op | 模块热加载管理 |
| `guild.admin.update` | op | 下载插件更新 |

---

## 五、常用权限配置示例 (LuckPerms)

```
# 只允许管理员创建公会
/lp group default permission set guild.create false

# 禁止普通玩家解散公会
/lp group default permission set guild.delete false

# 创建公会管理角色
/lp group mod permission set guild.admin true

# 禁止玩家提取公会资金
/lp group default permission set guild.withdraw false
```
