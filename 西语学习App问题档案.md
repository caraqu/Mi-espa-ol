# 西语学习 App 问题档案

用于持续记录每次发现的问题、根因、影响范围、修复条件、验证结果和防复发规则。后续每处理一个问题，都在本文件追加一条记录。

## 固定维护协议

以后每次修改或更新西语学习 App 的 `index.html`，必须按以下顺序执行：

1. **先读档案**：修改代码前完整阅读本文件，确认历史问题、未解决事项、已验证范围和下一检查起点。
2. **确定本次范围**：记录本次涉及的 Lesson、页面、共享函数、数据集和功能入口。
3. **修改前防回归**：把所有历史问题转成检查项；本次新增或改写的代码不得再次出现相同模式。
4. **执行增量检查**：课程内容和课程专属代码从“下一检查起点”继续；不重复人工检查已经确认且未受本次修改影响的部分。
5. **执行历史问题回归测试**：无论本次修改哪一课，都要重新测试档案内所有已修复问题的关键复现路径。
6. **共享代码变更时扩大范围**：如果修改导航、状态、存储、题型渲染等所有课程共用的函数，必须自动扫描全部 Lesson，不能只检查新增课程。
7. **更新档案**：记录新问题、根因、修改位置、验证结果、仍缺少的材料、最新确认范围及下一检查起点。
8. **交付前核对版本**：同步更新 index 页脚的版本号、日期和改动摘要，并确认档案状态与实际代码一致。

### 增量检查原则

“不从头重复检查”只适用于未被本次改动影响的课程专属内容。以下情况仍必须回查旧课程：

- 本次修改了所有课程共用的函数或数据结构。
- 新代码复用了旧组件，可能影响旧 Lesson。
- 历史问题的复现路径经过了本次修改区域。
- 自动完整性检查发现旧课程与当前注册表不一致。

这样既能减少重复工作，也不会因为跳过旧课程而漏掉共享代码造成的回归。

## 当前检查基线

- 当前 index 版本：`v44.1`（2026-08-27）。
- 当前 index 最高完整课程：Lesson 47；下一门新增课程的增量检查起点：Lesson 48。
- Lesson 36–47 已按 `Spanish_Clase_36-47_Study_Guide_CN_复核修订版.pdf` 重建或更新；Lesson 43 原材料明确不足的部分已在 Class Notes 中标明，没有杜撰课堂事实。
- 首页、首次启动、导航、恢复进度和全局词库改为共用 `LESSON_REGISTRY`；已自动扫描 Lesson 1–47。
- Lesson 36–47 新词已再次与旧课全量去重；13 个重复卡片已从新课词库移除，但其课堂语境继续保留在 Notes / Quiz。
- 冷启动和跨课切换的四种模式已通过数据层与导航层回归；所有直接页面目标存在，页面 ID 无重复。
- 共享代码已改动，因此本次对 Lesson 1–47 执行了注册表、题库、Master Review、单词复习与存储迁移的全量自动检查；这不等于重新人工校订 Lesson 1–35 的全部西语内容。
- `BUG-005` 的代码修复已在 `index v44.1`、`sw.js v44.1` 和稳定 manifest identity 中完成；本地 Service Worker 生命周期与页面状态测试已验证安装、waiting、用户确认接管、版本化缓存清理、离线回退和 localStorage 保留。
- 当前没有尚未实施的档案代码问题。仍需在实际发布网址和用户真实 iPhone 上完成一次端到端更新验证；这属于发布验收，不影响当前文件的代码完整性。

### 下一次修改开始时

1. 发布 `v44.1` 时必须把 `index.html`、`sw.js`、`manifest.json` 和图标放在同一稳定目录；取得实际发布网址后，继续完成 `BUG-005` 的 iPhone 端到端验收。
2. 如新增 Lesson 48，从 Lesson 48 开始检查课程专属内容，同时对 Lesson 1–48 执行注册表、页面目标、全局词库和 Master Review 自动扫描。
3. 如修改共享导航、状态、存储或渲染函数，对 Lesson 1–47 做全量自动回归检查。
4. 新课 Class Notes 继续执行“保留全部有效内容、合并重复、尽量精简；标题、副标题与章节标题统一英文”的规范。
5. 每次发布新版本都要同步递增 index 的 `APP_VERSION`、页脚版本和 `sw.js` 的 `APP_VERSION` / cache name，并重跑 PWA 更新测试。

