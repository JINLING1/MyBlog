---
title: 设计模式
description: 单例、工厂、观察者等常用设计模式的实现与实际应用场景。
date: 2026-11-17
order: 5
tags:
  - 设计模式
  - Java
comments: true
---

# 设计模式

面试问设计模式，通常是“讲讲单例、工厂、观察者，并说说实际项目里在哪里用到”。**背代码不难，难的是说出真实的应用场景。** 示例以 Java 为主（后端面试最常见），也会对照前端里的例子。

## 一、设计原则

设计模式是原则的具体应用，先记住最常提到的几条：

| 原则 | 一句话 |
| --- | --- |
| 单一职责 | 一个类只负责一件事 |
| 开闭原则 | 对扩展开放，对修改关闭：加新功能时新增代码，而不是改旧代码 |
| 里氏替换 | 子类可以替换父类而不出错 |
| 依赖倒置 | 依赖接口，不依赖具体实现 |
| 接口隔离 | 接口要小而专，不强迫实现用不到的方法 |

## 二、设计模式分类

| 类型 | 解决的问题 | 常见模式 |
| --- | --- | --- |
| 创建型 | 怎么创建对象 | 单例、工厂、建造者 |
| 结构型 | 怎么组合类和对象 | 代理、装饰器、适配器 |
| 行为型 | 对象之间怎么协作 | 观察者、策略、模板方法、责任链 |

## 三、单例模式

**保证一个类只有一个实例，并提供全局访问点。**

### 1. 实现方式

**饿汉式**：类加载时就创建，线程安全，但不用也会创建。

```java
public class Config {
    private static final Config INSTANCE = new Config();
    private Config() {}
    public static Config getInstance() { return INSTANCE; }
}
```

**双重检查锁（DCL）**：用到时才创建，面试最常让手写。

```java
public class Config {
    private static volatile Config instance;   // volatile 不能省

    private Config() {}

    public static Config getInstance() {
        if (instance == null) {                 // 第一次检查：已创建就不加锁，提升性能
            synchronized (Config.class) {
                if (instance == null) {         // 第二次检查：防止多个线程都通过了第一次检查
                    instance = new Config();
                }
            }
        }
        return instance;
    }
}
```

**为什么要 volatile？** `instance = new Config()` 分三步：分配内存、初始化对象、把引用指向内存。JVM 可能重排序为“分配内存 → 指向内存 → 初始化”。另一个线程在第一次检查时看到 `instance` 不为空，就会拿到一个**还没初始化完的对象**。volatile 禁止了这种重排序。

**静态内部类**：利用类加载机制保证线程安全，又能延迟加载，推荐写法。

```java
public class Config {
    private Config() {}
    private static class Holder {
        private static final Config INSTANCE = new Config();
    }
    public static Config getInstance() { return Holder.INSTANCE; }
}
```

**枚举**：最简洁，还能防止反射和反序列化破坏单例。

```java
public enum Config {
    INSTANCE;
}
```

### 2. 实际应用场景

- **配置管理**：全局只需要一份配置
- **连接池、线程池**：数据库连接池、HTTP 客户端，重复创建开销大
- **大模型客户端**：调用模型的 SDK 客户端内部维护连接池，全局复用一个实例
- **日志对象**
- **Spring 的 Bean 默认就是单例**（由容器保证，而不是类自己实现）
- 前端：Vuex / Pinia 的 store、全局的 axios 实例、ES Module 本身（一个模块只会执行一次，导出的对象天然是单例）

### 3. 注意

- 单例相当于全局状态，**有可变状态时要考虑线程安全**
- 不利于单元测试（难以替换成模拟对象），这也是现在更推荐交给 Spring 容器管理的原因

## 四、工厂模式

**把“创建对象”的逻辑集中起来，调用方只关心要什么，不关心怎么创建。**

### 1. 简单工厂

```java
public interface LlmClient {
    String chat(String prompt);
}

public class QwenClient implements LlmClient { /* ... */ }
public class DeepSeekClient implements LlmClient { /* ... */ }

public class LlmClientFactory {
    public static LlmClient create(String provider) {
        return switch (provider) {
            case "qwen" -> new QwenClient();
            case "deepseek" -> new DeepSeekClient();
            default -> throw new IllegalArgumentException("不支持的模型：" + provider);
        };
    }
}

// 调用方：换模型只改配置，不改业务代码
LlmClient client = LlmClientFactory.create(config.getProvider());
```

