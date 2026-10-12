---
title: CSS 布局
description: CSS 页面布局知识，涵盖布局单位、两栏与三栏布局、居中和 Flex 布局。
date: 2026-09-30
tags:
  - CSS
comments: true
---

# CSS 布局

## 1. 常见的 CSS 布局单位

常用的布局单位包括像素（`px`），百分比（`%`），`em`，`rem`，`vw/vh`。

**（1）像素**（`px`）是页面布局的基础，一个像素表示终端（电脑、手机、平板等）屏幕所能显示的最小的区域，像素分为两种类型：CSS像素和物理像素：

* **CSS像素**：为web开发者提供，在CSS中使用的一个抽象单位；
* **物理像素**：只与设备的硬件密度有关，任何设备的物理像素都是固定的。

**（2）百分比**（`%`），当浏览器的宽度或者高度发生变化时，通过百分比单位可以使得浏览器中的组件的宽和高随着浏览器的变化而变化，从而实现响应式的效果。**元素的百分比是以它的“包含块（Containing Block）”或“自身特定属性”为基准来计算的**。

> *`width/height` 通常相对于包含块的宽高；`margin/padding` 统一相对于包含块的宽度；`transform` 的 translate 相对于自身宽高；而字体排版属性则相对于字体大小。*

**（3）em和rem**相对于px更具灵活性，它们都是相对长度单位，且是参照父/根元素的 `font-size`，它们之间的区别：**em相对于父元素，rem相对于根元素。**

* **em：** 相对长度单位。用在`font-size`上时，相对于**父元素**的 `font-size`；如果父元素没设置，则相对于浏览器默认字体大小（通常 16px）。
  用在其他属性上（如 `padding`、`margin`、`width`）时，相对于**当前元素自身**的 `font-size`。
* **rem：** rem是CSS3新增的一个相对单位，相对于根元素（html元素）的font-size的倍数。**作用**：利用rem可以实现简单的响应式布局，可以利用html元素中字体的大小与屏幕间的比值来设置font-size的值，以此实现当屏幕分辨率变化时让元素也随之变化。

**（4）vw/vh**是与视图窗口有关的单位，vw表示相对于视图窗口的宽度，vh表示相对于视图窗口高度，除了vw和vh外，还有vmin和vmax两个相关的单位。

- `vw`：相对于视窗的宽度，视窗宽度是 `100vw`；
- `vh`：相对于视窗的高度，视窗高度是 `100vh`；
- `vmin`：`vw` 和 `vh` 中的较小值；
- `vmax`：`vw` 和 `vh` 中的较大值；

**vw/vh** 和百分比很类似，两者的区别：

- 百分比（`%`）：大部分相对于祖先元素，也有相对于自身的情况，比如 `border-radius`、`translate` 等。
- `vw`/`vh`：相对于视窗的尺寸。

## 2. `px`、`em`、`rem` 的区别及使用场景

**三者的区别：**

- `px` 是固定的像素，一旦设置就不会因页面大小变化而改变。
- `em` 和 `rem` 相对于 `px` 更灵活，它们是相对长度单位，更适用于响应式布局。
- `em` 用在 `font-size` 上时相对于父元素；`rem` 相对于根元素，因此只需在根元素确定一个参考值。

## 3. 两栏布局的实现

一般两栏布局指的是**左边一栏宽度固定，右边一栏宽度自适应**，两栏布局的具体实现：

- 利用浮动，将左边元素宽度设置为 `200px` 并向左浮动；将右边元素的 `margin-left` 设置为 `200px`，宽度设置为 `auto`（默认值，撑满整个父元素）。

```css
.outer {
  height: 100px;
}
.left {
  float: left;
  width: 200px;
  background: tomato;
}
.right {
  margin-left: 200px;
  width: auto;
  background: gold;
}
```

- 利用浮动，左侧元素设置固定大小并向左浮动，右侧元素设置 `overflow: hidden`。这样右侧就触发了 BFC，BFC 的区域不会与浮动元素发生重叠。

```css
.left{
     width: 100px;
     height: 200px;
     background: red;
     float: left;
 }
 .right{
     height: 300px;
     background: blue;
     overflow: hidden;
 }
```

- 利用 `flex` 布局，将左边元素设置为固定宽度 `200px`，将右边元素设置为 `flex: 1`。