## ENH-001：Master Review 缺少按语法点覆盖和掌握退出机制

- 提出日期：2026-08-24
- 当前状态：已修复并通过自动回归（`index v44.0`）
- 影响范围：`MASTER_REVIEW_BANK`、抽题算法、进度统计、进度页面、题目身份和新课更新流程

### 原问题

1. 当前每次固定抽取 20 题，不能保证每个 active grammar skill 至少出现两道代表题。
2. 当前权重主要按单题计算，没有稳定的 `skillId` 和语法点级别掌握状态。
3. 当前“新课加权”使用 `lesson >= 33` 的硬编码，Lesson 38 与 Lesson 34 得到相同的新近加成。
4. 当前连续答对只降低单题权重，不会在一个语法点已经充分掌握后将其退出下一次常规复习。
5. 当前题目 ID 由题干和答案 hash 生成；修改措辞可能生成新 ID 并丢失原学习记录。

### 已确认的新规则

- 每个独立语法点或难点至少两道不同题目。
- Master Review 题量动态计算，不再固定 20 题。
- 同一 skill 的两道题各跨场次答对两次，共至少四次正确且最近无错误，才标记为 mastered。
- mastered skill 不进入下一次常规复习，但保留历史数据，并可在再次答错或新课重新涉及时激活。
- 最近课程按 Lesson 距离渐进加权，而不是使用永久阈值。
- 单个题目在两个独立出现机会中均第一次答对后，可以退出下一次常规队列；整个 skill 仍需至少两道代表题各答对两次。
- 新增题目没有历史记录，必须进入下一次 Master Review，不能只增加随机权重。
- 更新 index 后自动合并旧进度和新题库，不需要用户日常导出或重新导入进度。
- 完整规则以 `西语学习App更新规范.md` 为准。

### 已实施修复与验证（index v44.0）

1. 每题使用稳定 `questionId`，每个规则使用稳定 `skillId`；旧题保留 `MR-LEGACY-###` 身份并迁移原 hash 记录。
2. 新题必进下一 cycle；active skills 按错题、未见题、到期状态和距 Lesson 47 的距离渐进排序，不再使用固定课号阈值。
3. 每个 active skill 至少两道代表题；完整 cycle 最多每部分 24 题，超出时连续拆分并保存 cycle 进度。
4. 单题需要跨两个独立场次各第一次答对；skill 至少两题、共四次正确、跨两场次且最近四次无错才 mastered。
5. mastered 题与 skill 退出下一次常规复习；任一相关题答错立即重新激活。
6. 自动测试确认：58 个 skills 均有至少两题；144 道 Master 题 ID 唯一；106 道新增题必进新 cycle；同场次不能误掌握；跨两场次能掌握；答错能重新激活；单部分不超过 24 题。

## BUG-002：进度导出未包含 Master Review 学习记录

- 发现日期：2026-08-24
- 当前状态：已扩展并验证（`index v44.0`；Progress JSON schema v3）
- 严重程度：高（Master Review 进度无法随备份迁移，也无法提供给课件更新流程读取）

### 根因

Master Review 使用 `mi_espanol_master_stats_v1` 保存在浏览器本地存储，但 `exportProgress()` 当前只导出：

- 普通词汇 spaced-repetition 数据。
- 连续学习天数和最后学习日期。
- My Words。

`importProgress()` 也没有恢复 Master Review stats，因此 Export / Import 后会丢失 Master Review 的答错次数、连续正确、到期时间和掌握依据。

### 已实施修复（index v43.1）

