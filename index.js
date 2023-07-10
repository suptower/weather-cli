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
    fast: "f",
  },
});

if (options.help) {
  console.log(`
    Usage: 
        $ weather [options]
        $ weather [location]
        $ weather [options] [location]

    Options:
        -h, --help          output usage information
        -v, --version       output the version number
        -a, --api           set api key
        -e, --env           set api key from environment variable API_KEY
        -f , --fast         fast mode, no prompt, locations as arg

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather -f Munich
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
} else if (options.fast) {
  if (argv.length > 1) {
    weather(argv.join(" "));
  } else {
    console.log(chalk.red("You need to specify a location."));
  }
} else {
  if (argv.length > 0) {
    weatherprompt(argv.join(" "));
  } else {
    weatherprompt();
  }
}