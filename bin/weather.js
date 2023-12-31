// persist config
import Conf from "conf";

// http requests
import got from "got";

// terminal styling
import chalk from "chalk";

// user input
import prompts from "prompts";

// spinners
import ora from "ora";

// triple forecast
import { tripleForecast } from "./tripleForecast.js";

const config = new Conf({ projectName: "weather-cli" });

// get API key from config
const API_KEY = config.get("api");

// Date for forecast warning
const dateTime = new Date();

// set API URL
const API_URL = "http://api.weatherapi.com/v1/current.json?key=" + API_KEY + "&q=";
const API_URL_FORECAST = "http://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=";

// three day forecast from cmd line directly
export const threeday = async location => {
  console.log(chalk.blue("Three day forecast for " + location + ":"));
  tripleForecast(location);
};

// fast mode
export const weather = async location => {
  console.log();
  const loading = ora({
    text: "Loading weather for " + chalk.blue(location) + "...",
    spinner: "earth",
  });
  loading.start();
  const requestURL = API_URL + location + "&aqi=no";
  await got(requestURL)
    .json()
    .then(response => {
      loading.succeed(
        "The weather in " +
          chalk.blue(response.location.name) +
          " is " +
          chalk.blue(response.current.condition.text) +
          " with a temperature of " +
          chalk.blue(getTemperatureWithUnit(response.current)) +
          "°C.",
      );
    })
    .catch(error => {
      const reason = JSON.parse(error.response.body).error.message;
      loading.fail(chalk.red("Error: " + reason));
    });
};

/*  interactive mode
    prompts user for location
    then lets user choose from a menu
    to display location information, current condition, forecast, etc.
*/
export const weatherprompt = async location => {
  let response;
  if (location) {
    response = location;
  } else {
    response = await prompts({
      type: "text",
      name: "location",
      message: "Enter a location",
    });
  }
  if (response.location) {
    const loading = ora({
      text: "Loading weather for " + chalk.blue(response.location) + "...",
      spinner: "earth",
    });
    loading.start();
    const requestURL = API_URL + response.location + "&aqi=no";
    await got(requestURL)
      .json()
      .then(response => {
        loading.succeed(
          " Weather information for " +
            chalk.blue(response.location.name) +
            " (local time: " +
            chalk.cyan(response.location.localtime) +
            ") has been loaded.",
        );
        promptMenu(response);
      })
      .catch(error => {
        const reason = JSON.parse(error.response.body).error.message;
        loading.fail(chalk.red("Error: " + reason));
      });
  } else if (location) {
    const loading = ora({
      text: "Loading weather for " + chalk.blue(location) + "...",
      spinner: "earth",
    });
    loading.start();
    const requestURL = API_URL + location + "&aqi=no";
    await got(requestURL)
      .json()
      .then(response => {
        loading.succeed(
          " Weather information for " +
            chalk.blue(response.location.name) +
            " (local time: " +
            chalk.cyan(response.location.localtime) +
            ") has been loaded.",
        );
        console.clear();
        promptMenu(response);
      })
      .catch(error => {
        const reason = JSON.parse(error.response.body).error.message;
        loading.fail(chalk.red("Error: " + reason));
      });
  } else {
    console.log(chalk.red("Location undefined."));
  }
};