- `flex: 1` 在浏览器中实际上会解析为：

  `flex-grow: 1`（拉伸）

  `flex-shrink: 1`（压缩）

  `flex-basis: 0%`（基准）

  ① `flex-grow: 1`（决定如何分配剩余空间）
  意义：当父容器还有剩余空间时，该项目是否参与拉伸。

  `1` 的含义：表示该项目将占据剩余空间的“1 份”。如果所有子元素都设为 `flex: 1`，它们将平分剩余空间。

  ② `flex-shrink: 1`（决定空间不足时如何压缩）
  意义：当父容器空间不足以放下所有子元素时，该项目是否参与缩小。

  `1` 的含义：允许缩小以适应容器。如果设为 `0`，则该项目即使溢出也不会变小。

  ③ `flex-basis: 0%`（决定项目的初始大小）
  意义：在分配多余空间之前，项目占据的主轴大小。

  0% 的含义：不看原本内容有多宽，直接当成 0 看待，然后去参与剩余空间的分配。

```css
.outer {
  display: flex;
  height: 100px;
}
.left {
  width: 200px;
  background: tomato;
}
.right {
  flex: 1;
  background: gold;
}
```

- 利用绝对定位，将父级元素设置为相对定位。左边元素设置为 `absolute` 定位，宽度设置为 `200px`；将右边元素的 `margin-left` 设置为 `200px`。

```css
.outer {
  position: relative;
  height: 100px;
}
.left {
  position: absolute;
  width: 200px;
  height: 100px;
  background: tomato;
}
.right {
  margin-left: 200px;
  background: gold;
}
```

- 利用绝对定位，将父级元素设置为相对定位。左边元素宽度设置为 `200px`，右边元素设置为绝对定位，左侧定位为 `200px`，其余方向定位为 `0`。

```css
.outer {
  position: relative;
  height: 100px;
}
.left {
  width: 200px;
  background: tomato;
}
.right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 200px;
  background: gold;
}
```

## 4. 三栏布局的实现

三栏布局一般指的是页面中一共有三栏，**左右两栏宽度固定，中间自适应的布局**，三栏布局的具体实现：

- 利用**绝对定位**，左右两栏设置为绝对定位，中间设置对应方向大小的 `margin` 值。

```css
.outer {
  position: relative;
  height: 100px;
}

.left {
  position: absolute;
  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  margin-left: 100px;
  margin-right: 200px;
  height: 100px;
  background: lightgreen;
}
```

- 利用 `flex` 布局，左右两栏设置固定大小，中间一栏设置为 `flex: 1`。

```css
.outer {
  display: flex;
  height: 100px;
}

.left {
  width: 100px;
  background: tomato;
}

.right {
  width: 100px;
  background: gold;
}

.center {
  flex: 1;
  background: lightgreen;
}
```

- 利用浮动，左右两栏设置固定大小并设置对应方向的浮动。中间一栏设置左右两个方向的 `margin` 值；注意这种方式下，**中间一栏必须放到最后**：

```css
.outer {
  height: 100px;
}

.left {
  float: left;
  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  float: right;
  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  height: 100px;
  margin-left: 100px;
  margin-right: 200px;
  background: lightgreen;
}
```

- 圣杯布局：利用浮动和负边距来实现。父级元素设置左右的 `padding`，三列均向左浮动；中间一列放在最前面，宽度设置为父级元素的宽度，后面两列被挤到下一行，再通过负 `margin` 将其移动到上一行，最后利用相对定位移动到两边。

```css
.outer {
  height: 100px;
  padding-left: 100px;
  padding-right: 200px;
}

.left {
  position: relative;
  left: -100px;

  float: left;
  margin-left: -100%;

  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  position: relative;
  left: 200px;

  float: right;
  margin-left: -200px;

  width: 200px;
  height: 100px;
  background: gold;
}

.center {
  float: left;

  width: 100%;
  height: 100px;
  background: lightgreen;
}
```

- 双飞翼布局：相对于圣杯布局，左右位置通过中间列的 `margin` 值保留，而不是通过父元素的 `padding` 实现。本质上也是通过浮动和负外边距实现的。

```css
.outer {
  height: 100px;
}

.left {
  float: left;
  margin-left: -100%;

  width: 100px;
  height: 100px;
  background: tomato;
}

.right {
  float: left;
  margin-left: -200px;

  width: 200px;
  height: 100px;
  background: gold;
}

.wrapper {
  float: left;

  width: 100%;
  height: 100px;
  background: lightgreen;
}

.center {
  margin-left: 100px;
  margin-right: 200px;
  height: 100px;
}
```