1. Progress JSON 升级为 `schemaVersion: 2`，同时记录 `appVersion` 和导出时间。
2. Export 新增 `masterStats`，完整导出当前 `mi_espanol_master_stats_v1` 的逐题正确数、错误数、连续正确、level、最后作答时间、到期时间和最后选择。
3. Import 在新版 JSON 含有 `masterStats` 时恢复该数据。
4. 旧版 JSON 没有 `masterStats` 时不清空设备上现有的 Master Review 记录，保持向后兼容。
5. 已通过“新版导出后清空再导入”和“旧版 JSON 导入”两条自动测试。

### v44.0 扩展

- Progress JSON 已升级为 `schemaVersion: 3`，新增 `masterSkillStats` 与 `masterCycle`，同时继续导出 `masterStats`、普通词汇、My Words 和 streak。
- 导入兼容 schema v1/v2；旧文件没有新字段时，不会清空设备上已有的 Master 逐题、skill 或 cycle 数据。
- 导入后会执行旧题身份迁移、单词 mastery 迁移和 skill mastery 重算。

### 与更新流程的关系

- App 日常筛题由运行时直接读取并更新本地进度；用户新增课程时不需要导出或重新导入 progress JSON。
- 新版 index 必须自动保留旧题进度，并把无历史记录的新题强制加入下一次复习。
- Progress JSON 只用于备份、设备迁移、恢复或排查进度异常。
- iPhone 浏览器不能让 App 静默改写以前下载到“文件”中的 JSON；每次点击 Export 会生成包含当下最新进度的新快照，因此卸载前要重新 Export 一次。
- 从 `index v44.0` 起，Export 可以备份普通词汇、My Words、streak、Master 逐题记录、skill mastery 和未完成 cycle。

## BUG-003：已连续记住的单词不会退出常规复习

- 发现日期：2026-08-24
- 当前状态：已修复并通过迁移、方向独立性与手动重新激活测试（`index v44.0–v44.1`）
- 严重程度：高（词库持续增长，已掌握词继续占用每天复习容量）
- 影响范围：普通单词 Review、两个复习方向、daily selection、进度迁移和 mastered 状态

### 用户看到的问题

- 单词即使已经连续记住，仍只会被安排到越来越长的间隔，并可能继续进入 maintenance 抽样。
- 随着每课不断加入新词，常规复习池越来越大，用户无法完成全部内容。

### 根因

1. 当前 SM-2 逻辑只增加 `interval`，没有“连续记住两次后退出常规复习”的状态。
2. `getDueCards()` 会从 `wellKnown` 中抽取 maintenance cards，因此长期记住的单词仍可能回来。
3. 当前记录按 Spanish → English 和 English → Spanish 分方向保存，但没有方向级 mastered 和单词级 mastered。
4. 旧记录保存 `reps`、`interval`、`ef` 和 `nextReview`，没有明确的 `fullRecallStreak` 和 mastered 字段。

### 已确认的新规则

- `Missed`：连续次数清零，第二天再出现。
- 第一次 `Got it`：连续次数为 1，第二天再次确认。
- 第二次连续 `Got it`：该方向退出下一次常规复习。
- `Sort of` 不算完全记住，不能触发 mastered。
- 两个方向都满足后，整个单词退出常规复习。
- mastered 单词不再进入普通 maintenance 抽样，但保留历史数据和重新激活能力。
- `Missed → Got it → Missed → Got it` 后仍要出现；下一次再次 `Got it` 后，该方向才退出。

### 现有学习进度处理

- 上传的 HTML 不包含用户浏览器的本地答题数据，因此无法仅从 index 列出具体已掌握单词。
- 修复不要求用户日常导入进度；新版 App 在用户设备上启动时直接读取原 localStorage 并自动迁移。
- 现有 `reps` 会在答错时清零、成功时累加，可用 `reps >= 2` 作为已有连续成功两次的最佳现有依据。
- 新版开始保存明确的 `fullRecallStreak`、`lastQuality`、方向 mastered 和单词 mastered。
- 如果需要在修改代码前人工列出具体哪些词将退出，用户可以提供一次现有 progress JSON；这不是正常更新所必需的步骤。

