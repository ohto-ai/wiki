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
/scoreboard objectives add damageTaken minecraft.custom:minecraft:damage_taken "承受伤害"
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

```mcfunction
# 创建红队和蓝队
/scoreboard teams add Red "红队"
/scoreboard teams add Blue "蓝队"
```

### 2.2 将玩家加入队伍

```mcfunction
# 将指定玩家加入红队（替换 玩家名 为实际 ID）
/scoreboard teams join Red 玩家名

# 将指定玩家加入蓝队
/scoreboard teams join Blue 玩家名

# 批量加入示例
/scoreboard teams join Red Alice
/scoreboard teams join Red Bob
/scoreboard teams join Blue Charlie
/scoreboard teams join Blue David
```

### 2.3 队伍管理命令

```mcfunction
# 查看所有队伍
/scoreboard teams list

# 查看队伍成员
/scoreboard teams list Red

# 将玩家移出队伍
/scoreboard teams leave 玩家名

# 删除队伍
/scoreboard teams remove Red
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

### 5.1 方案一：增量同步方案（推荐）

此方案不会重复累加，数字精确。

#### 命令方块布置图

```
[红石时钟] → [脉冲①] → [链②] → [链③] → [链④] → [链⑤]
```

| 顺序 | 方块类型      | 命令                                                                                               |
| :--: | :------------ | :------------------------------------------------------------------------------------------------- |
|  ①  | 脉冲 + 需红石 | 触发整个链（由时钟控制）                                                                           |
|  ②  | 链 + 有条件   | `execute as @a[team=Red] run scoreboard players operation RedTeam teamKills += @s playerKills`   |
|  ③  | 链 + 有条件   | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills += @s playerKills` |
|  ④  | 链 + 有条件   | `execute as @a[team=Red] run scoreboard players operation @s lastSync = @s playerKills`          |
|  ⑤  | 链 + 有条件   | `execute as @a[team=Blue] run scoreboard players operation @s lastSync = @s playerKills`         |

> ⚠️ **问题**：此方案仍然会重复累加，因为每次触发都会把 `playerKills` 的全部值加一遍。要实现真正的增量，需要用更复杂的比较逻辑。如果觉得麻烦，推荐直接使用下面的**方案二（定期重置）**。

---

### 5.2 方案二：定期重置方案（简单实用，推荐）

**原理**：每隔一段时间，将所有玩家的 `playerKills` 累加到团队后，**重置所有人的 `playerKills` 为 0**，开始新一轮统计。

#### 命令方块布置图

```
[红石时钟] → [脉冲①] → [链②] → [链③] → [链④] → [链⑤] → [链⑥]
```

| 顺序 | 方块类型      | 命令                                                                                                          |
| :--: | :------------ | :------------------------------------------------------------------------------------------------------------ |
|  ①  | 脉冲 + 需红石 | 触发整个链（由时钟控制）                                                                                      |
|  ②  | 链 + 有条件   | `scoreboard players operation RedTeam teamKills += @a[team=Red] playerKills`                                |
|  ③  | 链 + 有条件   | `scoreboard players operation BlueTeam teamKills += @a[team=Blue] playerKills`                              |
|  ④  | 链 + 有条件   | `scoreboard players reset @a[team=Red] playerKills`                                                         |
|  ⑤  | 链 + 有条件   | `scoreboard players reset @a[team=Blue] playerKills`                                                        |
|  ⑥  | 链 + 有条件   | `scoreboard players reset @a[team=Red] lastSyncscoreboard players reset @a[team=Blue] lastSync`（如有使用） |

#### 红石时钟说明

推荐使用以下方式触发脉冲命令方块：

- **漏斗时钟**（5 秒以上间隔）
- **观察者时钟**（配合红石）
- **循环命令方块 + 延时**（用 `schedule` 命令）

---

### 5.3 方案三：完整版命令方块链（含 KD 计算）

如果你想一次性完成 **团队累加 + 重置 + KD 计算**，使用以下完整链：

