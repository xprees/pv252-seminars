import { fibonacci } from "./fibonacci.ts";

test("fibonacci-5", () => {
  expect(fibonacci(5)).toBe(5);
});

test("fibonacci-10", () => {
  expect(fibonacci(10)).toBe(55);
});

test("fibonacci-15", () => {
  expect(fibonacci(14)).toBe(610);
});