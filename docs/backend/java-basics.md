---
title: Java 核心：JVM 与多线程
description: JVM 内存结构、垃圾回收、类加载与双亲委派、多线程与线程池。
date: 2026-11-17
order: 2
tags:
  - Java
  - JVM
  - 并发
comments: true
---

# Java 核心：JVM 与多线程

岗位要求“至少一种后端语言（Python / Java / Go）”，技术面里 Java 相关的问题出现得最多：多线程、双亲委派、JVM 内存。这篇整理这几块的高频考点。

## 一、JVM 内存结构

| 区域 | 线程私有 / 共享 | 存什么 |
| --- | --- | --- |
| 程序计数器 | 私有 | 当前线程执行到的字节码位置 |
| 虚拟机栈 | 私有 | 方法调用的栈帧：局部变量、操作数栈 |
| 本地方法栈 | 私有 | native 方法的调用 |
| 堆 | 共享 | 对象实例，垃圾回收的主要区域 |
| 方法区（JDK 8 起为元空间） | 共享 | 类信息、常量、静态变量 |

常见错误：

- `StackOverflowError`：递归太深，栈溢出
- `OutOfMemoryError: Java heap space`：堆内存不足，常见于内存泄漏、一次加载过多数据
- `OutOfMemoryError: Metaspace`：动态生成的类太多

## 二、垃圾回收

### 1. 怎么判断对象可以回收

**可达性分析**：从 GC Roots（栈中的局部变量、静态变量等）出发，走不到的对象就是垃圾。

引用计数法有循环引用的问题（A 引用 B，B 引用 A），Java 没有采用。

### 2. 分代收集

- **新生代**：大多数对象“朝生夕死”，用**复制算法**，存活对象少，复制成本低
- **老年代**：存活时间长的对象，用**标记-清除**或**标记-整理**

对象一般先分配在新生代，经历多次 GC 仍存活就晋升到老年代。

### 3. 垃圾收集器

- **G1**：JDK 9 起的默认收集器，把堆分成多个 Region，可以设置期望的停顿时间
- **ZGC**：停顿时间极短（毫秒级以下），适合大内存、低延迟的服务

## 三、类加载与双亲委派

### 1. 类加载过程

```
加载 → 验证 → 准备 → 解析 → 初始化
```

- **加载**：读取 class 文件，生成 Class 对象
- **验证**：检查字节码是否合法、安全
- **准备**：为静态变量分配内存，赋**默认值**（`int` 为 0）
- **解析**：符号引用替换为直接引用
- **初始化**：执行静态变量赋值和静态代码块，赋**真正的值**

### 2. 类加载器

| 加载器 | 负责加载 |
| --- | --- |
| 启动类加载器（Bootstrap） | JDK 核心类库，如 `java.lang.*` |
| 平台类加载器（Platform，JDK 8 及以前叫扩展类加载器） | JDK 的扩展模块 |
| 应用类加载器（Application） | 项目 classpath 下的类 |
| 自定义类加载器 | 自己实现的加载逻辑 |

### 3. 双亲委派机制

**一个类加载器收到加载请求时，先交给父加载器去加载，父加载器加载不了，自己才去加载。**

```java
// ClassLoader.loadClass 的核心逻辑（简化）
protected Class<?> loadClass(String name, boolean resolve) {
    Class<?> c = findLoadedClass(name);          // 1. 已经加载过就直接返回
    if (c == null) {
        if (parent != null) {
            c = parent.loadClass(name, false);   // 2. 先委托给父加载器
        } else {
            c = findBootstrapClassOrNull(name);
        }
        if (c == null) {
            c = findClass(name);                 // 3. 父加载器都加载不了，自己加载
        }
    }
    return c;
}
```

### 4. 为什么要双亲委派

- **安全**：自己写一个 `java.lang.String`，也会被委派给启动类加载器，加载的仍是 JDK 的 String，核心类不会被篡改
- **避免重复加载**：同一个类只会被一个加载器加载一次，保证唯一性