// prompt menu to select wanted information
const promptMenu = async response => {
  console.log(
    "Weather information for " +
      chalk.blue(response.location.name) +
      " (local time: " +
      chalk.cyan(response.location.localtime) +
      ") has been loaded.",
  );
  const menu = await prompts({
    type: "select",
    name: "value",
    message: "Select an option",
    choices: [
      { title: "Location information", value: "location" },
      { title: "Current condition", value: "current" },
      { title: "Current condition (detailed)", value: "currentdetailed" },
      { title: "Forecast", value: "forecast" },
      { title: "3-day forecast", value: "3day" },
      { title: "Exit", value: "exit" },
    ],
  });
  switch (menu.value) {
    case "location":
      printLocation(response.location, response);
      break;
    case "current":
      printCurrent(response.current, response);
      break;
    case "currentdetailed":
      printCurrentDetailed(response.current, response);
      break;
    case "forecast": {
      console.log(chalk.blue("Forecast:"));
      const days = dateTime.getDate().toString();
      const months = (dateTime.getMonth() + 1).toString();
      const years = dateTime.getFullYear().toString();
      const proof = days + "." + months + "." + years;
      let showForecast = false;
      const configString = String(config.get("forecast_api"));
      const proofString = proof.toString();
      if (config.get("forecast_api") === undefined || configString.localeCompare(proofString) !== 0) {
        // warning has not been shown today
        console.log(
          chalk.bold.yellow(
            "Forecast API currently supports only up to a maximum of 14 days. Depending on the location, the forecast data may only be available for a shorter period.",
          ),
        );
        showForecast = await prompts({
          type: "confirm",
          name: "value",
          message: "Do you wish to continue?",
          initial: true,
        });
        if (showForecast.value) {
          config.set("forecast_api", proof);
          showForecast = true;
        }
      } else {
        showForecast = true;
      }
      if (showForecast === true) {
        const days = await prompts({
          type: "number",
          name: "value",
          message: "How many days do you wish to see (1-14)?",
          initial: 1,
          min: 1,
          max: 14,
        });
        getForecast(response, days);
      } else {
        console.log(chalk.red("Forecast cancelled."));
      }
      break;
    }
    case "3day": {
      console.log(chalk.blue("3-day forecast:"));
      tripleForecast(response.location.name);
      break;
    }
    case "exit": {
      console.log(chalk.red("Exiting..."));
      break;
    }
    default:
      console.log(chalk.red("Error: " + menu.value + " is not a valid option."));
      break;
  }
};

// get forecast day to display
const getForecast = async (response, days) => {
  console.clear();
  const loading = ora({
    text: "Loading forecast for " + chalk.blue(response.location.name) + "...",
    spinner: "earth",
  });
  loading.start();
  await got(API_URL_FORECAST + response.location.name + "&days=" + days.value + "&aqi=no&alerts=no")
    .json()
    .then(async response => {
      loading.succeed("Forecast for " + chalk.blue(response.location.name) + " has been loaded.");
      console.log(chalk.blue("Forecast for " + chalk.cyan(response.location.name) + ":"));
      console.log(
        chalk.yellow("Data has been fetched for " + chalk.cyan(response.forecast.forecastday.length) + " days."),
      );
      // Let user select a day or exit
      const dayChoices = response.forecast.forecastday.map(day => {
        return { title: day.date, value: day };
      });
      dayChoices.push({ title: "Exit", value: "exit" });
      await prompts({
        type: "select",
        name: "value",
        message: "Select a day",
        choices: dayChoices,
      }).then(async day => {
        if (day.value === "exit") {
          console.log(chalk.red("Exiting..."));
          return;
        }
        console.log(
          chalk.blue(
            "You selected " + chalk.cyan(day.value.date) + ". You can now select a time to view the forecast.",
          ),
        );
        const presetTimes = await config.get("presetOptions");
        if (config.get("traverse") === "preset" && presetTimes !== undefined && presetTimes.length > 0) {
          // show preset options
          const preset = await prompts({
            type: "select",
            name: "value",
            message: "Select a preset",
            choices: presetTimes,
          });
          printCurrentDetailedForecast(response.current, day.value.hour[preset.value], response, days);
        } else {
          if (config.get("traverse") === "preset") {
            console.log(chalk.red("No preset options available. Please add some presets."));
            console.log(
              chalk.yellow(
                "You can do this by running the command: " +
                  chalk.cyan("weather -c") +
                  chalk.magenta(" (weather --config)"),
              ),
            );
            console.log(chalk.blue("Using traverse-dial-style instead."));
          }
          // make number prompt for hour, traverse-dial-style
          await prompts({
            type: "number",
            name: "value",
            message: "Select an hour (0-23)",
            initial: 12,
            min: 0,
            max: 23,
          }).then(async hour => {
            printCurrentDetailedForecast(response.current, day.value.hour[hour.value], response, days);
          });
        }
      });
    });
};

// Takes response.location
const printLocation = async (response, callback) => {
  console.log(chalk.blue("Location information:"));
  console.log(chalk.magenta("Name: " + chalk.cyan(response.name)));
  console.log(chalk.magenta("Region: " + chalk.cyan(response.region)));
  console.log(chalk.magenta("Country: " + chalk.cyan(response.country)));
  console.log(chalk.magenta("Latitude: " + chalk.cyan(response.lat)));
  console.log(chalk.magenta("Longitude: " + chalk.cyan(response.lon)));
  console.log(chalk.magenta("Timezone: " + chalk.cyan(response.tz_id)));
  console.log(chalk.magenta("Local time: " + chalk.cyan(response.localtime)));
  // Prompt user to go back to location screen
  await prompts({
    type: "toggle",
    name: "value",
    message: "Go back to option selection?",
    initial: true,
    active: "yes",
    inactive: "no",
  }).then(async back => {
    if (back.value) {
      console.clear();
      promptMenu(callback);
    } else {
      console.log(chalk.red("Exit."));
    }
  });
};

