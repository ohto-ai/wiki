# Minecraft 1.20.6 计分板 K/D 统计系统

## 目录

- [一、计分板创建（聊天栏执行）](#一计分板创建聊天栏执行)
- [二、队伍创建与成员管理（聊天栏执行）](#二队伍创建与成员管理聊天栏执行)
- [三、计分板显示（聊天栏执行）](#三计分板显示聊天栏执行)
- [四、命令方块布置方案](#四命令方块布置方案)
- [五、KD 比率说明](#五kd-比率说明)
- [六、常用管理命令速查](#六常用管理命令速查)
- [七、注意事项](#七注意事项)

---

## 一、计分板创建（聊天栏执行）

> ⚠️ 以下命令在聊天栏**执行一次**即可，无需放入命令方块。

### 1.1 个人统计（游戏自动维护）

```mcfunction
# 玩家击杀数（只统计击杀玩家）
/scoreboard objectives add playerKills playerKillCount "玩家击杀"

# 死亡次数
/scoreboard objectives add deaths deathCount "死亡次数"

# 造成伤害（单位：半颗心，1 伤害 = 半颗心）
/scoreboard objectives add damageDealt minecraft.custom:minecraft.damage_dealt "造成伤害"

# 承受伤害
/scoreboard objectives add damageTaken minecraft.custom:minecraft.damage_taken "承受伤害"
```

### 1.2 团队统计与辅助目标（虚拟分数）

```mcfunction
# === 团队累计（虚拟玩家 RedTeam / BlueTeam 持有）===
/scoreboard objectives add teamKills dummy "团队击杀"
/scoreboard objectives add teamDeaths dummy "团队死亡"
/scoreboard objectives add teamDamageDealt dummy "团队造成伤害"
/scoreboard objectives add teamDamageTaken dummy "团队承受伤害"

# === 个人 KD 比率 ===
/scoreboard objectives add kdRatio dummy "KD比率"

# === 增量同步值（每人每维度一个）===
/scoreboard objectives add lastKillSync dummy "击杀同步"
/scoreboard objectives add lastDeathSync dummy "死亡同步"
/scoreboard objectives add lastDmgDealtSync dummy "伤害同步"
/scoreboard objectives add lastDmgTakenSync dummy "承伤同步"

# === KD 精度常数 ===
/scoreboard objectives add const100 dummy
/scoreboard players set #100 const100 100
```

### 1.3 汇总

| 目标 | 准则 | 说明 |
|:-----|:-----|:-----|
| `playerKills` | `playerKillCount` | 个人击杀（只读） |
| `deaths` | `deathCount` | 个人死亡（只读） |
| `damageDealt` | `minecraft.custom:minecraft.damage_dealt` | 个人造成伤害（只读） |
| `damageTaken` | `minecraft.custom:minecraft.damage_taken` | 个人承受伤害（只读） |
| `teamKills` | `dummy` | 团队击杀 |
| `teamDeaths` | `dummy` | 团队死亡 |
| `teamDamageDealt` | `dummy` | 团队造成伤害 |
| `teamDamageTaken` | `dummy` | 团队承受伤害 |
| `kdRatio` | `dummy` | 个人 KD（百分制） |
| `lastKillSync` | `dummy` | 击杀增量同步 |
| `lastDeathSync` | `dummy` | 死亡增量同步 |
| `lastDmgDealtSync` | `dummy` | 造成伤害增量同步 |
| `lastDmgTakenSync` | `dummy` | 承受伤害增量同步 |
| `const100` | `dummy` | KD 精度倍数 |

---

## 二、队伍创建与成员管理（聊天栏执行）

> ⚠️ 1.20.5+ 中 `/scoreboard teams` 已拆分为独立命令 `/team`。

### 2.1 创建队伍

```mcfunction
/team add Red "红队"
/team add Blue "蓝队"
```

### 2.2 将玩家加入队伍

```mcfunction
# 替换 玩家名 为实际 ID
/team join Red 玩家名
/team join Blue 玩家名

# 批量加入示例
/team join Red Alice
/team join Red Bob
/team join Blue Charlie
/team join Blue David
```

### 2.3 队伍管理命令

```mcfunction
/team list              # 查看所有队伍
/team list Red          # 查看队伍成员
/team leave 玩家名      # 将玩家移出队伍
/team remove Red        # 删除队伍
```

---

## 三、计分板显示（聊天栏执行）

侧边栏同一时间只能显示一个目标，根据需要切换：

```mcfunction
# 显示团队击杀（推荐默认）
/scoreboard objectives setdisplay sidebar teamKills

# 或显示个人 KD
/scoreboard objectives setdisplay sidebar kdRatio

# 或显示个人击杀
/scoreboard objectives setdisplay sidebar playerKills

# 隐藏侧边栏
/scoreboard objectives setdisplay sidebar
```

---

## 四、命令方块布置方案

### 核心原理

`playerKillCount`、`deathCount`、`damage_dealt`、`damage_taken` 是**游戏统计自动维护**的只读分数——玩家每杀一人/死一次/造成伤害/承受伤害，对应分数自动增加，**无法被 `/scoreboard players reset` 真正清零**（reset 后游戏下次同步会恢复原值）。

正确做法是用虚拟分数记录「上次同步值」，每次只把**增量**加到团队总分：

```
增量 = 当前值 - 上次同步值
团队总分 += 增量
上次同步值 = 当前值
```

初值未设置时视为 0，首次运行会把全部历史数据一次性计入团队。

### 方案 A：命令方块链

共 **29 个命令方块**（1 脉冲 + 28 链），覆盖 4 项统计 × 2 个队伍 + KD 计算。

```
[红石时钟] → [脉冲①] → [链②~⑬ 红队] → [链⑭~㉕ 蓝队] → [链㉖~㉙ KD]
```

> ✅ 所有链命令方块均设为**无条件 + 始终活动**，箭头指向同一方向。

#### 第 1 组：红队增量同步（② ~ ⑬）

| 序号 | 命令 | 说明 |
|:---:|:-----|:-----|
| ① | *(脉冲方块，触发整条链)* | 由时钟控制 |
| ② | `execute as @a[team=Red] run scoreboard players operation RedTeam teamKills += @s playerKills` | 击杀 +当前 |
| ③ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamKills -= @s lastKillSync` | 击杀 -上次 = 增量 |
| ④ | `execute as @a[team=Red] run scoreboard players operation @s lastKillSync = @s playerKills` | 击杀 更新同步 |
| ⑤ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamDeaths += @s deaths` | 死亡 +当前 |
| ⑥ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamDeaths -= @s lastDeathSync` | 死亡 增量 |
| ⑦ | `execute as @a[team=Red] run scoreboard players operation @s lastDeathSync = @s deaths` | 死亡 更新同步 |
| ⑧ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageDealt += @s damageDealt` | 造成伤害 +当前 |
| ⑨ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageDealt -= @s lastDmgDealtSync` | 造成伤害 增量 |
| ⑩ | `execute as @a[team=Red] run scoreboard players operation @s lastDmgDealtSync = @s damageDealt` | 造成伤害 更新同步 |
| ⑪ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageTaken += @s damageTaken` | 承伤 +当前 |
| ⑫ | `execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageTaken -= @s lastDmgTakenSync` | 承伤 增量 |
| ⑬ | `execute as @a[team=Red] run scoreboard players operation @s lastDmgTakenSync = @s damageTaken` | 承伤 更新同步 |

#### 第 2 组：蓝队增量同步（⑭ ~ ㉕）

与红队完全对称，仅 `team=Red` → `team=Blue`、`RedTeam` → `BlueTeam`。

| 序号 | 命令 | 说明 |
|:---:|:-----|:-----|
| ⑭ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills += @s playerKills` | 击杀 +当前 |
| ⑮ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills -= @s lastKillSync` | 击杀 增量 |
| ⑯ | `execute as @a[team=Blue] run scoreboard players operation @s lastKillSync = @s playerKills` | 击杀 更新同步 |
| ⑰ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDeaths += @s deaths` | 死亡 +当前 |
| ⑱ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDeaths -= @s lastDeathSync` | 死亡 增量 |
| ⑲ | `execute as @a[team=Blue] run scoreboard players operation @s lastDeathSync = @s deaths` | 死亡 更新同步 |
| ⑳ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageDealt += @s damageDealt` | 造成伤害 +当前 |
| ㉑ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageDealt -= @s lastDmgDealtSync` | 造成伤害 增量 |
| ㉒ | `execute as @a[team=Blue] run scoreboard players operation @s lastDmgDealtSync = @s damageDealt` | 造成伤害 更新同步 |
| ㉓ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageTaken += @s damageTaken` | 承伤 +当前 |
| ㉔ | `execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageTaken -= @s lastDmgTakenSync` | 承伤 增量 |
| ㉕ | `execute as @a[team=Blue] run scoreboard players operation @s lastDmgTakenSync = @s damageTaken` | 承伤 更新同步 |

#### 第 3 组：个人 KD 计算（㉖ ~ ㉙）

| 序号 | 命令 | 说明 |
|:---:|:-----|:-----|
| ㉖ | `execute as @a[scores={deaths=0}] run scoreboard players set @s deaths 1` | 防除零 |
| ㉗ | `execute as @a run scoreboard players operation @s kdRatio = @s playerKills` | KD = 击杀 |
| ㉘ | `execute as @a run scoreboard players operation @s kdRatio *= #100 const100` | KD × 100 |
| ㉙ | `execute as @a run scoreboard players operation @s kdRatio /= @s deaths` | KD ÷ 死亡 |

> 📊 阅读 KD：显示 166 = KD 1.66，显示 40 = KD 0.40。将 `#100` 改为 1000 可获更高精度。

### 红石时钟说明

推荐以下方式触发脉冲命令方块：

- **漏斗时钟**（5 秒以上间隔）
- **观察者时钟**（配合红石）
- **循环命令方块 + `/schedule`**（无需物理方块，需配合数据包函数使用）

---

### 方案 B：数据包函数（推荐）

如果你有数据包权限，把全部命令写进一个 `.mcfunction` 文件比摆 29 个方块简单得多。

#### 目录结构

在存档的 `datapacks/` 下创建：

```
datapacks/kd/
├── pack.mcmeta
└── data/
    └── kd/
        └── function/
            └── sync.mcfunction
```

#### pack.mcmeta

```json
{
  "pack": {
    "pack_format": 41,
    "description": "KD Scoreboard Sync"
  }
}
```

> `pack_format`：1.20.5/1.20.6 = **41**。其他版本参考 [Minecraft Wiki](https://minecraft.wiki/w/Data_pack#Pack_format)。

#### sync.mcfunction

直接把方案 A 的 28 条命令（② ~ ㉙）复制进去，去掉序号即可：

```mcfunction
# === 红队 ===
execute as @a[team=Red] run scoreboard players operation RedTeam teamKills += @s playerKills
execute as @a[team=Red] run scoreboard players operation RedTeam teamKills -= @s lastKillSync
execute as @a[team=Red] run scoreboard players operation @s lastKillSync = @s playerKills
execute as @a[team=Red] run scoreboard players operation RedTeam teamDeaths += @s deaths
execute as @a[team=Red] run scoreboard players operation RedTeam teamDeaths -= @s lastDeathSync
execute as @a[team=Red] run scoreboard players operation @s lastDeathSync = @s deaths
execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageDealt += @s damageDealt
execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageDealt -= @s lastDmgDealtSync
execute as @a[team=Red] run scoreboard players operation @s lastDmgDealtSync = @s damageDealt
execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageTaken += @s damageTaken
execute as @a[team=Red] run scoreboard players operation RedTeam teamDamageTaken -= @s lastDmgTakenSync
execute as @a[team=Red] run scoreboard players operation @s lastDmgTakenSync = @s damageTaken

# === 蓝队 ===
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills += @s playerKills
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamKills -= @s lastKillSync
execute as @a[team=Blue] run scoreboard players operation @s lastKillSync = @s playerKills
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDeaths += @s deaths
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDeaths -= @s lastDeathSync
execute as @a[team=Blue] run scoreboard players operation @s lastDeathSync = @s deaths
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageDealt += @s damageDealt
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageDealt -= @s lastDmgDealtSync
execute as @a[team=Blue] run scoreboard players operation @s lastDmgDealtSync = @s damageDealt
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageTaken += @s damageTaken
execute as @a[team=Blue] run scoreboard players operation BlueTeam teamDamageTaken -= @s lastDmgTakenSync
execute as @a[team=Blue] run scoreboard players operation @s lastDmgTakenSync = @s damageTaken

# === KD 计算 ===
execute as @a[scores={deaths=0}] run scoreboard players set @s deaths 1
execute as @a run scoreboard players operation @s kdRatio = @s playerKills
execute as @a run scoreboard players operation @s kdRatio *= #100 const100
execute as @a run scoreboard players operation @s kdRatio /= @s deaths
```

#### 触发方式

```mcfunction
# 方式一：手动触发一次
/function kd:sync

# 方式二：循环命令方块 + schedule 自调度（推荐）
# 在 sync.mcfunction 末尾加一行：
schedule function kd:sync 5s

# 然后手动执行一次 /function kd:sync 即可启动循环
```

不需要红石时钟，不需要摆命令方块。`/reload` 即可热更新函数内容。

### 方案对比

| | 方案 A：命令方块链 | 方案 B：数据包函数 |
|:---|:---|:---|
| 搭建难度 | 摆 29 个方块 + 逐个贴命令 | 创建 3 个文件 |
| 修改维护 | 逐方块点开编辑 | 编辑 `.mcfunction` 后 `/reload` |
| 依赖 | 红石时钟 | `/schedule`（无物理方块） |
| 适用场景 | 纯生存 / 无管理员权限 | 有数据包/管理员权限 |
| 性能 | 每 tick 检查方块 | 直接执行，更轻量 |

---

## 五、KD 比率说明

### 百分制 KD

Minecraft 计分板只存整数，5 杀 ÷ 3 死 = 1（不是 1.67），2 杀 ÷ 5 死 = 0。因此采用 **先乘 100 再除** 的百分制：

| 实际 KD | 计分板显示 |
|:--------|:----------|
| 2.50 | 250 |
| 1.66 | 166 |
| 1.00 | 100 |
| 0.40 | 40 |
| 0.00 | 0 |

### 避免除以零

命令 ㉖ 在计算 KD 前把所有 `deaths=0` 的玩家临时设为 1。这只影响计分板显示，**不会改动游戏底层的真实死亡数**。

---

## 六、常用管理命令速查

### 6.1 查看玩家数据

```mcfunction
# 查看某玩家的全部计分板分数
scoreboard players list 玩家名

# 查看某玩家特定目标的分数
scoreboard players get 玩家名 playerKills
```

### 6.2 查看团队数据

```mcfunction
# 查看红队全部统计（虚拟玩家 RedTeam）
scoreboard players list RedTeam

# 查看蓝队全部统计
scoreboard players list BlueTeam
```

### 6.3 分数操作

| 操作 | 命令 |
|:-----|:-----|
| 手动加分 | `scoreboard players add 玩家名 目标名 数值` |
| 手动设分 | `scoreboard players set 玩家名 目标名 数值` |
| 重置分数 | `scoreboard players reset 玩家名 目标名` |
| 分数转移 | `scoreboard players operation A 目标A = B 目标B` |

### 6.4 计分板管理

| 操作 | 命令 |
|:-----|:-----|
| 查看所有计分板 | `scoreboard objectives list` |
| 删除计分板 | `scoreboard objectives remove 目标名` |
| 修改显示名称 | `scoreboard objectives modify 目标名 displayname "新名称"` |

---

## 七、注意事项

### 7.1 关于 `reset` 命令

| 准则类型 | 示例 | reset 效果 |
|:---------|:-----|:-----------|
| 游戏统计 | `playerKillCount`、`deathCount`、`damage_dealt`、`damage_taken` | 暂时清空，下次同步恢复 ❌ |
| 虚拟准则 | `dummy`（`teamKills`、`kdRatio`、`lastKillSync` 等） | 真正删除，可重新赋值 ✅ |

> ✅ 统计面板（ESC → 统计信息）中的原始数据**无法被任何 `/scoreboard` 命令修改**。

### 7.2 方案原理

`playerKillCount` 等游戏统计准则是引擎维护的只读数据，无法 reset 清零。因此必须用**增量同步**：每次只把「当前值 - 上次同步值」的差额加给团队，然后更新同步值。

### 7.3 命令方块设置

- **脉冲命令方块**：需要红石信号触发，设为"需红石"
- **链命令方块**：全部设为**无条件 + 始终活动**，防止某队无人在线时链条断裂
- 箭头方向必须一致，排在脉冲方块正后方
- 虚拟分数（`RedTeam`、`BlueTeam`、`#100`）无需手动初始化——未设置时默认 0

### 7.4 性能建议

- 红石时钟间隔建议 **5 秒以上**
- 使用 `@a[team=Red]` 等过滤条件减少运算量
- 服务器人数较多时，建议只在活动期间开启统计

---

## 附录：快速部署脚本

### 聊天栏一次性执行（复制粘贴即可）

```mcfunction
# === 个人统计 ===
/scoreboard objectives add playerKills playerKillCount "玩家击杀"
/scoreboard objectives add deaths deathCount "死亡次数"
/scoreboard objectives add damageDealt minecraft.custom:minecraft.damage_dealt "造成伤害"
/scoreboard objectives add damageTaken minecraft.custom:minecraft.damage_taken "承受伤害"

# === 团队统计 ===
/scoreboard objectives add teamKills dummy "团队击杀"
/scoreboard objectives add teamDeaths dummy "团队死亡"
/scoreboard objectives add teamDamageDealt dummy "团队造成伤害"
/scoreboard objectives add teamDamageTaken dummy "团队承受伤害"

# === KD 与辅助 ===
/scoreboard objectives add kdRatio dummy "KD比率"
/scoreboard objectives add lastKillSync dummy "击杀同步"
/scoreboard objectives add lastDeathSync dummy "死亡同步"
/scoreboard objectives add lastDmgDealtSync dummy "伤害同步"
/scoreboard objectives add lastDmgTakenSync dummy "承伤同步"
/scoreboard objectives add const100 dummy
/scoreboard players set #100 const100 100

# === 队伍（1.20.5+）===
/team add Red "红队"
/team add Blue "蓝队"

# === 侧边栏 ===
/scoreboard objectives setdisplay sidebar teamKills
```

### 加入玩家

```mcfunction
/team join Red Alice
/team join Red Bob
/team join Blue Charlie
/team join Blue David
```

---

> 📌 **最后提醒**：所有 `/scoreboard` 命令都是安全的，不会破坏游戏原始统计数据。
