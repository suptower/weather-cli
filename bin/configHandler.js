// Persist conf
import Conf from "conf";

// terminal styling
import chalk from "chalk";

// user input
import prompts from "prompts";

// gradient strings
import gradient from "gradient-string";

// tables
import { table } from "table";

const config = new Conf({ projectName: "weather-cli" });

export const configHandler = async noclear => {
  if (!noclear) {
    console.clear();
  }
  // prompt for config
  const response = await prompts({
    type: "select",
    name: "config",
    message: "Select config option",
    choices: [
      { title: "Show API key", value: "show" },
      { title: "Delete API key", value: "delete" },
      { title: "Set temperature unit", value: "unit" },
      { title: "Set forecast hour traversing style", value: "traverse" },
      { title: "Preset Times Configuration", value: "preset" },
      { title: "Set favorite location", value: "location"},
      { title: "Set default action for blank command", value: "default"},
      { title: "Reset config", value: "reset" },
      { title: "Cancel", value: "cancel" },
    ],
  });
  if (response.config === "show") {
    await showAPI();
    await recall(true);
  }
  if (response.config === "delete") {
    await deleteAPI();
    await recall(true);
  }
  if (response.config === "unit") {
    await setUnit();
    await recall(true);
  }
  if (response.config === "reset") {
    await clearConfig();
    await recall(true);
  }
  if (response.config === "traverse") {
    await setTraverseStyle();
    await recall(true);
  }
  if (response.config === "preset") {
    await presetConfig();
    await recall(false);
  } 
  if (response.config === "location") {
    await setLocation();
    await recall(false);
  } 
  if (response.config === "default") {
    await setDefault();
    await recall(false);
  } else if (response.config === "cancel") {
    process.exit(0);
  }
};

// recall function to go back to main configuration menu, noclear specifies if the screen should be cleared or not
// noclear is false by default and will clear the screen
const recall = async noclear => {
  // check if noclear is defined
  if (noclear === undefined) {
    noclear = false;
  }
  const confirm = await prompts({
    type: "confirm",
    name: "value",
    message: "Do you want to return to the main menu?",
    initial: true,
  });
  if (confirm.value) {
    await configHandler(noclear);
  } else {
    process.exit(0);
  }
};

const showAPI = async () => {
  const api = await config.get("api");
  if (api) {
    console.log(chalk.green("API key: " + api));
  } else {
    console.log(chalk.red("API key undefined."));
  }
};

const deleteAPI = async () => {
  await config.delete("api");
  console.log(chalk.green("API key deleted."));
};

const setUnit = async () => {
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
};

const clearConfig = async () => {
  await config.reset();
  console.log(chalk.green("Config cleared."));
};

const setTraverseStyle = async () => {
  // Check for active choise
  let traverseInitial = 0;
  if (config.get("traverse") === "preset") {
    traverseInitial = 1;
  }
  const traverse = await prompts({
    type: "select",
    name: "traverse",
    message: "Select forecast hour traversing style",
    choices: [
      { title: "Dial", value: "dial" },
      { title: "Preset times", value: "preset" },
    ],
    initial: traverseInitial,
  });
  await config.set("traverse", traverse.traverse);
  console.log(chalk.green("Forecast hour traversing style saved as " + config.get("traverse") + "."));
};

const presetConfig = async () => {
  // Show options
  const editPresets = await prompts({
    type: "select",
    name: "value",
    message: "Choose an option",
    choices: [
      { title: "Add preset time", value: "add" },
      { title: "Edit preset time", value: "edit" },
      { title: "Remove preset times", value: "remove" },
      { title: "Show preset times", value: "show" },
      { title: "Reset preset times", value: "reset" },
      { title: "Cancel", value: "cancel" },
    ],
  });
  if (editPresets.value === "add") {
    await addPreset();
  } else if (editPresets.value === "edit") {
    await editPreset();
  } else if (editPresets.value === "remove") {
    await removePresets();
  } else if (editPresets.value === "show") {
    await showPresets();
  } else if (editPresets.value === "reset") {
    await resetPresets();
  } else if (editPresets.value === "cancel") {
    await recall(false);
  }
};

const addPreset = async () => {
  const presetTimes = await config.get("presetOptions");
  // Add preset time
  const addPreset = await prompts({
    type: "text",
    name: "value",
    message: "Enter a preset name",
  });
  if (addPreset.value !== undefined && addPreset.value !== "") {
    // check if preset title already exists
    for (let i = 0; i < presetTimes.length; i++) {
      if (presetTimes[i].title === addPreset.value) {
        console.log(
          chalk.red(
            "Preset name already exists with title " +
              chalk.magenta(presetTimes[i].title) +
              " and value " +
              chalk.cyan(presetTimes[i].value) +
              ".",
          ),
        );
        return;
      }
    }
    const addPresetTime = await prompts({
      type: "number",
      name: "value",
      message: "Enter a preset time",
      initial: 0,
      min: 0,
      max: 23,
    });
    if (addPresetTime.value !== undefined) {
      // check if preset time already exists
      for (let i = 0; i < presetTimes.length; i++) {
        if (presetTimes[i].value === addPresetTime.value) {
          console.log(
            chalk.red(
              "Preset time already exists with name " +
                chalk.magenta(presetTimes[i].title) +
                " and value " +
                chalk.cyan(presetTimes[i].value) +
                ".",
            ),
          );
          return;
        }
      }
      presetTimes.push({ title: addPreset.value, value: addPresetTime.value });
      presetTimes.sort((a, b) => a.value - b.value);
      await config.set("presetOptions", presetTimes);
      console.log(chalk.green("Preset time added."));
    } else {
      console.log(chalk.red("Preset time undefined."));
    }
  } else {
    console.log(chalk.red("Preset name undefined."));
  }
};

