#!/usr/bin/env node --no-warnings
import "dotenv/config";
import Conf from "conf";
import chalk from "chalk";
import prompts from "prompts";
import { weather, weatherprompt } from "./weather.js";
import getopts from "getopts";
import { readFileSync } from "fs";
import gradient from "gradient-string";

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
    info: "i",
  },
});

if (options.help) {
  console.clear();
  console.log(gradient.morning(`
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
        -i, --info          show project related info

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather --info
        $ weather -f Munich
        $ weather
    `));
  process.exit(0);
}

if (options.version) {
  console.log(chalk.green("v" + packageJson.version));
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

if (options.info) {
  console.clear();
  console.log(gradient.teen("Weather CLI"));
  console.log(gradient.passion("Version: ") + packageJson.version);
  console.log(gradient.retro("Author: ") + packageJson.author);
  console.log(gradient.mind("Repository: ") + packageJson.repository.url);
  console.log(gradient.cristal("License: ") + packageJson.license);
  console.log(gradient.fruit(packageJson.date));
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
  console.clear();
  if (argv.length > 1) {
    weather(argv.join(" "));
  } else {
    console.log(chalk.red("You need to specify a location."));
  }
} else {
  console.clear();
  if (argv.length > 0) {
    weatherprompt(argv.join(" "));
  } else {
    weatherprompt();
  }
}
