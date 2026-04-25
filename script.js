// ------------------------------------------------------------
// WEATHER APP
// ------------------------------------------------------------
// This file controls the behavior of the weather app.
//
// Big picture:
// 1. Read the city name the user types
// 2. Convert that city name into latitude and longitude
// 3. Use latitude and longitude to request weather data
// 4. Put the returned weather data into the page
// 5. Show useful messages if something goes wrong
//
// Why the app uses 2 API requests:
// - The first API call finds the city and returns coordinates
// - The second API call uses those coordinates to get weather
//
// This shows:
// - how user input works
// - how fetch() works
// - how APIs return JSON data
// - how JavaScript updates the DOM
// - how to debug with console.log()
// ------------------------------------------------------------



// ------------------------------------------------------------
// 1. SELECTING HTML ELEMENTS
// ------------------------------------------------------------
// Grab pieces of the page and store them in variables.
// This lets JavaScript control what the user sees.
// ------------------------------------------------------------

const dewPointValue = document.getElementById("dewPointValue");

const windDirectionValue = document.getElementById("windDirectionValue");

const cityInput = document.getElementById("cityInput");
// The text box where the user types a city name

const searchBtn = document.getElementById("searchBtn");
// The Search button the user clicks

const statusMessage = document.getElementById("statusMessage");
// A paragraph used to show messages like:
// "Loading..."
// "Please enter a city"
// "Weather loaded successfully"
// "City not found"

const weatherCard = document.getElementById("weatherCard");
// The main result panel that displays the weather data

const cityName = document.getElementById("cityName");
// The heading where we show "Nashville"

const conditionText = document.getElementById("conditionText");
// Shows the weather condition text like "Clear Sky" or "Rain"

const weatherIcon = document.getElementById("weatherIcon");
// Shows an emoji icon for the weather condition

const temperature = document.getElementById("temperature");
// Shows the main current temperature

const feelsLike = document.getElementById("feelsLike");
// Shows the "feels like" temperature

const humidityValue = document.getElementById("humidityValue");
// Shows humidity percentage

const windValue = document.getElementById("windValue");
// Shows current wind speed


// ------------------------------------------------------------
// 2. STARTUP LOGS
// ------------------------------------------------------------
// These logs help to confirm that the app loaded
// and the HTML elements were found correctly.
//
// Why this matters:
// If an element is null, JavaScript cannot update it later, so the issue is probably in the HTML ID.
// ------------------------------------------------------------

console.log("App loaded.");
console.log("Search button found:", searchBtn);
console.log("City input found:", cityInput);
console.log("Weather card found:", weatherCard);


// ------------------------------------------------------------
// 3. EVENT LISTENERS
// ------------------------------------------------------------
// Event listeners wait for something to happen.
//
// In this app, we listen for:
// - a button click
// - pressing the Enter key inside the input
//
// Why this matters:
// It gives the app interactivity.
// Without an event, the code just sits there and does nothing.
// ------------------------------------------------------------

searchBtn.addEventListener("click", getWeather);
// When the button is clicked, run getWeather()
searchBtn.addEventListener("click", () => {
  console.log("Button clicked!");
});

cityInput.addEventListener("keydown", function (event) {
  console.log("Key pressed:", event.key);

  // Many users instinctively press Enter instead of clicking.
  // This makes the app feel more natural and complete.
  if (event.key === "Enter") {
    console.log("Enter key detected. Running weather search...");
    getWeather();
  }
});


// ------------------------------------------------------------
// 4. STATUS MESSAGE FUNCTION
// ------------------------------------------------------------
// This function updates the status message area.
//
// What it does:
// - changes the message text
// - resets the CSS class
// - optionally adds a class like "error" or "success"
// ------------------------------------------------------------

function setStatus(message, type = "") {
  console.log("Status update:", message, "| Type:", type);

  // Put the new text into the status paragraph
  statusMessage.textContent = message;

  // Reset the class so old styles do not stick around
  statusMessage.className = "status";

  // Add a special class if provided
  // Example: "error" or "success"
  if (type) {
    statusMessage.classList.add(type);
  }
}


// ------------------------------------------------------------
// 5. SHOW / HIDE THE WEATHER CARD
// ------------------------------------------------------------
// We use these small helper functions to control visibility.
//
// Why this matters:
// On first load, there is no weather data yet.
// Also, if something goes wrong, we do not want to keep
// showing old data from a previous successful search.
// ------------------------------------------------------------

function showCard() {
  console.log("Showing weather card.");
  weatherCard.classList.remove("hidden");
}

function hideCard() {
  console.log("Hiding weather card.");
  weatherCard.classList.add("hidden");
}