```
[红石时钟] → [脉冲①] → [链②] → [链③] → [链④] → [链⑤] → [链⑥] → [链⑦] → [链⑧]
```

| 顺序 | 方块类型      | 命令                                                                                              |
| :--: | :------------ | :------------------------------------------------------------------------------------------------ |
|  ①  | 脉冲 + 需红石 | 触发整个链                                                                                        |
|  ②  | 链 + 有条件   | `scoreboard players operation RedTeam teamKills += @a[team=Red] playerKills`                    |
|  ③  | 链 + 有条件   | `scoreboard players operation BlueTeam teamKills += @a[team=Blue] playerKills`                  |
|  ④  | 链 + 有条件   | `scoreboard players reset @a[team=Red] playerKills`                                             |
|  ⑤  | 链 + 有条件   | `scoreboard players reset @a[team=Blue] playerKills`                                            |
|  ⑥  | 链 + 有条件   | `execute as @a run scoreboard players operation @s kdRatio = @s playerKills`                    |
|  ⑦  | 链 + 有条件   | `execute as @a run scoreboard players operation @s kdRatio /= @s deaths`                        |
|  ⑧  | 链 + 有条件   | `scoreboard players reset @a[team=Red] lastSyncscoreboard players reset @a[team=Blue] lastSync` |

> ⚠️ **KD 计算注意**：如果玩家的 `deaths` 为 0，除法会报错。建议先用条件判断或给每个玩家的死亡数 +1 再计算。

---

## 六、个人 KD 比率计算

### 6.1 整数 KD（聊天栏执行或命令方块）

```mcfunction
# 对每个玩家计算 KD = 击杀 ÷ 死亡（整数商）
execute as @a run scoreboard players operation @s kdRatio = @s playerKills
execute as @a run scoreboard players operation @s kdRatio /= @s deaths
```

### 6.2 避免除以零

```mcfunction
# 方法一：给所有玩家的 deaths 先 +1（聊天栏执行一次）
execute as @a run scoreboard players add @s deaths 1

# 方法二：在计算前用条件判断（命令方块链中）
execute as @a[scores={deaths=0}] run scoreboard players set @s deaths 1
```

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

| 命令                                        | 影响范围                         | 是否影响统计面板 |
| :------------------------------------------ | :------------------------------- | :--------------: |
| `scoreboard players reset @s playerKills` | 仅计分板上的`playerKills` 分数 |    ❌ 不影响    |
| `scoreboard players reset @s deaths`      | 仅计分板上的`deaths` 分数      |    ❌ 不影响    |
| `scoreboard players reset @s`             | 玩家所有计分板分数               |    ❌ 不影响    |

> ✅ **统计面板**（按 ESC → 统计信息）中的击杀、死亡等原始数据，**无法通过任何 `/scoreboard` 命令修改**。重置计分板分数只影响屏幕显示，不影响底层统计。

### 8.2 团队累加方案选择

| 方案               | 优点             | 缺点                     |
| :----------------- | :--------------- | :----------------------- |
| **增量同步** | 数据实时、精确   | 命令复杂，需要额外计分板 |
| **定期重置** | 命令简单，易实现 | 数据周期清零，非实时累计 |
| **手动触发** | 可控性强         | 需要人工操作             |

### 8.3 命令方块设置

- **脉冲命令方块**：需要红石信号触发
- **链命令方块**：必须设置为"有条件"，并确保箭头指向正确
- **所有链命令方块**：需要设置在脉冲命令方块的正后方（箭头方向一致）

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

# 创建队伍
/scoreboard teams add Red "红队"
/scoreboard teams add Blue "蓝队"

# 显示计分板
/scoreboard objectives setdisplay sidebar playerKills
```

### 加入玩家示例

```mcfunction
/scoreboard teams join Red Alice
/scoreboard teams join Red Bob
/scoreboard teams join Blue Charlie
/scoreboard teams join Blue David
```

---

> 📌 **最后提醒**：所有 `/scoreboard` 命令都是安全的，不会破坏游戏原始统计数据。