const editPreset = async () => {
  // make prompt for preset time
  const presetTimes = await config.get("presetOptions");
  let oldTitle = "";
  let oldIndex = 0;
  // make sure there are preset times
  if (presetTimes.length > 0) {
    const selectPreset = await prompts({
      type: "select",
      name: "value",
      message: "Select a preset time to edit",
      choices: presetTimes,
    });
    if (selectPreset.value !== undefined) {
      // edit name
      const editPreset = await prompts({
        type: "text",
        name: "value",
        message: "Enter a preset name",
        initial: selectPreset.value.title,
      });
      if (editPreset.value !== undefined && editPreset.value !== "") {
        // check if other preset has same name
        for (let i = 0; i < presetTimes.length; i++) {
          if (presetTimes[i].title === editPreset.value) {
            oldTitle = presetTimes[i].title;
            oldIndex = i;
            if (presetTimes[i].value !== selectPreset.value) {
              console.log(
                chalk.red("Preset name already exists with value " + chalk.magenta(presetTimes[i].value) + "."),
              );
              return;
            }
          }
        }
        // edit time
        const editPresetTime = await prompts({
          type: "number",
          name: "value",
          message: "Enter a preset time",
          initial: selectPreset.value.value,
          min: 0,
          max: 23,
        });
        if (editPresetTime.value !== undefined) {
          // check if other preset has same time
          for (let i = 0; i < presetTimes.length; i++) {
            if (presetTimes[i].value === editPresetTime.value && presetTimes[i].title !== oldTitle && i !== oldIndex) {
              console.log(
                chalk.red("Preset time already exists with title " + chalk.magenta(presetTimes[i].title) + "."),
              );
              return;
            }
          }
          // remove old preset
          for (let i = 0; i < presetTimes.length; i++) {
            if (presetTimes[i].value === selectPreset.value) {
              presetTimes.splice(i, 1);
              break;
            }
          }
          // add new preset
          presetTimes.push({ title: editPreset.value, value: editPresetTime.value });
          presetTimes.sort((a, b) => a.value - b.value);
          await config.set("presetOptions", presetTimes);
          console.log(chalk.green("Preset time edited."));
        } else {
          console.log(chalk.red("Preset time undefined."));
        }
      } else {
        console.log(chalk.red("Preset name undefined."));
      }
    }
  } else {
    console.log(chalk.red("No preset times."));
  }
};

const removePresets = async () => {
  // show prompts for preset time
  const presetTimes = await config.get("presetOptions");
  // make sure there are preset times
  if (presetTimes.length > 0) {
    const selectPreset = await prompts({
      type: "multiselect",
      name: "value",
      message: "Select preset times to delete",
      choices: presetTimes,
    });
    // delete preset times
    if (selectPreset.value !== undefined) {
      // remove preset
      for (let i = 0; i < presetTimes.length; i++) {
        for (const value of selectPreset.value) {
          if (presetTimes[i].value === value) {
            presetTimes.splice(i, 1);
          }
        }
      }
      await config.set("presetOptions", presetTimes);
      console.log(chalk.green("Preset time removed."));
    }
  } else {
    console.log(chalk.red("No preset times."));
  }
};

const showPresets = async () => {
  // print out preset times
  const presetTimes = await config.get("presetOptions");
  // make sure there are preset times
  if (presetTimes.length > 0) {
    const arrayPresetTimes = [["Name", "Time"]];
    for (let i = 0; i < presetTimes.length; i++) {
      arrayPresetTimes.push([presetTimes[i].title, presetTimes[i].value]);
    }
    console.log(gradient.morning(table(arrayPresetTimes)));
  } else {
    console.log(chalk.red("No preset times."));
  }
};

const resetPresets = async () => {
  // make array with default preset times
  const presetTimes = [
    { title: "Night", value: 0 },
    { title: "Morning", value: 6 },
    { title: "Noon", value: 12 },
    { title: "Evening", value: 18 },
  ];
  await config.set("presetOptions", presetTimes);
  console.log(chalk.green("Preset times reset."));
};

const setLocation = async () => {
  const current = await config.get("location");
  console.log(chalk.yellow("Current favorite location: " + chalk.magenta(current)));
  const location = await prompts({
    type: "text",
    name: "value",
    message: "Enter a favorite location",
    initial: current,
  });
  if (location.value !== undefined && location.value !== "") {
    await config.set("location", location.value);
    console.log(chalk.green("Favorite location set."));
  } else {
    console.log(chalk.red("Favorite location undefined."));
  }
}

const setDefault = async () => {
  const current = await config.get("default");
  console.log(chalk.yellow("Current default preset: " + chalk.magenta(current)));
  const action = await prompts({
    type: "select",
    name: "value",
    message: "Select a default preset",
    choices: [
      { title: "Prompt Menu", value: "prompt" },
      { title: "Three Day Forecast", value: "threeday"},
    ],
  });
  if (action.value !== undefined) {
    await config.set("default", action.value);
    console.log(chalk.green("Default preset set."));
  } else {
    console.log(chalk.red("Default preset undefined."));
  }
}