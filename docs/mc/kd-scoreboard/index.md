# Minecraft 1.20.6 计分板 K/D 统计系统

## 目录

- [一、计分板创建（聊天栏执行）](#一计分板创建聊天栏执行)
- [二、队伍创建与成员管理（聊天栏执行）](#二队伍创建与成员管理聊天栏执行)
- [三、计分板显示（聊天栏执行）](#三计分板显示聊天栏执行)
- [四、辅助目标创建（聊天栏执行）](#四辅助目标创建聊天栏执行)
- [五、命令方块布置方案](#五命令方块布置方案)
- [六、个人 KD 比率计算](#六个人-kd-比率计算)
- [七、常用管理命令速查](#七常用管理命令速查)
- [八、注意事项](#八注意事项)

---

## 一、计分板创建（聊天栏执行）

> ⚠️ 以下命令在聊天栏**执行一次**即可，无需放入命令方块。

### 1.1 核心统计目标

```mcfunction
# 玩家击杀数（只统计击杀玩家）
/scoreboard objectives add playerKills playerKillCount "玩家击杀"

# 死亡次数
/scoreboard objectives add deaths deathCount "死亡次数"

# 总击杀数（杀所有生物，含玩家）
/scoreboard objectives add totalKills totalKillCount "总击杀"

# 承受伤害（单位：半颗心，1 伤害 = 半颗心）
/scoreboard objectives add damageTaken minecraft.custom:minecraft.damage_taken "承受伤害"
```

### 1.2 自定义辅助目标（用于团队统计和 KD 计算）

```mcfunction
# 团队总击杀（虚拟玩家用）
/scoreboard objectives add teamKills dummy "团队总击杀"

# 个人 KD 比率（整数商）
/scoreboard objectives add kdRatio dummy "KD比率"

# 上次同步值（用于增量计算，可选）
/scoreboard objectives add lastSync dummy "上次同步值"
```

---

## 二、队伍创建与成员管理（聊天栏执行）

### 2.1 创建队伍

> ⚠️ 1.20.5+ 中 `/scoreboard teams` 已拆分为独立命令 `/team`。

```mcfunction
# 创建红队和蓝队
/team add Red "红队"
/team add Blue "蓝队"
```

### 2.2 将玩家加入队伍

```mcfunction
# 将指定玩家加入红队（替换 玩家名 为实际 ID）
/team join Red 玩家名

# 将指定玩家加入蓝队
/team join Blue 玩家名

# 批量加入示例
/team join Red Alice
/team join Red Bob
/team join Blue Charlie
/team join Blue David
```

### 2.3 队伍管理命令

```mcfunction
# 查看所有队伍
/team list

# 查看队伍成员
/team list Red

# 将玩家移出队伍
/team leave 玩家名

# 删除队伍
/team remove Red
```

---

## 三、计分板显示（聊天栏执行）

### 3.1 显示在游戏屏幕右侧

```mcfunction
# 显示玩家击杀数
/scoreboard objectives setdisplay sidebar playerKills

# 显示团队总击杀
/scoreboard objectives setdisplay sidebar teamKills

# 显示 KD 比率
/scoreboard objectives setdisplay sidebar kdRatio

# 显示死亡次数
/scoreboard objectives setdisplay sidebar deaths
```

### 3.2 隐藏计分板

```mcfunction
# 隐藏右侧计分板（不填目标名）
/scoreboard objectives setdisplay sidebar
```

---

## 四、辅助目标创建（聊天栏执行）

如果使用**增量同步方案**（推荐，避免重复累加），需要创建辅助计分板：

```mcfunction
# 用于记录每个玩家上次同步时的击杀数
/scoreboard objectives add lastSync dummy "上次击杀数"
```

---

## 五、命令方块布置方案

### 核心原理

`playerKillCount` 和 `deathCount` 是**游戏统计自动维护**的只读分数——玩家每杀一人/死一次，对应分数自动 +1，**无法被 `/scoreboard players reset` 真正清零**（reset 后下次同步会恢复原值）。因此"累加后重置"的方案行不通。

正确做法是用虚拟分数 `lastSync` 记录「上次已同步的击杀数」，每次只把**增量**（当前值 - 上次同步值）加到团队总分：

```
本次增量 = playerKills - lastSync
团队总分 += 本次增量
lastSync = playerKills（更新为当前值）
```

---

### 5.1 方案一：增量同步（推荐）

不丢数据，不重复累加，适合长期统计。

#### 命令方块布置图

```
[红石时钟] → [脉冲①] → [链②] → [链③] → [链④] → [链⑤] → [链⑥] → [链⑦]
```

| 顺序 | 方块类型      | 命令                                                                                                    | 说明               |
| :--: | :------------ | :------------------------------------------------------------------------------------------------------ | :----------------- |
|  ①  | 脉冲 + 需红石 | 触发整个链                                                                                              | 由红石时钟控制     |
|  ②  | 链 + 无条件   | `execute as @a[team=Red] run scoreboard players operation RedTeam teamKills += @s playerKills`        | 加当前击杀         |
|  ③  | 链 + 无条件   | `execute as @a[team=Red] run scoreboard players operation RedTeam teamKills -= @s lastSync`           | 减上次同步 = 增量  |
|  ④  | 链 + 无条件   | `execute as @a[team=Red] run scoreboard players operation @s lastSync = @s playerKills`               | 更新同步值         |
|  ⑤  | 链 + 无条件   | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills += @s playerKills`      | 蓝队加当前击杀     |
|  ⑥  | 链 + 无条件   | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills -= @s lastSync`         | 蓝队减上次同步     |
|  ⑦  | 链 + 无条件   | `execute as @a[team=Blue] run scoreboard players operation @s lastSync = @s playerKills`              | 蓝队更新同步值     |

> ✅ 初值 `lastSync` 为 0（未设置过），初次运行时增量 = `playerKills - 0` = 全部击杀，之后每轮只加新增部分。

---

### 5.2 方案二：增量同步 + KD 计算（完整链）

在方案一的基础上，追加个人 KD 计算。**KD 用百分制显示**（先 ×100 再 ÷死亡），避免整数除法全部显示为 0。

#### 前置准备

```mcfunction
# 创建一个常数 100 的虚拟分数，用于 KD 精度乘法
/scoreboard objectives add const100 dummy
/scoreboard players set #100 const100 100
```

#### 命令方块布置图

```
[红石时钟] → [脉冲①] → [链②] ... [链⑦]（同方案一）→ [链⑧] → [链⑨] → [链⑩] → [链⑪]
```

| 顺序 | 方块类型      | 命令                                                                                             | 说明              |
| :--: | :------------ | :----------------------------------------------------------------------------------------------- | :---------------- |
|  ①  | 脉冲 + 需红石 | 触发整个链                                                                                       |                   |
|  ②~⑦ | 同方案一     | 团队增量同步                                                                                     |                   |
|  ⑧  | 链 + 无条件   | `execute as @a[scores={deaths=0}] run scoreboard players set @s deaths 1`                       | 防除零（先处理）  |
|  ⑨  | 链 + 无条件   | `execute as @a run scoreboard players operation @s kdRatio = @s playerKills`                    | KD = 击杀         |
|  ⑩  | 链 + 无条件   | `execute as @a run scoreboard players operation @s kdRatio *= #100 const100`                    | KD = 击杀 × 100   |
|  ⑪  | 链 + 无条件   | `execute as @a run scoreboard players operation @s kdRatio /= @s deaths`                        | KD = 击杀×100 ÷ 死亡 |

> 📊 **阅读 KD**：显示 166 = KD 1.66，显示 40 = KD 0.40。可以修改 `#100 const100` 为 1000 获得更高精度。

---

### 5.3 为什么不用「累加后重置」方案

| 计分板目标     | 准则                 | 可 reset 清零？ | 原因                   |
| :------------- | :------------------- | :-------------: | :--------------------- |
| `playerKills`  | `playerKillCount`    |       ❌        | 游戏统计自动维护，秒回 |
| `deaths`       | `deathCount`         |       ❌        | 同上                   |
| `teamKills`    | `dummy`              |       ✅        | 纯虚拟，可任意修改     |
| `kdRatio`      | `dummy`              |       ✅        | 同上                   |
| `lastSync`     | `dummy`              |       ✅        | 同上                   |

只有 `dummy` 准则的分数能真正被 reset。`playerKillCount` / `deathCount` 是游戏引擎维护的只读数据——`reset` 只是暂时抹掉显示，下一次计分板同步时值会立刻恢复。因此依赖 reset 的方案对这类准则是无效的。

---

### 红石时钟说明

推荐以下方式触发脉冲命令方块：

- **漏斗时钟**（5 秒以上间隔）
- **观察者时钟**（配合红石）
- **循环命令方块 + `/schedule`**（无需物理方块，最干净）

```mcfunction
# 放在循环命令方块中，每 5 秒自调度一次
schedule function <本函数> 5s
```

---

## 六、个人 KD 比率计算

### 6.1 百分制 KD（推荐）

Minecraft 计分板只存整数，5 杀 ÷ 3 死 = 1（不是 1.67），2 杀 ÷ 5 死 = 0。先乘 100 再除，把结果放大后阅读：

```mcfunction
# 创建常数
/scoreboard objectives add const100 dummy
/scoreboard players set #100 const100 100

# 对每个玩家计算 KD（百分制）
execute as @a run scoreboard players operation @s kdRatio = @s playerKills
execute as @a run scoreboard players operation @s kdRatio *= #100 const100
execute as @a run scoreboard players operation @s kdRatio /= @s deaths
```

- 显示 **166** → KD 1.66
- 显示 **40** → KD 0.40
- 显示 **250** → KD 2.50

### 6.2 避免除以零

```mcfunction
# 方法一：计算前把 deaths=0 的玩家设为 1（推荐）
execute as @a[scores={deaths=0}] run scoreboard players set @s deaths 1

# 方法二：全员 +1（会让 KD 整体偏低，不推荐）
# execute as @a run scoreboard players add @s deaths 1
```

> ⚠️ 方法二会导致每人死亡数虚高 1，KD 整体偏低，尤其在死亡数少时偏差很大。

### 6.3 显示 KD

```mcfunction
# 在右侧显示 KD 比率
/scoreboard objectives setdisplay sidebar kdRatio
```

---

## 七、常用管理命令速查

### 7.1 分数操作

| 操作             | 命令                                               |
| :--------------- | :------------------------------------------------- |
| 查看玩家所有分数 | `scoreboard players list 玩家名`                 |
| 查看特定目标     | `scoreboard players list 玩家名`（看对应目标）   |
| 手动给玩家加分   | `scoreboard players add 玩家名 目标名 数值`      |
| 手动设置分数     | `scoreboard players set 玩家名 目标名 数值`      |
| 重置玩家分数     | `scoreboard players reset 玩家名 目标名`         |
| 重置所有分数     | `scoreboard players reset 玩家名`                |
| 分数转移         | `scoreboard players operation A 目标A = B 目标B` |

### 7.2 计分板管理

| 操作           | 命令                                                         |
| :------------- | :----------------------------------------------------------- |
| 查看所有计分板 | `scoreboard objectives list`                               |
| 删除计分板     | `scoreboard objectives remove 目标名`                      |
| 修改显示名称   | `scoreboard objectives modify 目标名 displayname "新名称"` |

### 7.3 查看团队数据

```mcfunction
# 查看红队总击杀（虚拟玩家 RedTeam）
scoreboard players list RedTeam

# 查看蓝队总击杀（虚拟玩家 BlueTeam）
scoreboard players list BlueTeam
```

---

## 八、注意事项

### 8.1 关于 `reset` 命令的重要说明

| 准则类型 | 示例 | reset 效果 |
| :------- | :--- | :--------- |
| 游戏统计准则 | `playerKillCount`、`deathCount` | 暂时清空显示，下次同步立即恢复原值 ❌ |
| 虚拟准则 | `dummy`（如 `teamKills`、`kdRatio`、`lastSync`） | 真正删除分数，可重新设置 ✅ |

> ✅ **统计面板**（按 ESC → 统计信息）中的击杀、死亡等原始数据，**无法通过任何 `/scoreboard` 命令修改**。

### 8.2 正确方案总结

| 方案               | 原理                       | 是否推荐     |
| :----------------- | :------------------------- | :----------: |
| **增量同步** | 每次只加增量（当前 - 上次同步） | ✅ 推荐      |
| **累加后重置** | 累加后 reset `playerKills` | ❌ 无效      |

`playerKillCount` 是游戏引擎维护的只读数据，reset 后下次同步值会立刻恢复。所以累加后无法真正清零，必须用增量同步。

### 8.3 命令方块设置

- **脉冲命令方块**：需要红石信号触发
- **链命令方块**：设为**无条件**，防止某队无人在线时链条断裂
- **所有链命令方块**：箭头指向同一方向，排在脉冲命令方块正后方
- **虚拟分数初始化**：`RedTeam`、`BlueTeam`、`#100` 等虚拟分数的初值需要在聊天栏手动设好

### 8.4 性能建议

- 红石时钟间隔建议 **5 秒以上**，避免高频触发造成卡顿
- 使用 `@a` 选择器时，尽量加 `[team=Red]` 等过滤条件，减少运算量
- 如果服务器人数较多，建议只在活动期间开启统计

---

## 附录：快速部署脚本

### 聊天栏一次性执行（复制粘贴即可）

```mcfunction
# 创建计分板
/scoreboard objectives add playerKills playerKillCount "玩家击杀"
/scoreboard objectives add deaths deathCount "死亡次数"
/scoreboard objectives add totalKills totalKillCount "总击杀"
/scoreboard objectives add teamKills dummy "团队总击杀"
/scoreboard objectives add kdRatio dummy "KD比率"
/scoreboard objectives add lastSync dummy "上次同步值"
/scoreboard objectives add const100 dummy
/scoreboard players set #100 const100 100

# 创建队伍（1.20.5+）
/team add Red "红队"
/team add Blue "蓝队"

# 显示计分板
/scoreboard objectives setdisplay sidebar teamKills
```

### 加入玩家示例

```mcfunction
/team join Red Alice
/team join Red Bob
/team join Blue Charlie
/team join Blue David
```

---

> 📌 **最后提醒**：所有 `/scoreboard` 命令都是安全的，不会破坏游戏原始统计数据。