### 已实施修复与验证

1. 每个方向保存 `fullRecallStreak`、`lastQuality`、`mastered` 和 `masteredAt`；保留原 localStorage key。
2. `reps >= 2` 的旧记录在首次启动时自动迁移为该方向 mastered。
3. 第一次 `Got it` 次日确认，第二次连续 `Got it` 退出；`Missed` 或 `Sort of` 清零并次日重现。
4. `getDueCards()` 完全排除 mastered 方向，不再放入 maintenance 抽样。
5. 自动测试确认：错→对→错→对仍出现；下一次再对才退出；一个方向 mastered 不隐藏另一个方向；旧进度迁移后立即按新规则生效。
6. v44.1 新增 `Mastered Vocabulary` 列表；可查看两个方向的独立状态，并只重新激活所选方向。重置后该方向立即回到常规复习，不影响另一个方向的记录。

## BUG-004：全局单词 Review 词库只接入到 Lesson 27

- 发现日期：2026-08-24
- 当前状态：已修复并通过 Lesson 1–47 覆盖与新课全量去重检查（`index v44.0–v44.1`）
- 严重程度：高（Lesson 28–36 的词汇没有进入全局单词 Review）

### 根因与范围

- `getAllReviewVocab()` 的手写数组目前只包含基础词库、Lesson 2–24、`L25_VOCAB`、`L26_VOCAB`、`L27_VOCAB` 和 My Words。
- 已经存在的 `L28_VOCAB`–`L36_VOCAB` 没有加入该数组。
- Lesson 37–47 的正式词汇数据集已纳入统一注册表。

### 已实施修复与验证

1. 建立统一 `LESSON_REGISTRY`，供课程启动、恢复、词汇去重、Class Notes 动态词表与全局 Review 共用。
2. 全局 Review 自动汇总 Lesson 1–47 与 My Words，不再维护易漏课的手写长数组。
3. 自动检查确认 47 个 Lesson 均有注册项；Lesson 36–47 的 vocabulary、quiz、dialogue 数据均非空；v44.1 课程注册词汇共 770 项，运行时再合并并去重用户可变的 My Words。
4. v44.1 按更新规范重新扫描全部旧词库，发现并移除 Lesson 36–47 中 13 个已在旧课出现的重复卡片；相关规则、变位和课堂语境继续保留在 Class Notes / Quiz，不扩大常规单词复习池。
5. `dedupeMyWords()` 改为每次启动都对照当前 `LESSON_REGISTRY`，不再依赖只运行一次的 v44 标志；未来新增 Lesson 后，设备上的 My Words 与新课重复项会自动清理。

## BUG-005：桌面 PWA 有时不会自动加载最新版本

- 发现日期：2026-08-24
- 当前状态：代码已修复并通过本地 PWA 回归（`index/sw v44.1`）；等待实际发布网址和真实 iPhone 端到端验收
- 严重程度：高（用户可能继续使用旧代码，并在卸载重装时误删本地学习进度）
- 影响范围：Service Worker、离线缓存、PWA 更新提示、卸载重装和 localStorage 数据安全

### 已确认的旧实现根因

- index 只执行 `navigator.serviceWorker.register('./sw.js')`，没有主动检查更新、显示“新版本可用”或控制 waiting worker 接管的逻辑。
- `sw.js` 永久使用未版本化的 cache name `mi-espanol`；静态资源 cache-first 后没有明确的新版本缓存边界。
- 旧 worker 在 `install` 中无条件 `skipWaiting()`，可能在用户仍打开学习页面时直接接管；页面也没有为 `controllerchange` 设计安全刷新流程。
- 旧 `activate` 会删除所有不是当前名称的 Cache Storage，而不是只清理本 App 自己的旧缓存。
- manifest 没有显式 `id`。其旧有效 identity 默认来自 `start_url: ./index.html`，后续必须保持该 identity，不能随意改成另一路径。
- 学习进度保存在同一 origin 下的 localStorage，不在桌面快捷方式本身；Service Worker 更新不得删除或改名这些 key。

