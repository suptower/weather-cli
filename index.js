#!/usr/bin/env node --no-warnings
import "dotenv/config";
import Conf from "conf";
import chalk from "chalk";
import prompts from "prompts";
import { weather, weatherprompt } from "./weather.js";
import getopts from "getopts";
import { readFileSync } from "fs";

const packageJson = JSON.parse(readFileSync("./package.json"));

const config = new Conf({ projectName: "weather-cli" });
const argv = process.argv.slice(2);

if (process.env.API_KEY) {
  config.set("api", process.env.API_KEY);
}

const options = getopts(argv, {
  alias: {
    help: "h",
    version: "v",
    api: "a",
    env: "e",
    prompt: "p",
  },
});

if (options.help) {
  console.log(`
    Usage: 
        $ worldweather [options]
        $ worldweather [location]

    Options:
        -h, --help          output usage information
        -v, --version       output the version number
        -a, --api           set api key
        -e, --env           set api key from environment variable
        -p, --prompt        prompt menu for detailed weather

    Examples:
        $ worldweather Munich
        $ worldweather --api
        $ worldweather -v
    `);
  process.exit(0);
}

if (options.version) {
  console.log("v" + packageJson.version);
  process.exit(0);
}

if (options.env) {
  if (process.env.API_KEY) {
    await config.set("api", process.env.API_KEY);
    console.log(chalk.green("API key from dotenv has been set."));
  } else {
    console.log(chalk.red("API key not found in dotenv."));
  }
  process.exit(0);
}

if (options.api) {
  (async () => {
    const response = await prompts({
      type: "text",
      name: "api",
      message: "Enter your API key",
    });
    if (response.api) {
      await config.set("api", response.api);
      console.log(chalk.green("API key saved."));
    } else {
      console.log(chalk.red("API key undefined."));
    }
    process.exit(0);
  })();
} else if (options.prompt) {
  weatherprompt();
} else {
  if (argv.length === 0) {
    console.log(chalk.red("Error: No location specified."));
    process.exit(1);
  }
  const location = argv.join(" ");
  weather(location);
}