> 判断两个类是否相同，要看“类的全名 + 加载它的类加载器”。同一个 class 文件被两个加载器加载，得到的是两个不同的类。

### 5. 打破双亲委派的场景

- **Tomcat**：一个 Tomcat 运行多个 Web 应用，它们可能依赖同一个库的不同版本，所以每个应用有自己的类加载器，优先加载自己目录下的类
- **SPI 机制（如 JDBC）**：接口 `java.sql.Driver` 由启动类加载器加载，但具体的驱动（MySQL 驱动）在 classpath 下，启动类加载器看不到。于是通过**线程上下文类加载器**反过来让父加载器“请”子加载器加载
- **热部署**：替换类加载器重新加载修改后的类

怎么打破：自定义类加载器并重写 `loadClass` 方法（只想自定义加载逻辑、不想打破委派的话，重写 `findClass` 即可）。

## 四、多线程基础

### 1. 创建线程的方式

```java
// 1. 继承 Thread
new Thread(() -> System.out.println("run")).start();

// 2. 实现 Runnable（无返回值）
Runnable task = () -> System.out.println("run");

// 3. 实现 Callable（有返回值，可抛异常）
Callable<String> call = () -> "result";
FutureTask<String> future = new FutureTask<>(call);
new Thread(future).start();
String result = future.get();

// 4. 线程池（实际项目中的标准做法）
executor.submit(call);
```

### 2. 线程的状态

`NEW` → `RUNNABLE` → `BLOCKED`（等锁）/ `WAITING`（无限期等待）/ `TIMED_WAITING`（限时等待）→ `TERMINATED`

### 3. `sleep` 和 `wait` 的区别

| | `sleep` | `wait` |
| --- | --- | --- |
| 所属 | Thread 的静态方法 | Object 的方法 |
| 是否释放锁 | 不释放 | 释放 |
| 使用位置 | 任意位置 | 必须在 `synchronized` 中 |
| 唤醒 | 时间到自动唤醒 | 需要 `notify` / `notifyAll` 或超时 |

### 4. 并发编程的三个问题

- **原子性**：操作不可被打断。`count++` 不是原子的
- **可见性**：一个线程修改了变量，其他线程能立即看到。每个线程有自己的工作内存，可能读到旧值
- **有序性**：编译器和 CPU 会重排序指令

## 五、锁与关键字

### 1. `volatile`

- 保证**可见性**：写入后立即刷新到主内存，读取时从主内存读
- 保证**有序性**：禁止指令重排序（单例双重检查锁就靠这一点）
- **不保证原子性**：`volatile int count; count++` 仍然线程不安全

适合：状态标志位（`volatile boolean running`）、双重检查锁。

### 2. `synchronized`

保证原子性、可见性、有序性。可以修饰方法或代码块，锁的是对象（静态方法锁的是 Class 对象）。

JDK 6 之后做了大量优化，有**锁升级**过程：无锁 → 偏向锁 → 轻量级锁（CAS 自旋）→ 重量级锁（线程阻塞），竞争不激烈时性能很好。（偏向锁在 JDK 15 后默认关闭。）

### 3. `synchronized` 和 `ReentrantLock` 的区别

| | `synchronized` | `ReentrantLock` |
| --- | --- | --- |
| 实现 | JVM 关键字 | JDK 类（基于 AQS） |
| 释放锁 | 自动 | 必须在 `finally` 中手动 `unlock()` |
| 可中断 / 超时 | 不支持 | `lockInterruptibly()`、`tryLock(timeout)` |
| 公平锁 | 只有非公平 | 可以选择公平 |
| 条件变量 | 一个 | 可以有多个 `Condition` |

两者都是可重入锁。没有特殊需求时优先用 `synchronized`，简单不易出错。

### 4. CAS 与原子类

