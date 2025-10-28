## Styled String

This repository is meant the provide an easy (Builder like) way to style Strings in javascript.


![Licence](https://img.shields.io/github/license/TiagoVenceslau/styled-string-builder.svg?style=plastic)
![GitHub language count](https://img.shields.io/github/languages/count/TiagoVenceslau/styled-string-builder?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/TiagoVenceslau/styled-string-builder?style=plastic)

[![Build & Test](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/nodejs-build-prod.yaml/badge.svg)](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/nodejs-build-prod.yaml)
[![CodeQL](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/codeql-analysis.yml)
[![Pages builder](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/pages.yaml/badge.svg)](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/pages.yaml)
[![.github/workflows/release-on-tag.yaml](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/release-on-tag.yaml/badge.svg?event=release)](https://github.com/TiagoVenceslau/styled-string-builder/actions/workflows/release-on-tag.yaml)

![Open Issues](https://img.shields.io/github/issues/TiagoVenceslau/styled-string-builder.svg)
![Closed Issues](https://img.shields.io/github/issues-closed/TiagoVenceslau/styled-string-builder.svg)
![Pull Requests](https://img.shields.io/github/issues-pr-closed/TiagoVenceslau/styled-string-builder.svg)
![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

![Forks](https://img.shields.io/github/forks/TiagoVenceslau/styled-string-builder.svg)
![Stars](https://img.shields.io/github/stars/TiagoVenceslau/styled-string-builder.svg)
![Watchers](https://img.shields.io/github/watchers/TiagoVenceslau/styled-string-builder.svg)

![Node Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=Node&query=$.engines.node&colorB=blue)
![NPM Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=NPM&query=$.engines.npm&colorB=purple)

Documentation available [here](https://TiagoVenceslau.github.io/styled-string-builder/)

### Description

The difference between styled string and other string styling libraries is the builder like approach, 
minimizing boilerplate to the minimum.


### How to Use

- [Initial Setup](./tutorials/For%20Developers.md#_initial-setup_)
- [Installation](./tutorials/For%20Developers.md#installation)

#### Basic Usage
```typescript
import { style } from 'styled-string-builder';

const styledText = style('Hello, World!').red.bold;
console.log(styledText.toString());
console.log(styledText.text);
```
Result:
- <span style="color: red; font-weight: bold;">Hello, World!</span>
- <span style="color: red; font-weight: bold;">Hello, World!</span>

***Note:*** using `.toString()` or `.text` are equivalent.

#### Foreground Colors
```typescript
import { style } from 'styled-string-builder';

console.log(style('Red text').red.toString());
console.log(style('Green text').green.toString());
console.log(style('Blue text').blue.toString());
```
Result:
- <span style="color: red;">Red text</span>
- <span style="color: green;">Green text</span>
- <span style="color: blue;">Blue text</span>


#### Background Colors
```typescript
import { style } from 'styled-string-builder';
console.log(style('Red background').bgRed.toString());
console.log(style('Green background').bgGreen.toString());
console.log(style('Blue background').bgBlue.toString());
```
Result:
- <span style="background-color: red;">Red background</span>
- <span style="background-color: green;">Green background</span>
- <span style="background-color: blue;">Blue background</span>


#### Bright Colors
```typescript
import { style } from 'styled-string-builder';
console.log(style('Bright red text').brightRed.toString());
console.log(style('Bright green background').bgBrightGreen.toString());
```
Result:
- <span style="color: #FF0000;">Bright red text</span>
- <span style="background-color: #00FF00;">Bright green background</span>


#### Styles
```typescript
import { style } from 'styled-string-builder';
console.log(style('Bold text').bold.toString());
console.log(style('Italic text').italic.toString());
console.log(style('Underlined text').underline.toString());
console.log(style('Styled text').red.bold.underline.toString());
```
Result:
- <span style="font-weight: bold;">Bold text</span>
- <span style="font-style: italic;">Italic text</span>
- <span style="text-decoration: underline;">Underlined text</span>
- <span style="color: red; font-weight: bold; text-decoration: underline;">Styled text</span>


#### 256 Color
```typescript
import { style } from 'styled-string-builder';
console.log(style('256 color text').color256(100).toString());
console.log(style('256 color background').bgColor256(200).toString());
```
Result:
- <span style="color: #878700;">256 color text</span>
- <span style="background-color: #ff00d7;">256 color background</span>


#### RGB Color
```typescript
import { style } from 'styled-string-builder';
console.log(style('RGB text').rgb(255, 100, 0).toString());
console.log(style('RGB background').bgRgb(0, 100, 255).toString());
```
Result:
- <span style="color: rgb(255, 100, 0);">RGB text</span>
- <span style="background-color: rgb(0, 100, 255);">RGB background</span>


#### Clear Styling
```typescript
import { style } from 'styled-string-builder';
const styledText = style('Styled text').red.bold;
console.log(styledText.clear().toString());
```
Result:
- <span>Styled text</span>


#### Raw ANSI
```typescript
import { style } from 'styled-string-builder';
console.log(style('Custom ANSI').raw('\u001b[35m').toString());
```
Result:
- <span style="color: magenta;">Custom ANSI</span>


#### Combinations
```typescript
import { style } from 'styled-string-builder';
// Combining multiple strings
const combinedText = style('Hello').red.toString() + ' ' + style('World').blue.toString();
console.log(combinedText);
// Multiple chaining of properties and styles
console.log(
  style('Fancy Text')
    .red
    .bold
    .underline
    .bgYellow
    .italic
    .blink
    .toString()
);
// Combining multiple styled strings with different properties
const rainbowText =
  style('R').red.bold.toString() +
  style('a').yellow.italic.toString() +
  style('i').green.underline.toString() +
  style('n').cyan.inverse.toString() +
  style('b').blue.dim.toString() +
  style('o').magenta.strikethrough.toString() +
  style('w').white.bgRed.toString();

console.log(rainbowText);
// Complex styling with 256 colors and RGB
console.log(
  style('Gradient')
    .color256(196)
    .bgColor256(233)
    .bold
    .toString() +
  style(' Text')
    .rgb(100, 150, 200)
    .bgRgb(50, 75, 100)
    .italic
    .underline
    .toString()
);
```
Result:
- <span style="color: red;">Hello</span> <span style="color: blue;">World</span>
- <span style="color: red; font-weight: bold; text-decoration: underline; background-color: yellow; font-style: italic; animation: blink 1s step-end infinite;">Fancy Text</span>
- <span style="color: red; font-weight: bold;">R</span><span style="color: yellow; font-style: italic;">a</span><span style="color: green; text-decoration: underline;">i</span><span style="color: black; background-color: cyan;">n</span><span style="color: blue; opacity: 0.5;">b</span><span style="color: magenta; text-decoration: line-through;">o</span><span style="color: white; background-color: red;">w</span>
- <span style="color: #ff0000; background-color: #121212; font-weight: bold;">Gradient</span><span style="color: rgb(100, 150, 200); background-color: rgb(50, 75, 100); font-style: italic; text-decoration: underline;"> Text</span>

### Examples of Color Functions

#### colorizeANSI

```typescript
import { colorizeANSI } from 'styled-string-builder';

console.log(colorizeANSI('Red text', 31));
console.log(colorizeANSI('Blue background', 44, true));
```
Result:
- <span style="color: red;">Red text</span>
- <span style="background-color: blue;">Blue background</span>

#### colorize256

```typescript
import { colorize256 } from 'styled-string-builder';

console.log(colorize256('Orange text', 208));
console.log(colorize256('Teal background', 30, true));
```
Result:
- <span style="color: #ff8700;">Orange text</span>
- <span style="background-color: #008787;">Teal background</span>

#### colorizeRGB

```typescript
import { colorizeRGB } from 'styled-string-builder';

console.log(colorizeRGB('Custom color text', 100, 150, 200));
console.log(colorizeRGB('Custom background', 50, 75, 100, true));
```
Result:
- <span style="color: rgb(100, 150, 200);">Custom color text</span>
- <span style="background-color: rgb(50, 75, 100);">Custom background</span>

```typescript
import { applyStyle } from 'styled-string-builder';

console.log(applyStyle('Bold text', 'bold'));
console.log(applyStyle('Underlined text', 'underline'));
```
Result:
- <span style="font-weight: bold;">Bold text</span>
- <span style="text-decoration: underline;">Underlined text</span>

### ANSI color codes

![table with ansi color codes](./workdocs/assets/ansi.png "ansi color codes")

### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/TiagoVenceslau/)



## Languages

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![ShellScript](https://img.shields.io/badge/Shell_Script-121011?style=for-the-badge&logo=gnu-bash&logoColor=white)

## Getting help

If you have bug reports, questions or suggestions please [create a new issue](https://github.com/decaf-ts/ts-workspace/issues/new/choose).

## Contributing

I am grateful for any contributions made to this project. Please read [this](./workdocs/98-Contributing.md) to get started.

## Supporting

The first and easiest way you can support it is by [Contributing](./workdocs/98-Contributing.md). Even just finding a typo in the documentation is important.

Financial support is always welcome and helps keep the both me and the project alive and healthy.

So if you can, if this project in any way. either by learning something or simply by helping you save precious time, please consider donating.

## License

This project is released under the [MIT License](LICENSE.md).

By developers, for developers.