## 5. 水平垂直居中的实现

- 利用绝对定位，先将元素的左上角通过 `top: 50%` 和 `left: 50%` 定位到页面中心，再通过 `translate` 将元素中心点调整到页面中心。该方法需要**考虑浏览器兼容问题**。

```css
.parent {
    position: relative;
}
 
.child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
}
```

- 利用绝对定位，将四个方向的值都设置为 `0`，并将 `margin` 设置为 `auto`。由于宽高固定，对应方向会实现平分，从而实现水平和垂直居中。该方法适用于**盒子有宽高**的情况：

```css
.parent {
    position: relative;
}
 
.child {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}
```

- 利用绝对定位，先将元素的左上角通过 `top: 50%` 和 `left: 50%` 定位到页面中心，再通过负 `margin` 调整元素中心点。该方法适用于**盒子宽高已知**的情况。

```css
.parent {
    position: relative;
}
 
.child {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;          
    height: 100px;  
    margin-top: -50px;     /* 自身 height 的一半 */
    margin-left: -50px;    /* 自身 width 的一半 */
}
```

- 使用 `flex` 布局，通过 `align-items: center` 和 `justify-content: center` 设置容器的垂直和水平方向居中。该方法要**考虑兼容性问题**，在移动端使用较多：

```css
.parent {
    display: flex;
    justify-content:center;
    align-items:center;
}
```

## 6. 对 Flex 布局的理解及其使用场景

Flex 是 Flexible Box 的缩写，意为“弹性布局”，用来为盒状模型提供最大的灵活性。任何容器都可以指定为 Flex 布局，行内元素也可以使用 Flex 布局。注意，设置为 Flex 布局后，**子元素的 `float`、`clear` 和 `vertical-align` 属性将失效**。采用 Flex 布局的元素称为 Flex 容器（flex container），其子元素称为 Flex 项目（flex item）。容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis），项目默认沿水平主轴排列。

以下6个属性设置在**容器上**：

- `flex-direction` 属性决定主轴的方向（即项目的排列方向）。
- `flex-wrap` 属性定义一条轴线排不下时如何换行。
- `flex-flow` 属性是 `flex-direction` 和 `flex-wrap` 的简写形式，默认值为 `row nowrap`。
- `justify-content` 属性定义项目在主轴上的对齐方式。
- `align-items` 属性定义项目在交叉轴上的对齐方式。
- `align-content` 属性定义多根轴线的对齐方式。如果项目只有一根轴线，该属性不起作用。

以下6个属性设置在**项目上**：

- `order` 属性定义项目的排列顺序。数值越小，排列越靠前，默认为 `0`。
- `flex-grow` 属性定义项目的放大比例，默认为 `0`，即使存在剩余空间也不放大。
- `flex-shrink` 属性定义项目的缩小比例，默认为 `1`，空间不足时项目会缩小。
- `flex-basis` 属性定义分配多余空间前项目占据的主轴空间，默认值为 `auto`。
- `flex` 属性是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写，默认值为 `0 1 auto`。
- `align-self` 属性允许单个项目使用不同的对齐方式，可覆盖 `align-items`。默认值为 `auto`，表示继承父元素的 `align-items` 属性。

**简单来说：**

Flex 布局是 CSS3 新增的一种布局方式。将元素的 `display` 属性设置为 `flex` 后，它会成为 Flex 容器，所有子元素都会成为项目。可以使用 `flex-direction` 指定主轴方向，使用 `justify-content` 指定主轴对齐方式，使用 `align-items` 指定交叉轴对齐方式，使用 `flex-wrap` 规定换行方式；项目则可以使用 `order`、`flex-grow` 和 `flex-shrink` 控制排列与伸缩。

## 7. `flex: 1` 表示什么

`flex` 属性是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写，默认值为 `0 1 auto`。**`flex: 1` 表示 `flex: 1 1 0%`**。

- 第一个参数 `flex-grow` 定义项目的放大比例，默认为 `0`，即使存在剩余空间也不放大。
- 第二个参数 `flex-shrink` 定义项目的缩小比例，默认为 `1`，空间不足时项目会缩小。
- 第三个参数 `flex-basis` 定义分配多余空间前项目的初始大小，默认值为 `auto`，即项目本身的大小。