### 数据保留规则

- 用户实际使用的是 iPhone Safari 的“添加到主屏幕 / Open as Web App”，删除图标时只有删除操作，没有 Chrome 的 “Also delete data from Chrome” 选项；之前的 Chrome 卸载说明不适用于当前设备。
- Apple 没有在 iPhone 删除主屏幕 Web App 的界面中提供“保留网站数据”保证，因此卸载前必须先导出 `mi-espanol-progress.json`，不得依赖删除后 localStorage 一定保留。
- 在“设置 → Apps → Safari → Advanced → Website Data”中移除网站数据，或执行清除网站数据的操作，会删除网站用于保存状态的数据，学习进度将丢失。
- WebKit 默认把网站存储视为 best-effort；系统存储压力、长期未使用等情况下也可能逐 origin 驱逐数据。主屏幕 Web App 可以请求 persistent storage，但是否获准由 WebKit heuristics 决定，仍不能替代 JSON 备份。
- 如果发布网址的 origin 改变，新 App 无法读取旧 origin 的 localStorage；需要 progress export/import 或专门 migration。
- 从 `index v44.0` 起，schema v3 JSON 已包含普通词汇、My Words、streak、Master Review 逐题 stats、skill mastery 和未完成 cycle，可作为卸载前的完整恢复备份。

### 旧版 → v44.1 首次安全迁移

1. 不得先删除仍运行旧版的主屏幕 App；更早版本的 JSON 可能缺少 Master Review 或 skill mastery 数据。
2. 同时发布 v44.1 的 `index.html`、`sw.js`、`manifest.json` 和图标，并让现有安装在不删除本地数据的前提下成功加载 v44.1。
3. 在页脚确认 `Index Version: v44.1` 后重新 Export。
4. 可打开 JSON 确认顶层存在 `"schemaVersion": 3`、`"masterStats"`、`"masterSkillStats"` 和 `"masterCycle"`；完成后再把它作为卸载保险。
5. 如果旧 App 因服务器或旧 Service Worker 一直无法加载 v44.1，暂停卸载并检查实际发布网址、响应缓存头及资源路径，先解决更新/迁移路径。

### 已实施修复（index / sw v44.1）

1. `sw.js` 使用 `mi-espanol-v44.1` 版本化缓存；激活时只删除以 `mi-espanol` 开头且不是当前版本的旧缓存，不触碰 localStorage 或其他应用缓存。
2. HTML navigation 使用 network-first 并绕过 HTTP cache；成功时更新离线 app shell，断网时回退到当前版本的 `index.html`。其他同源静态资源使用当前版本 cache-first。
3. 预缓存改为逐项容错；单个可选图标缺失不会导致整个 Service Worker 安装失败。
4. 新 worker 不再安装后无条件接管。index 使用 `updateViaCache: 'none'`、显式 `registration.update()`、`updatefound`、重新联网和重新回到前台检查更新。
5. 检测到 waiting worker 时显示 `New version available / Update now`。只有用户点击后才保存当前 session、发送 `SKIP_WAITING`，并在 `controllerchange` 后刷新一次。
6. manifest 新增 `id: ./index.html`，与旧 manifest 缺省时由 `start_url` 形成的有效 identity 一致；同时明确 `scope: ./`，保持同一 App 身份和 origin。
7. index 调用 `navigator.storage.persisted()` / `persist()`，并在 My Progress 卡片显示是否获得持久存储；无论结果如何都继续提醒卸载前 Export。
8. `schemaVersion: 3`、所有原 localStorage key 和 Export / Import 结构保持不变；PWA 更新不会清空普通词汇、Master Review、My Words、streak 或未完成 session。

### 验证结果与剩余发布验收