CAS（Compare And Swap）：“如果当前值等于预期值，就更新为新值”，由 CPU 指令保证原子性。`AtomicInteger.incrementAndGet()` 就是循环 CAS 实现的无锁计数。

问题：**ABA 问题**（值从 A 变成 B 又变回 A，CAS 察觉不到），用 `AtomicStampedReference` 加版本号解决；竞争激烈时不停自旋，消耗 CPU。

### 5. `ThreadLocal`

每个线程有自己独立的变量副本，常用于保存用户登录信息、数据库连接、请求链路 ID。

**注意内存泄漏**：线程池中的线程会复用，用完一定要 `remove()`，否则数据会残留给下一个请求。

## 六、线程池

### 1. 为什么用线程池

- 复用线程，避免频繁创建销毁的开销
- 控制并发数量，防止线程过多耗尽资源
- 统一管理任务的排队、拒绝、监控

### 2. 七个参数

```java
new ThreadPoolExecutor(
    corePoolSize,      // 核心线程数：常驻的线程
    maximumPoolSize,   // 最大线程数
    keepAliveTime,     // 非核心线程空闲多久后回收
    unit,              // 时间单位
    workQueue,         // 任务队列
    threadFactory,     // 线程工厂：给线程起有意义的名字，方便排查
    handler            // 拒绝策略
);
```

### 3. 执行流程

```
提交任务
  → 核心线程没满？创建核心线程执行
  → 队列没满？放入队列等待
  → 最大线程数没满？创建非核心线程执行
  → 都满了，执行拒绝策略
```

注意：**是先放队列，队列满了才创建非核心线程**，这一点常被问。

### 4. 拒绝策略

| 策略 | 行为 |
| --- | --- |
| AbortPolicy（默认） | 抛出异常 |
| CallerRunsPolicy | 由提交任务的线程自己执行，起到减速作用 |
| DiscardPolicy | 直接丢弃 |
| DiscardOldestPolicy | 丢弃队列里最老的任务，再尝试提交 |

### 5. 为什么不推荐用 `Executors` 创建

- `newFixedThreadPool`、`newSingleThreadExecutor`：队列无界，任务堆积会导致 OOM
- `newCachedThreadPool`：最大线程数无上限，可能创建大量线程导致 OOM

应该用 `ThreadPoolExecutor` 显式指定参数。

### 6. 核心线程数怎么设置

- **CPU 密集型**：CPU 核数 + 1
- **I/O 密集型**（调用数据库、大模型接口）：可以设置得更大，经验公式 `核数 × (1 + 等待时间 / 计算时间)`
- 最终以**压测结果**为准，并且线程池要做监控（活跃线程数、队列长度、拒绝次数）

## 七、并发容器

- **`ConcurrentHashMap`**：线程安全的 HashMap。JDK 8 用 CAS + `synchronized` 锁住单个桶的头节点，锁粒度很小
- **`CopyOnWriteArrayList`**：写时复制，适合读多写少
- **`BlockingQueue`**：阻塞队列，线程池和生产者-消费者模型的基础

`HashMap` 为什么线程不安全：多线程同时 put 可能覆盖数据，扩容时可能出现数据丢失（JDK 7 中还可能形成环形链表导致死循环）。

## 八、高频面试题

1. **什么是双亲委派？为什么要这样设计？怎么打破？** 见第三节。
2. **`volatile` 和 `synchronized` 的区别？** `volatile` 只保证可见性和有序性，不保证原子性，不会阻塞；`synchronized` 三者都保证，会阻塞。
3. **线程池的参数和执行流程？** 见第六节。
4. **怎么保证线程安全？** 加锁（`synchronized`、`ReentrantLock`）、原子类、并发容器、`ThreadLocal`、不可变对象。
5. **死锁怎么排查？** `jstack` 查看线程栈，见 [操作系统 - 死锁](/it-basics/os#三、死锁)。
6. **JVM 内存区域有哪些？哪些是线程共享的？** 堆和方法区共享，栈和程序计数器私有。
