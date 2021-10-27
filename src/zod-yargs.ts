import yargs, { Options, PositionalOptionsType } from "yargs";
import { hideBin } from "yargs/helpers";
import { z, ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { Option, Some, None } from "ts-results";
import invariant from "tiny-invariant";

interface ZodDef {
  typeName?: string;
  innerType?: ZodTypeAny;
  defaultValue?: () => any;
  values?: any[];
}

function getZodDef(type: ZodTypeAny): ZodDef {
  return type._def;
}

function getBaseTypeName(type: ZodTypeAny): string | null {
  const def = getZodDef(type);
  if (def.innerType) {
    return getBaseTypeName(def.innerType) || def.typeName || null;
  }
  return def.typeName || null;
}

function isOptional(type: ZodTypeAny): boolean {
  const def = getZodDef(type);
  if (def.typeName === "ZodOptional") {
    return true;
  }
  if (def.innerType) {
    return isOptional(def.innerType);
  }
  return false;
}

function getDefaultValue(type: ZodTypeAny): Option<any> {
  const def = getZodDef(type);
  if (def.typeName === "ZodDefault") {
    invariant(
      def.defaultValue,
      "expected ZodDefault to have a defaultValue() method"
    );
    return Some(def.defaultValue());
  }
  if (def.innerType) {
    return getDefaultValue(def.innerType);
  }
  return None;
}

function getEnumValues(type: ZodTypeAny): string[] | null {
  const def = getZodDef(type);
  if (def.typeName === "ZodEnum") {
    def.values!.forEach((element: any) => {
      invariant(typeof element === "string", "all enum values must be strings");
    });
    return def.values!;
  }
  if (def.innerType) {
    return getEnumValues(def.innerType);
  }
  return null;
}

const ZOD_TYPE_TO_YARGS_TYPE: Record<string, PositionalOptionsType> = {
  ZodString: "string",
  ZodBoolean: "boolean",
  ZodNumber: "number",
  ZodEnum: "string",
};

export function parseArgs<TShape extends ZodRawShape>(
  shape: TShape,
  args: string[] = hideBin(process.argv)
): z.infer<ZodObject<TShape>> {
  const options: Record<string, Options> = {};

  for (const name in shape) {
    const type = shape[name];
    const typeName = getBaseTypeName(type);
    invariant(typeName, `Arg ${name} did not have a Zod type`);
    const yargsType = ZOD_TYPE_TO_YARGS_TYPE[typeName];
    invariant(
      yargsType,
      `Arg ${name} had invalid Zod type ${typeName}. Must be one of: ${Object.keys(
        ZOD_TYPE_TO_YARGS_TYPE
      ).join(", ")}`
    );
    const defaultValue = getDefaultValue(type);
    options[name] = {
      type: yargsType,
      requiresArg: yargsType !== "boolean",
      demandOption:
        !defaultValue.some && yargsType !== "boolean" && !isOptional(type),
      default: defaultValue.unwrapOr(
        yargsType === "boolean" ? false : undefined
      ),
      choices: getEnumValues(type) || undefined,
    };
  }

  return z.object(shape).parse(yargs(args).options(options).parseSync());
}
