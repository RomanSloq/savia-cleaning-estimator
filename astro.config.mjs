import { defineConfig } from "astro/config";
import deno from "@deno/astro-adapter";

export default defineConfig({
  output: "server",
  adapter: deno(),
});
