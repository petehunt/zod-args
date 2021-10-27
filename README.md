# zod-args

`zod-args` is the fastest way to throw together a simple CLI with TypeScript type checking. It uses [zod](https://github.com/colinhacks/zod) for type inference and runtime validation.

## Supported Zod features

- `string`
- `number`
- `boolean`
- `optional`
- `default`

## Getting started

```
npm install zod-args
```

## Example

```
import { parseArgs } from "zod-args";

const args = parseArgs({
  name: z.string(),
  age: z.number().optional().default(1),
});

console.log(`Hello ${args.name}! You are ${args.age} years old.`);
```