// Takes response.current
const printCurrent = async (response, callback) => {
  console.log(chalk.blue("Current condition (last updated: " + chalk.cyan(response.last_updated) + "):"));
  console.log(chalk.magenta("Condition: " + chalk.cyan(response.condition.text)));
  console.log(chalk.magenta("Temperature: " + chalk.cyan(getTemperatureWithUnit(response))));
  // Prompt user to go back to location screen
  await prompts({
    type: "toggle",
    name: "value",
    message: "Go back to option selection?",
    initial: true,
    active: "yes",
    inactive: "no",
  }).then(async back => {
    if (back.value) {
      console.clear();
      promptMenu(callback);
    } else {
      console.log(chalk.red("Exit."));
    }
  });
};

// Takes response.current
const printCurrentDetailed = async (response, callback) => {
  console.log(
    chalk.blue("Current condition (detailed | last updated: " + chalk.italic.cyan(response.last_updated) + "):"),
  );
  console.log(chalk.magenta("Condition: " + chalk.cyan(response.condition.text)));
  console.log(chalk.magenta("Temperature: " + chalk.cyan(getTemperatureWithUnit(response))));
  console.log(
    chalk.magenta("Wind Speed | Direction: " + chalk.cyan(response.wind_kph + " km/h | " + response.wind_dir)),
  );
  console.log(chalk.magenta("Precipitation ammount: " + chalk.cyan(response.precip_mm + " mm")));
  console.log(chalk.magenta("Humidity: " + chalk.cyan(response.humidity + " %")));
  console.log(chalk.magenta("Cloud cover: " + chalk.cyan(response.cloud + " %")));
  console.log(chalk.magenta("UV Index: " + chalk.cyan(response.uv)));
  console.log(chalk.magenta("Visibility Distance: " + chalk.cyan(response.vis_km + " km")));
  console.log(chalk.magenta("Pressure Amount: " + chalk.cyan(response.pressure_mb + " mb")));
  // Prompt user to go back to location screen
  await prompts({
    type: "toggle",
    name: "value",
    message: "Go back to option selection?",
    initial: true,
    active: "yes",
    inactive: "no",
  }).then(async back => {
    if (back.value) {
      console.clear();
      promptMenu(callback);
    } else {
      console.log(chalk.red("Exit."));
    }
  });
};

// New method for printing current detailed forecast
const printCurrentDetailedForecast = async (current, response, callback, days) => {
  console.log(
    chalk.blue(
      "Current condition (detailed) for " +
        chalk.green(response.time) +
        " (" +
        chalk.italic.cyan("last updated: " + chalk.italic.cyan(current.last_updated)),
    ) + ")",
  );
  console.log(chalk.magenta("Condition: " + chalk.cyan(response.condition.text)));
  console.log(chalk.magenta("Temperature: " + chalk.cyan(getTemperatureWithUnit(response))));
  console.log(
    chalk.magenta("Wind Speed | Direction: " + chalk.cyan(response.wind_kph + " km/h | " + response.wind_dir)),
  );
  console.log(chalk.magenta("Precipitation ammount: " + chalk.cyan(response.precip_mm + " mm")));
  console.log(chalk.magenta("Humidity: " + chalk.cyan(response.humidity + " %")));
  console.log(chalk.magenta("Cloud cover: " + chalk.cyan(response.cloud + " %")));
  console.log(chalk.magenta("UV Index: " + chalk.cyan(response.uv)));
  console.log(chalk.magenta("Visibility Distance: " + chalk.cyan(response.vis_km + " km")));
  console.log(chalk.magenta("Pressure Amount: " + chalk.cyan(response.pressure_mb + " mb")));

  // Prompt user to go back to day selection
  await prompts({
    type: "toggle",
    name: "value",
    message: "Go back to day selection?",
    initial: true,
    active: "yes",
    inactive: "no",
  }).then(async back => {
    if (back.value) {
      console.clear();
      getForecast(callback, days);
    } else {
      promptMenu(callback);
    }
  });
};

// Auxiliary function to get correct temperature unit saved from config, directly returns String of temperature with unit
const getTemperatureWithUnit = response => {
  if (config.get("unit") === "metric") {
    return response.temp_c + "°C";
  } else {
    return response.temp_f + "°F";
  }
};
