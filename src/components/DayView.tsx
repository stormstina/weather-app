import { getWeekday, formatDate, datesAreEqual } from "../utility/helper";
import { determineWeatherIcon } from "../utility/weatherIcons";

import ForecastDescriptors from "./ForecastDescriptors";
import InfoCard from "./InfoCard";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    WeatherData: WetherObject;
}
interface weatherDay {
    hour: string | number;
    temp: number;
    rain: number;
    wind_speed: number;
    weather_code: number;
}
interface WetherObject {
    date: string;
    uv_index: number;
    dayTempArr: number[];
    dayWeatherCodeArr: number[];
    dayRainArr: number[];
    dayWindspeedArr: number[];
}

const DayView = ({ WeatherData }: Props) => {
    console.log("weatherData", WeatherData);

    // Destructure the weatherData object
    const {
        date,
        uv_index,
        dayTempArr,
        dayWeatherCodeArr,
        dayRainArr,
        dayWindspeedArr,
    } = WeatherData;

    const Today = new Date();

    const todayisBeingRendered = datesAreEqual(new Date(date), Today);
    const currentTime = +Today.getHours();

    const dayweatherArr = dayTempArr
        .map((temp, index) => {
            return todayisBeingRendered && index < currentTime
                ? null
                : {
                      hour: index.toString().length > 1 ? index : "0" + index,
                      temp: temp,
                      rain: dayRainArr[index],
                      wind_speed: Math.round(dayWindspeedArr[index]),
                      weather_code: dayWeatherCodeArr[index],
                  };
            // Think of easy way as to not iterate through array twice
        })
        .filter((item): item is weatherDay => item !== null) as weatherDay[];

    console.log("dayweatherArr", dayweatherArr);

    return (
        <div className="forecast-wrapper">
            <h2>
                <span>{getWeekday(date)}</span>
                <span>{formatDate(date)}</span>
            </h2>

            <ForecastDescriptors showAdditionalHeadings={true} />

            <ul className="hourly-forecast">
                <>
                    {dayweatherArr.map(
                        (
                            {
                                hour,
                                temp,
                                rain,
                                wind_speed,
                                weather_code,
                            }: weatherDay,
                            index
                        ) => {
                            return (
                                <li
                                    //todo? change key
                                    key={index}
                                    className="forecast-card"
                                >
                                    <div>
                                        {hour}
                                        :00
                                    </div>
                                    <div className="right-cell">
                                        <div className="wind-cell">
                                            {wind_speed}
                                        </div>
                                        <div className="rain-cell">{rain}</div>
                                        <FontAwesomeIcon
                                            icon={determineWeatherIcon(
                                                weather_code
                                            )}
                                        />
                                        <div>{temp}°</div>
                                    </div>
                                </li>
                            );
                        }
                    )}
                </>
            </ul>
            <h2>Other info</h2>
            <InfoCard heading={"UV-index"} data={uv_index} />
        </div>
    );
};

export default DayView;
