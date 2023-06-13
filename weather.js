import Conf from 'conf'
import got from 'got'
import chalk from 'chalk'
import prompts from 'prompts'
import ora from 'ora'

const config = new Conf({projectName: 'weather-cli'})

const API_KEY = config.get('api')

const API_URL = 'http://api.weatherapi.com/v1/current.json?key=' + API_KEY + '&q='

export const weather = async (location) => {
    console.log()
    const loading = ora({
        text: 'Loading weather for ' + chalk.blue(location) + '...',
        spinner: 'earth'
    })
    loading.start()
    const requestURL = API_URL + location + '&aqi=no'
    await got(requestURL).json().then(response => {
        loading.succeed('The weather in ' + chalk.blue(response.location.name) + ' is ' + chalk.blue(response.current.condition.text) + ' with a temperature of ' + chalk.blue(response.current.temp_c) + '°C.')
    }).catch(error => {
        const reason = JSON.parse(error.response.body).error.message
        loading.fail(chalk.red('Error: ' + reason))
    }
    )
}

export const weatherprompt = async () => {
    const response = await prompts({
        type: 'text',
        name: 'location',
        message: 'Enter a location'
    })
    if (response.location) {
        await weather(response.location)
    } else {
        console.log(chalk.red('Location undefined.'))
    }
    process.exit(0)
}