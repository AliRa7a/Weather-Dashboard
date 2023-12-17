document.addEventListener('DOMContentLoaded', function () {
  const apiKey = 'fff3da3f431b046ee8346d12b4a11271'; // Replace with your actual API key
  const form = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const todaySection = document.getElementById('today');
  const forecastSection = document.getElementById('forecast');
  const historyList = document.getElementById('history');

  // Add an event listener for city buttons
  document.getElementById('history').addEventListener('click', function (e) {
    if (e.target.classList.contains('city-button')) {
      const cityName = e.target.dataset.city;

      // Trigger weather search for the selected city
      triggerWeatherSearch(cityName);
    }
  });

  // Modify the existing form submit event listener
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const cityName = searchInput.value.trim();

    if (cityName !== '') {
      // Trigger weather search for the entered city
      triggerWeatherSearch(cityName);
    }
  });

  function saveToHistory(city) {
    // Save search history logic (you can use localStorage or another storage method)
    // Append city to historyList
  }

  function triggerWeatherSearch(cityName) {
    // Clear previous data
    todaySection.innerHTML = '';
    forecastSection.innerHTML = '';

    // Save search history
    saveToHistory(cityName);

    // Fetch today's weather
    fetchTodayWeather(apiKey, cityName)
      .then((data) => {
        // Handle today's weather data
        displayTodayWeather(cityName, data);
      })
      .catch((error) => {
        console.error('Error fetching today\'s weather:', error);
      });

    // Fetch 5-day forecast starting from tomorrow
    fetchForecast(apiKey, cityName)
      .then((data) => {
        // Handle forecast data
        displayForecast(data);
      })
      .catch((error) => {
        console.error('Error fetching forecast:', error);
      });
  }

  function fetchTodayWeather(apiKey, city) {
    // Fetch current weather data from OpenWeatherMap API
    // Construct the API URL
    const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    // Fetch data using fetch() or jQuery.ajax()
    return fetch(apiUrl)
      .then(response => response.json());
  }

  function fetchForecast(apiKey, city) {
    // Fetch 5-day forecast data from OpenWeatherMap API starting from tomorrow
    // Construct the API URL
    const apiUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    // Fetch data using fetch() or jQuery.ajax()
    return fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // Filter out the data for today
        const tomorrow = dayjs().add(1, 'day').startOf('day');
        const filteredData = data.list.filter(item => dayjs(item.dt_txt).isAfter(tomorrow));

        // Create a new object with filtered data
        const modifiedData = {
          city: data.city,
          list: filteredData,
        };

        return modifiedData;
      });
  }

  function displayTodayWeather(city, data) {
    const { weather, main, wind } = data;
    const todayDate = dayjs().format('DD/MM/YYYY');
    const windSpeedKPH = (wind.speed * 3.6).toFixed(2);

    const todayWeatherHTML = `
      <div class="card mb-3">
        <div class="card-body">
          <h4 class="card-title">${city} ${todayDate} <img src="http://openweathermap.org/img/w/${weather[0].icon}.png" alt="Weather Icon"></h4>
          <div class="card-text">
            <strong>Temp:</strong> ${Math.round(main.temp - 273.15)}°C<br>
            <strong>Wind:</strong> ${windSpeedKPH} KPH <br>
            <strong>Humidity:</strong> ${main.humidity}%<br>
          </div>
        </div>
      </div>
    `;

    todaySection.innerHTML = todayWeatherHTML;
  }

  function displayForecast(data) {
    const forecastList = data.list.reduce((acc, item) => {
      const date = dayjs(item.dt_txt).format('YYYY-MM-DD');

      if (!acc[date]) {
        const windSpeedKPH = (item.wind.speed * 3.6).toFixed(2);

        acc[date] = {
          temperature: item.main.temp,
          humidity: item.main.humidity,
          wind: windSpeedKPH,
          icon: item.weather[0].icon,
        };
      }

      return acc;
    }, {});

    const forecastHTML = Object.entries(forecastList)
      .map(([date, info]) => {
        const formattedDate = dayjs(date).format('DD/MM/YYYY');
        const temperature = Math.round(info.temperature - 273.15);

        return `
          <div class="col-md-2">
            <div class="card">
              <div class="card-body p-0">
                <h5 class="card-title"><strong>${formattedDate}</strong> <img src="http://openweathermap.org/img/w/${info.icon}.png" alt="Weather Icon"></h5>
                <p class="card-text">Temp:${temperature}°C</p>
                <p class="card-text">Wind: ${info.wind} KPH</p>
                <p class="card-text">Humidity:${info.humidity}%</p>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    forecastSection.innerHTML = `<h2>5-day Forecast</h2><br><div class="row">${forecastHTML}</div>`;
  }

});
