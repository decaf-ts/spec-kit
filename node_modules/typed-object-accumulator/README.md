## Typed Object Accumulator

Typed Object Accumulator is a TypeScript library that provides a type-safe way to dynamically accumulate and manage object properties. It allows you to combine multiple objects while maintaining full TypeScript type information, giving you the flexibility of dynamic objects with the safety of static typing. The library is designed to be immutable, chainable, and fully type-aware, making it ideal for building complex objects incrementally in a type-safe manner.


![Licence](https://img.shields.io/github/license/TiagoVenceslau/typed-object-accumulator.svg?style=plastic)
![GitHub language count](https://img.shields.io/github/languages/count/TiagoVenceslau/typed-object-accumulator?style=plastic)
![GitHub top language](https://img.shields.io/github/languages/top/TiagoVenceslau/typed-object-accumulator?style=plastic)

[![Build & Test](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/nodejs-build-prod.yaml/badge.svg)](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/nodejs-build-prod.yaml)
[![CodeQL](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/codeql-analysis.yml)[![Snyk Analysis](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/snyk-analysis.yaml/badge.svg)](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/snyk-analysis.yaml)
[![Pages builder](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/pages.yaml/badge.svg)](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/pages.yaml)
[![.github/workflows/release-on-tag.yaml](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/release-on-tag.yaml/badge.svg?event=release)](https://github.com/TiagoVenceslau/typed-object-accumulator/actions/workflows/release-on-tag.yaml)

![Open Issues](https://img.shields.io/github/issues/TiagoVenceslau/typed-object-accumulator.svg)
![Closed Issues](https://img.shields.io/github/issues-closed/TiagoVenceslau/typed-object-accumulator.svg)
![Pull Requests](https://img.shields.io/github/issues-pr-closed/TiagoVenceslau/typed-object-accumulator.svg)
![Maintained](https://img.shields.io/badge/Maintained%3F-yes-green.svg)

![Forks](https://img.shields.io/github/forks/TiagoVenceslau/typed-object-accumulator.svg)
![Stars](https://img.shields.io/github/stars/TiagoVenceslau/typed-object-accumulator.svg)
![Watchers](https://img.shields.io/github/watchers/TiagoVenceslau/typed-object-accumulator.svg)

![Node Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=Node&query=$.engines.node&colorB=blue)
![NPM Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbadges%2Fshields%2Fmaster%2Fpackage.json&label=NPM&query=$.engines.npm&colorB=purple)

Documentation available [here](https://TiagoVenceslau.github.io/typed-object-accumulator/)

### Description

Typed Object Accumulator is a specialized TypeScript utility library designed to solve the common challenge of building complex objects incrementally while maintaining full type safety. Unlike traditional object manipulation in JavaScript, which often sacrifices type information when combining objects, this library preserves and evolves type definitions as you add properties.

#### Core Features

- **Type-Safe Property Accumulation**: The `ObjectAccumulator` class allows you to progressively add properties from multiple objects while TypeScript tracks the combined type information.

- **Immutable Design**: Each operation returns a new accumulator instance with updated type information, ensuring your data remains predictable and side-effect free.

- **Chainable API**: Methods can be chained together for a fluent, readable coding style when building complex objects.

- **Comprehensive Property Management**: Beyond simple accumulation, the library provides methods for checking property existence, removing properties, retrieving values, and iterating over accumulated data.

- **Full TypeScript Integration**: The library leverages TypeScript's advanced type system to provide autocompletion and type checking for all accumulated properties.

#### Key Components

The library consists of a single primary class, `ObjectAccumulator<T>`, which manages the accumulation of object properties and maintains type information. It provides methods for:

- Adding properties with `accumulate()`
- Retrieving values with `get()` or direct property access
- Checking property existence with `has()`
- Removing properties with `remove()`
- Getting all keys with `keys()`
- Getting all values with `values()`
- Getting the size with `size()`
- Clearing all properties with `clear()`
- Iterating over properties with `forEach()`
- Transforming properties with `map()`

#### Use Cases

Typed Object Accumulator is particularly useful for:

- Building configuration objects incrementally
- Combining data from multiple sources with type safety
- Creating complex state objects in a functional programming style
- Managing form data with evolving structure
- Implementing builder patterns with full type information

By using Typed Object Accumulator, developers can enjoy the flexibility of dynamic object manipulation without sacrificing the benefits of TypeScript's static type checking.


### How to Use

- [Initial Setup](./tutorials/For%20Developers.md#_initial-setup_)
- [Installation](./tutorials/For%20Developers.md#installation)

### Creating a new ObjectAccumulator

**Description**: Initialize a new empty accumulator to start collecting object properties.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

// Create a new empty accumulator
const accumulator = new ObjectAccumulator<{}>();

// Or with type inference
const typedAccumulator = new ObjectAccumulator<{ initialType: string }>();
```

### Accumulating Objects

**Description**: Add properties from objects to the accumulator while maintaining type information.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator();

// Add a single object
const withUser = accumulator.accumulate({ name: "John", age: 30 });
console.log(withUser.name); // "John"
console.log(withUser.age); // 30

// Chain multiple accumulations
const fullData = accumulator
  .accumulate({ name: "John", age: 30 })
  .accumulate({ city: "New York", country: "USA" })
  .accumulate({ isActive: true, score: 95.5 });

// All properties are now available with type safety
console.log(fullData.name); // "John"
console.log(fullData.city); // "New York"
console.log(fullData.isActive); // true
```

### Retrieving Values

**Description**: Get a value from the accumulator using a key.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30 });

// Get values using the get method
const name = accumulator.get("name"); // "John"
const age = accumulator.get("age"); // 30
const unknown = accumulator.get("unknown"); // undefined

// Or access directly with type safety
console.log(accumulator.name); // "John"
```

### Checking if a Key Exists

**Description**: Verify if a specific key is present in the accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30 });

// Check if keys exist
const hasName = accumulator.has("name"); // true
const hasEmail = accumulator.has("email"); // false
```

### Removing Properties

**Description**: Remove a property from the accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30, city: "New York" });

// Remove a property
const withoutAge = accumulator.remove("age");

console.log(withoutAge.has("age")); // false
console.log(withoutAge.has("name")); // true
console.log(withoutAge.has("city")); // true
```

### Getting All Keys

**Description**: Retrieve an array of all keys in the accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30 })
  .accumulate({ city: "New York" });

// Get all keys
const keys = accumulator.keys(); // ["name", "age", "city"]
```

### Getting All Values

**Description**: Retrieve an array of all values in the accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30 });

// Get all values
const values = accumulator.values(); // ["John", 30]
```

### Getting the Size

**Description**: Get the number of key-value pairs in the accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator();
console.log(accumulator.size()); // 0

const withData = accumulator.accumulate({ name: "John", age: 30 });
console.log(withData.size()); // 2

const moreData = withData.accumulate({ city: "New York", country: "USA" });
console.log(moreData.size()); // 4
```

### Clearing the Accumulator

**Description**: Remove all properties and return a new empty accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30 });

// Clear all properties
const emptyAccumulator = accumulator.clear();
console.log(emptyAccumulator.size()); // 0
console.log(emptyAccumulator.keys()); // []
```

### Iterating with forEach

**Description**: Execute a callback function for each key-value pair in the accumulator.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ a: 1, b: 2, c: 3 });

// Iterate over all entries
accumulator.forEach((value, key, index) => {
  console.log(`${index}: ${key} = ${value}`);
});
// Output:
// 0: a = 1
// 1: b = 2
// 2: c = 3
```

### Mapping Values

**Description**: Create a new array by applying a function to each key-value pair.

```typescript
import { ObjectAccumulator } from 'typed-object-accumulator';

const accumulator = new ObjectAccumulator()
  .accumulate({ name: "John", age: 30, city: "New York" });

// Map entries to a new format
const formattedEntries = accumulator.map((value, key) => `${key}: ${value}`);
// ["name: John", "age: 30", "city: New York"]
```

## VERSION Constant

**Description**: Access the current version of the library.

```typescript
import { VERSION } from 'typed-object-accumulator';

console.log(`Using typed-object-accumulator version: ${VERSION}`);
```


### Social

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/decaf-ts/)




#### Languages

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

Financial support is always welcome and helps keep both me and the project alive and healthy.

So if you can, if this project in any way. either by learning something or simply by helping you save precious time, please consider donating.

## License

This project is released under the [MIT License](./LICENSE.md).

By developers, for developers...