- 静态检查确认 index、sw、manifest 的版本、路径、manifest identity 和更新消息协议一致；JavaScript 与 JSON 语法通过。
- 本地 Service Worker 生命周期与页面状态测试确认：首次安装不会无条件 `skipWaiting`；waiting worker 会触发更新提示；点击 Update now 后发送接管消息并只刷新一次；旧 `mi-espanol*` 缓存被清理；当前 app shell 可作为断网回退。
- localStorage 哨兵数据在 Service Worker 更新前后保持不变；Progress JSON schema 仍为 v3。
- 仍需实际发布网址完成 HTTPS、服务器缓存头、多窗口和真实 iPhone 主屏幕 App 更新测试。
- 在真实 iPhone/iOS 上测试删除主屏幕 Web App 后同 origin 重装时 localStorage 的表现，但测试结果不得替代卸载前备份规则。
- 清除 Safari 网站数据后，本地进度预期会消失，应使用完整 JSON 备份恢复；不得为了测试擅自清除用户真实数据。

## BUG-001：Lesson 37 / 38 练习入口无法打开并残留 Lesson 36 内容

- 发现日期：2026-08-24
- 来源文件：`index(20260824-063344).html`
- 当前状态：已修复并通过 Lesson 37–47 扩展回归（`index v44.0`）
- 严重程度：高（两课的核心练习入口全部不可用）

### 用户看到的现象

1. App 刚打开时，直接点击 Lesson 37 或 Lesson 38 的练习按钮，页面没有反应。
2. 先进入 Lesson 36，再点击 Lesson 37 或 Lesson 38，页面仍显示 Lesson 36 的标题和练习内容。

### 影响范围

Lesson 37 和 Lesson 38 各有四个失效模式，共 8 个：

- `es-en-l37`、`en-es-l37`、`fill-l37`、`conv-l37`
- `es-en-l38`、`en-es-l38`、`fill-l38`、`conv-l38`

两课的 `View Class Notes` 静态页面目标存在；本问题集中在通过 `startMode(...)` 启动的四类练习。

### 根因

更新 Lesson 37/38 时只增加了首页卡片和少量静态 Notes/Quiz/Dialogue 页面，没有同步完成练习系统的功能接线：

1. `_startFresh(mode)` 只处理到 Lesson 36，没有 Lesson 37/38 分支，因此点击后不会设置新的 `S.mode` 和 `S.cards`。
2. `navigateToMode(mode)` 的页面类型和标题映射只处理到 Lesson 36，因此即使传入 Lesson 37/38 也没有目标页面可进入。
3. `resumeSession()` 的题库恢复映射只处理到 Lesson 36，未来即使首次进入修好，恢复进度仍会失败或使用错误数据。
4. 文件内不存在 `L37_VOCAB`、`L38_VOCAB`、`FILL_L37`、`FILL_L38`、`CONV_L37`、`CONV_L38` 数据集。

### 为什么会出现“第一次没反应，开过 36 后一直显示 36”

- 首次打开时 `S.mode` 为空；Lesson 37/38 没有匹配分支，最后拿空模式导航，所以页面不变。
- 进入 Lesson 36 后，`S.mode` 被保存为 Lesson 36；再点击 37/38 时仍没有匹配分支，旧的 `S.mode` 没被替换，程序再次按照 Lesson 36 导航，所以继续显示 Lesson 36。

### 同类问题排查结果

- 已比对首页全部 130 个不同的 `startMode(...)` 调用与三个核心注册位置：首次启动、页面导航、进度恢复。
- 只有 Lesson 37/38 上述 8 个模式同时缺失。
- 所有直接 `show(...)` 的页面目标均存在。
- 没有发现重复页面 ID。

### 已实施修复（index v44.0）

1. 依据 Lesson 36–47 PDF 补齐并重建 Lesson 37/38 的 Vocabulary、Quiz、Dialogue 与 Class Notes，同时扩展至 Lesson 47。
2. 用 `LESSON_REGISTRY` 统一驱动 `_startFresh()`、`navigateToMode()` 和 `resumeSession()`，新增课程无需再分别维护三组长分支。
3. 未知 mode 会先清空 `S.mode` 与 `S.cards` 并安全返回首页，不再沿用上一课状态。
4. Lesson 37–47 的标题、副标题和 Class Notes 章节标题统一英文；解释与翻译保留中文。
5. Class Notes 保留 PDF 中有学习价值的内容并合并重复；Lesson 43 因材料不足明确标注，不补造完整课堂内容。

