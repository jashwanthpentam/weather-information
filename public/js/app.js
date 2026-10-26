const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status-message");

// 1. Get weather description and icon
function getWeatherInfo(code) {
    if (code === 0) {
        return { description: "Clear sky", icon: "☀️" };
    }
    if (code <= 2) {
        return { description: "Partly cloudy", icon: "🌤️" };
    }
    if (code === 3) {
        return { description: "Cloudy", icon: "☁️" };
    }
    if (code === 45 || code === 48) {
        return { description: "Fog", icon: "🌫️" };
    }
    if (code <= 57) {
        return { description: "Drizzle", icon: "🌦️" };
    }
    if (code <= 67 || (code >= 80 && code <= 82)) {
        return { description: "Rain", icon: "🌧️" };
    }
    if (code <= 77 || code === 85 || code === 86) {
        return { description: "Snow", icon: "❄️" };
    }
    if (code >= 95) {
        return { description: "Thunderstorm", icon: "⛈️" };
    }
    return { description: "Unknown", icon: "🌡️" };
}

// 2. Find city and get weather data 
async function getWeather(city) {
    try {
        statusMessage.textContent = "Loading weather...";
        searchButton.disabled = true;

        const cityURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) + "&count=1";

        let response = await fetch(cityURL);
        let cityData = await response.json();

        if (!response.ok || !cityData.results ||
            cityData.results.length === 0) {
            throw new Error("City not found. Try another name.");
        }

        const place = cityData.results[0];

        const weatherURL =
            "https://api.open-meteo.com/v1/forecast?" +
            "latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,relative_humidity_2m," +
            "apparent_temperature,weather_code,wind_speed_10m" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
            "&forecast_days=5&timezone=auto";

        response = await fetch(weatherURL);
        const data = await response.json();

        if (!response.ok) {
            throw new Error("Unable to get weather data.");
        }

        displayWeather(place, data);
        statusMessage.textContent =
            "Weather updated for " + place.name + ".";

    } catch (error) {
        statusMessage.textContent = error.message;
    } finally {
        searchButton.disabled = false;
    }
}

// 3. Display current weather and forecast
function displayWeather(place, data) {
    
    const current = data.current;
    const info = getWeatherInfo(current.weather_code);

    document.getElementById("location-name").textContent =place.name;
    document.getElementById("weather-description").textContent =info.description;
    document.getElementById("weather-icon").textContent =info.icon;
    document.getElementById("temperature").textContent =Math.round(current.temperature_2m);
    document.getElementById("humidity").textContent =current.relative_humidity_2m;
    document.getElementById("wind-speed").textContent =current.wind_speed_10m;
    document.getElementById("feels-like").textContent =Math.round(current.apparent_temperature);

    // Display five-day forecast
    const forecast = document.getElementById("forecast-container");
    forecast.innerHTML = "";

    for (let i = 0; i < data.daily.time.length; i++) {
        const date = new Date(data.daily.time[i] + "T12:00:00");

        const day = date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });

        const info = getWeatherInfo(data.daily.weather_code[i]);
        const max = Math.round(data.daily.temperature_2m_max[i]);
        const min = Math.round(data.daily.temperature_2m_min[i]);

        forecast.innerHTML += `
            <article class="forecast-card">
                <h3>${day}</h3>
                <p class="forecast-icon">${info.icon}</p>
                <p>${info.description}</p>
                <p class="forecast-temperature">
                    ${max}°C / ${min}°C
                </p>
            </article>
        `;
    }
}

// 4. Handle city search
searchForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        statusMessage.textContent = "Please enter a city name.";
        return;
    }

    getWeather(city);
});


// Load default city
cityInput.value = "Hyderabad";
getWeather("Hyderabad");
