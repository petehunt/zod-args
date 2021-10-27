# zod-args

`zod-args` is an easy way to create type-safe CLIs with `zod`.

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
})
```