// ------------------------------------------------------------
// 6. WEATHER CODE TRANSLATION
// ------------------------------------------------------------
// The weather API returns a numeric weather code.
// Example:
// 0 = clear sky
// 3 = overcast
// 61 = rain
//
// Those numbers mean nothing to users by themselves.
// So we translate the code into:
// - readable text
// - a simple emoji icon
//
// Why this matters:
// APIs often return raw data that is not user-friendly.
// Designers and front-end developers must turn raw data
// into something people can understand quickly.
// ------------------------------------------------------------

function getWeatherDescription(code) {
  console.log("Looking up weather code:", code);

  const weatherMap = {
    0: { text: "Clear Sky", icon: "☀️" },
    1: { text: "Mostly Clear", icon: "🌤️" },
    2: { text: "Partly Cloudy", icon: "⛅" },
    3: { text: "Overcast", icon: "☁️" },
    45: { text: "Fog", icon: "🌫️" },
    48: { text: "Rime Fog", icon: "🌫️" },
    51: { text: "Light Drizzle", icon: "🌦️" },
    53: { text: "Drizzle", icon: "🌦️" },
    55: { text: "Heavy Drizzle", icon: "🌧️" },
    61: { text: "Light Rain", icon: "🌦️" },
    63: { text: "Rain", icon: "🌧️" },
    65: { text: "Heavy Rain", icon: "⛈️" },
    71: { text: "Light Snow", icon: "🌨️" },
    73: { text: "Snow", icon: "❄️" },
    75: { text: "Heavy Snow", icon: "🌨️" },
    80: { text: "Rain Showers", icon: "🌦️" },
    81: { text: "Heavy Showers", icon: "🌧️" },
    82: { text: "Violent Showers", icon: "⛈️" },
    95: { text: "Thunderstorm", icon: "⛈️" }
  };

  // If the code exists in the map, return that result.
  // If not, return a default "Unknown" object.
  // This prevents the app from breaking when an unexpected weather code appears.
  const result = weatherMap[code] || { text: "Unknown", icon: "🌍" };

  console.log("Weather description result:", result);
  return result;
}


// ------------------------------------------------------------
// 7. MAIN WEATHER FUNCTION
// ------------------------------------------------------------
// This is the core of the app.
//
// Why it is async:
// fetch() takes time because it requests data from the internet.
// async/await lets us pause and wait for that data cleanly.
//
// Flow:
// A. get city from input
// B. validate input
// C. request geocoding data
// D. extract latitude and longitude
// E. request weather data
// F. render the result into the page
// G. catch and display errors
// ------------------------------------------------------------