### 防复发规则

每次新增 Lesson 必须同时检查以下五层，不允许只增加首页卡片：

1. 首页按钮：所有 `startMode(...)` 名称正确。
2. 题库数据：词汇、Quiz、Dialogue 常量均存在且非空。
3. 首次启动：`_startFresh()` 能为每个模式设置新的 `S.mode` 和 `S.cards`。
4. 页面导航：`navigateToMode()` 能进入正确页面并显示正确课号。
5. 进度恢复：`resumeSession()` 能从相同课程的数据池恢复。

每次交付前必须执行两类验证：

- 自动完整性检查：逐个比对首页模式、数据集和三个注册位置。
- 浏览器冒烟测试：冷启动直接进入新课；先进入上一课再切换新课；分别测试四个入口、返回首页和恢复进度。

### 验收标准

- 冷启动时 Lesson 37/38 的四个练习入口均能直接打开。
- 从 Lesson 36 切换到 Lesson 37/38 时，标题、内容、进度和题库全部更新为目标课程。
- Lesson 37 与 38 之间反复切换不会残留上一课内容。
- 返回首页和恢复进度使用正确课程。
- 自动完整性检查无未注册模式、无缺失数据集、无缺失或重复页面 ID。

### v44.0 验证结果

- Lesson 37–47 的四个模式均能取得对应数据池，Quiz 每课至少 8 题，Dialogue 每课至少 5 题。
- 冷启动目标课和从上一课切换目标课均由注册表解析，不会复用 Lesson 36 状态。
- Lesson 1–47 注册项完整，所有直接页面目标存在，未发现重复页面 ID。
- JavaScript 语法检查及数据层/状态层自动测试通过；实际发布环境与真实 iPhone 的端到端更新验收仍归 `BUG-005`。

## v44.1 全量覆盖审计（2026-08-27）

- 已重新逐项对照本档案全部 `BUG / ENH` 与《西语学习 App 更新规范》十三个章节；没有发现尚未写入代码的已确认修复项。
- JavaScript、Service Worker 与 manifest JSON 语法通过；manifest `id / start_url / scope` 与 index 注册路径一致。
- 47 个 Lesson 注册完整；Lesson 36–47 四种数据池均存在，每课 8–12 道 Quiz、5–6 个 Dialogue，Class Notes 页面齐全。
- 所有页面 ID 唯一，54 个直接 `show(...)` 目标均存在；Lesson 36–47 的标题、副标题和 Class Notes 章节标题未发现中文标题残留。
- 课程注册词汇 770 项；Lesson 36–47 与旧课之间的精确重复卡片为 0，移除的 13 项仍在对应 Notes / Quiz 语境中出现。
- Master Review 为 144 题、58 个 skill；questionId 无重复，每个 skill 至少两题；新题全部进入 cycle，单 Part 上限 24。
- 单词 `Got it` 两次退出、错→对→错→对不误退出、双方向独立、Mastered Vocabulary 单方向重新激活均通过。
- Master skill 跨两个 session 掌握、答错重新激活、未知 mode 清空旧状态并安全返回均通过。
- Progress JSON schema v3 的普通词汇、Master 逐题、skill、cycle、My Words 与导出时间字段齐全；旧 schema 导入不会清空设备已有 Master 数据。
- PWA 生命周期测试通过：不自动 `skipWaiting`、用户确认消息、单次刷新、旧本 App 缓存清理、其他缓存保留、navigation no-store 与离线 app-shell 回退。
- 唯一剩余事项是实际发布验收：需要在真实 HTTPS 发布网址和用户 iPhone 主屏幕 App 上完成一次旧版到 v44.1 的端到端更新；不得以本地测试代替该设备验收。
