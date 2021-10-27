import { parseArgs } from "./zod-yargs";
import { z } from "zod";

test("zod-yargs smoke test", () => {
  const spec = {
    name: z.string(),
    age: z.number().optional().default(1),
    isFemale: z.boolean(),
  };
  expect(parseArgs(spec, ["--name", "pete"])).toEqual({
    name: "pete",
    age: 1,
    isFemale: false,
  });
  expect(
    parseArgs(spec, ["--name", "nolly", "--isFemale", "--age", "0"])
  ).toEqual({ name: "nolly", age: 0, isFemale: true });

  const exit = jest
    .spyOn(process, "exit")
    .mockImplementation(() => ({} as never));
  const error = jest.spyOn(console, "error").mockImplementation(() => {});
  expect(() => parseArgs(spec, [])).toThrow();
  expect(exit).toHaveBeenCalledWith(1);
  expect(error.mock.calls.length).toBeGreaterThan(0);
  expect(error.mock.calls[0][0]).toMatch(/Options:/);
});
