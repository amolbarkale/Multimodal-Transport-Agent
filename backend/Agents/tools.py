# weather_tool.py
import requests

def get_weather(city: str):
    url = f"https://wttr.in/{city}?format=j1"
    data = requests.get(url).json()
    temp = data["current_condition"][0]["temp_C"]
    desc = data["current_condition"][0]["weatherDesc"][0]["value"]
    return f"The current temperature in {city} is {temp}°C with {desc.lower()}."