缺点：新增一种模型要修改工厂类，违反开闭原则。

### 2. 工厂方法

每种产品有自己的工厂类，新增产品只需新增一个工厂，不修改已有代码。

### 3. 抽象工厂

创建**一系列相关的产品**。比如每个模型厂商都提供“对话模型 + Embedding 模型 + 重排模型”，一个厂商对应一个工厂，保证一起使用的组件来自同一家。

### 4. 实际应用场景

- **多模型接入**：按配置创建不同厂商的大模型客户端（见上文）
- **Spring 的 BeanFactory**：根据配置创建和管理 Bean
- **数据库连接**：JDBC 的 `DriverManager.getConnection()` 根据 URL 返回不同数据库的连接
- **支付、短信等多渠道**：根据渠道编码创建对应的处理器
- 前端：`document.createElement('div')`、Vue 的 `createApp()`

## 五、观察者模式

**一对多的依赖关系：一个对象（被观察者）状态变化时，自动通知所有依赖它的对象（观察者）。**

### 1. 实现

```java
public interface OrderListener {
    void onOrderPaid(Order order);
}

public class OrderService {
    private final List<OrderListener> listeners = new ArrayList<>();

    public void addListener(OrderListener listener) { listeners.add(listener); }

    public void pay(Order order) {
        // ...处理支付
        for (OrderListener l : listeners) {
            l.onOrderPaid(order);       // 通知所有观察者
        }
    }
}

// 支付成功后要做的事各自独立实现，互不影响
orderService.addListener(order -> smsService.send(order));     // 发短信
orderService.addListener(order -> pointService.add(order));    // 加积分
orderService.addListener(order -> invoiceService.create(order)); // 开发票
```

好处：新增“支付后要做的事”时只需加一个观察者，**不用改支付的核心代码**。

### 2. 实际应用场景

- **Spring 事件机制**：`ApplicationEvent` + `@EventListener`
- **前端**：DOM 事件监听 `addEventListener`、Vue 的响应式系统（数据变化自动通知依赖它的视图更新）
- **大模型流式输出**：每生成一段内容就通知前端渲染、日志记录、计费统计
- **配置中心**：配置变更时通知所有服务刷新

### 3. 观察者模式与发布订阅的区别

| | 观察者 | 发布订阅 |
| --- | --- | --- |
| 关系 | 被观察者直接持有观察者列表 | 发布者和订阅者互不知道，中间有事件中心 / 消息队列 |
| 耦合 | 较低 | 更低 |
| 例子 | `addEventListener` | Vue 的 EventBus、Kafka、Redis Pub/Sub |

跨服务的场景用消息队列做发布订阅，还能获得异步、削峰和可靠投递。

## 六、其他常见模式

| 模式 | 一句话 | 应用 |
| --- | --- | --- |
| 策略 | 把一组可互换的算法封装起来，运行时选择 | 不同的切块策略、不同的计费规则，替代大量 `if-else` |
| 代理 | 给对象提供一个代理，控制对它的访问 | Spring AOP（日志、事务、权限）、Vue 3 响应式（`Proxy`） |
| 装饰器 | 不改原类，动态增加功能 | Java IO 流、Python 装饰器、给模型调用加重试和缓存 |
| 适配器 | 把一个接口转换成另一个接口 | 把各家模型 API 统一成 OpenAI 格式 |
| 模板方法 | 父类定义流程骨架，子类实现具体步骤 | Spring 的 JdbcTemplate、RAG 流程（加载 → 切块 → 检索） |
| 责任链 | 请求沿着链依次处理 | 过滤器、拦截器、中间件（Express / Koa） |
| 建造者 | 分步骤构造复杂对象 | `StringBuilder`、构造复杂的请求参数 |

## 七、面试回答示例

> **问：单例模式在实际项目里有什么应用？**
>
> 我在项目里调用大模型时，把模型客户端做成了单例。客户端内部维护着 HTTP 连接池，每次请求都新建的话会频繁建立连接，浪费资源。用 Spring 管理时，默认的 Bean 作用域就是单例。如果自己实现，我会用静态内部类或者双重检查锁，双重检查锁要给实例加 volatile，防止指令重排序导致拿到未初始化完的对象。

（替换成你项目中真实用到的例子，比“配置类、日志类”这种通用回答更有说服力。）