async function getWeather() {
  // trim() removes empty spaces from the beginning and end
  // Example: "  Nashville  " becomes "Nashville"
  console.log("Dew Point:", weatherData.current.dew_point_2m);
  console.log("Wind Direction:", weatherData.current.wind_direction_10m);
  const city = cityInput.value.trim();

  console.log("----- New Weather Search -----");
  console.log("Raw input value:", cityInput.value);
  console.log("Trimmed city value:", city);

  // --------------------------------------------------------
  // STEP A: VALIDATE INPUT
  // --------------------------------------------------------
  // If the user clicks Search without typing anything, we stop immediately and show a helpful message.
  //
  // Why this matters:
  // Good apps handle user mistakes gracefully.
  // --------------------------------------------------------
  if (city === "") {
    console.warn("No city entered.");
    hideCard();
    setStatus("Please enter a city name.", "error");
    return;
  }

  // --------------------------------------------------------
  // STEP B: SHOW LOADING STATE
  // --------------------------------------------------------
  // This tells the user that the app is working.
  //
  // Why this matters:
  // Without feedback, users may think the app is broken.
  // --------------------------------------------------------
  setStatus("Loading weather data...");
  hideCard();

  try {
    // ------------------------------------------------------
    // STEP C: GEOCODING REQUEST
    // ------------------------------------------------------
    // The weather API needs coordinates, not just a city name.
    // So we first ask the geocoding API:
    // "Where is this city?"
    //
    // encodeURIComponent(city) safely formats the city name
    // for use in a URL. This is important for spaces and
    // special characters.
    // ------------------------------------------------------
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    console.log("Geocoding URL:", geoUrl);

    const geoResponse = await fetch(geoUrl);
    // await means: wait until the response comes back
    console.log("Geocoding response status:", geoResponse.status);
    console.log("Geocoding response ok:", geoResponse.ok);

    // response.ok is true when the request succeeded
    // If it failed, we throw an error and jump to catch()
    if (!geoResponse.ok) {
      throw new Error("Could not find that location.");
    }

    const geoData = await geoResponse.json();
    // .json() converts the response body into a JavaScript object
    console.log("Full geocoding data:", geoData);

    // If no results were returned, the city was not found
    if (!geoData.results || geoData.results.length === 0) {
      console.warn("No results found in geocoding data.");
      throw new Error("City not found. Try another search.");
    }

    // We only use the first result for simplicity
    const place = geoData.results[0];
    console.log("First location result:", place);

    // Destructuring: pull useful properties out of the object
    const { latitude, longitude, name, country } = place;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("City name:", name);
    console.log("Country:", country);

    // ------------------------------------------------------
    // STEP D: WEATHER REQUEST
    // ------------------------------------------------------
    // Now that we have coordinates, we can ask the weather API for current weather data.
    //
    // This URL requests:
    // - temperature_2m
    // - apparent_temperature
    // - relative_humidity_2m
    // - weather_code
    // - wind_speed_10m
    //
    // We also set:
    // - Fahrenheit
    // - mph
    // - local timezone
    // ------------------------------------------------------
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,dew_point_2m,wind_direction_10m` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

    console.log("Weather URL:", weatherUrl);

    const weatherResponse = await fetch(weatherUrl);
    console.log("Weather response status:", weatherResponse.status);
    console.log("Weather response ok:", weatherResponse.ok);

    if (!weatherResponse.ok) {
      throw new Error("Weather data could not be loaded.");
    }

    const weatherData = await weatherResponse.json();
    console.log("Full weather data:", weatherData);

    // Make sure the current weather object exists
    if (!weatherData.current) {
      console.warn("Weather data is missing the 'current' object.");
      throw new Error("Weather data is missing.");
    }

    console.log("Current weather object:", weatherData.current);

    // ------------------------------------------------------
    // STEP E: RENDER THE DATA
    // ------------------------------------------------------
    // Once we know the data is valid, we pass only what we need to renderWeather()
    // ------------------------------------------------------
    renderWeather(name, country, weatherData.current);

    // Show a success message after rendering
    setStatus("Weather loaded successfully.", "success");
  } catch (error) {
    // ------------------------------------------------------
    // STEP F: HANDLE ERRORS
    // ------------------------------------------------------
    // Any error thrown in the try block ends up here.
    //
    // Why this matters:
    // APIs fail.
    // Internet fails.
    // Input fails.
    // Good apps handle failure without crashing.
    // ------------------------------------------------------
    console.error("Weather app error:", error);
    hideCard();
    setStatus(error.message, "error");
  }
}


// ------------------------------------------------------------
// 8. RENDER WEATHER DATA INTO THE PAGE
// ------------------------------------------------------------
// This function takes clean data and updates the HTML.
//
// Why separate this into its own function?
// - cleaner structure
// - easier to read
// - easier to reuse or edit later
// - "getting data" and "displaying data" are related but different jobs
// ------------------------------------------------------------

function renderWeather(name, country, current) {

  dewPointValue.textContent = `${Math.round(current.dew_point_2m)}°F`;
  windDirectionValue.textContent = `${current.wind_direction_10m}°`;

  console.log("Rendering weather for:", name, country);
  console.log("Current weather passed into renderWeather:", current);

  // Convert numeric weather code into text + icon
  const weatherInfo = getWeatherDescription(current.weather_code);

  // Update text and icon in the page
  cityName.textContent = `${name}, ${country}`;
  conditionText.textContent = weatherInfo.text;
  weatherIcon.textContent = weatherInfo.icon;

  // Math.round() makes the temperature look cleaner
  // Example: 72.6 becomes 73
  temperature.textContent = `${Math.round(current.temperature_2m)}°F`;
  feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}°F`;

  humidityValue.textContent = `${current.relative_humidity_2m}%`;
  windValue.textContent = `${Math.round(current.wind_speed_10m)} mph`;

  // Log what the user should now see
  console.log("Updated DOM values:");
  console.log("City:", cityName.textContent);
  console.log("Condition:", conditionText.textContent);
  console.log("Temperature:", temperature.textContent);
  console.log("Feels like:", feelsLike.textContent);
  console.log("Humidity:", humidityValue.textContent);
  console.log("Wind:", windValue.textContent);

  // Finally show the card after data is ready
  showCard();
}


// ------------------------------------------------------------
// EOF
// ------------------------------------------------------------
// Summary:
// - HTML holds the content areas
// - CSS styles the interface
// - JS responds to user actions
// - fetch() gets external data
// - JSON becomes a JS object
// - JS updates the DOM with the returned data
// - console.log() helps trace the app step by step
// - try/catch prevents ugly failure
// ------------------------------------------------------------
// The core mental model:
// Input -> Fetch -> Data -> DOM -> Feedback
// ------------------------------------------------------------