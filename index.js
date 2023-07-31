#!/usr/bin/env node --no-warnings
// make us of .env file
import "dotenv/config";

// persist config
import Conf from "conf";

// terminal styling
import chalk from "chalk";

// user input
import prompts from "prompts";

// weather api
import { weather, weatherprompt } from "./weather.js";

// cli options
import getopts from "getopts";

// filesystem
import { readFileSync } from "fs";

// gradient colors
import gradient from "gradient-string";

// read package.json
const packageJson = JSON.parse(readFileSync("./package.json"));

// persist config
const schema = {
  unit: {
    type: "string",
    default: "metric",
  },
};

const config = new Conf({ projectName: "weather-cli", schema });

// get cli arguments
const argv = process.argv.slice(2);

// set api key from env variable
if (process.env.API_KEY) {
  config.set("api", process.env.API_KEY);
}

// cli options
const options = getopts(argv, {
  alias: {
    help: "h",
    version: "v",
    api: "a",
    config: "c",
    env: "e",
    fast: "f",
    info: "i",
  },
});

// weather --help
if (options.help) {
  console.clear();
  console.log(
    gradient.morning(`
    Usage: 
        $ weather [options]
        $ weather [location]
        $ weather [options] [location]

    Options:
        -h, --help          output usage information
        -v, --version       output the version number
        -a, --api           set api key
        -c, --config        show config
        -e, --env           set api key from environment variable API_KEY
        -f , --fast [loc]   fast mode, no prompt, location as arg
        -i, --info          show project related info

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather --config
        $ weather --info
        $ weather -f Munich
        $ weather
    `),
  );
  process.exit(0);
}

// weather --version
if (options.version) {
  console.log(chalk.green("v" + packageJson.version));
  process.exit(0);
}

// weather --env
if (options.env) {
  if (process.env.API_KEY) {
    await config.set("api", process.env.API_KEY);
    console.log(chalk.green("API key from dotenv has been set."));
  } else {
    console.log(chalk.red("API key not found in dotenv."));
  }
  process.exit(0);
}

// weather --info
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

// weather --config
if (options.config) {
  (async () => {
    console.clear();
    // prompt for config
    const response = await prompts({
      type: "select",
      name: "config",
      message: "Select config option",
      choices: [
        { title: "Show API key", value: "show" },
        { title: "Delete API key", value: "delete" },
        { title: "Set temperature unit", value: "unit" },
        { title: "Clear config", value: "clear" },
        { title: "Cancel", value: "cancel" },
      ],
    });
    if (response.config === "show") {
      const api = await config.get("api");
      if (api) {
        console.log(chalk.green("API key: " + api));
      } else {
        console.log(chalk.red("API key undefined."));
      }
    }
    if (response.config === "delete") {
      await config.delete("api");
      console.log(chalk.green("API key deleted."));
    }
    if (response.config === "unit") {
      // Check for active choise
      let unitInitial = 1;
      if (config.get("unit") === "metric") {
        unitInitial = 0;
      }
      const unit = await prompts({
        type: "select",
        name: "unit",
        message: "Select temperature unit",
        choices: [
          { title: "Celsius", value: "metric" },
          { title: "Fahrenheit", value: "imperial" },
        ],
        initial: unitInitial,
      });
      await config.set("unit", unit.unit);
      console.log(chalk.green("Temperature unit saved as " + config.get("unit") + "."));
    }
    if (response.config === "clear") {
      await config.clear();
      console.log(chalk.green("Config cleared."));
    }
    process.exit(0);
  })();
} else if (options.api) {
  //
  (async () => {
    // prompt for api key
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
  // fast mode, only condition and temperature
  console.clear();
  if (argv.length > 1) {
    weather(argv.join(" "));
  } else {
    console.log(chalk.red("You need to specify a location."));
  }
} else {
  // prompt for location
  console.clear();
  if (argv.length > 0) {
    weatherprompt(argv.join(" "));
  } else {
    weatherprompt();
  }
}
