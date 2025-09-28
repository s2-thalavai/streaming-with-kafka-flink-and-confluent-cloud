import json
import time
from confluent_kafka import Producer
import random

# Confluent Cloud Configuration
conf = {
    'bootstrap.servers': '<YOUR_CONFLUENT_CLOUD_CLUSTER_URL>',  # Replace with your cluster's bootstrap servers
    'security.protocol': 'SASL_SSL',
    'sasl.mechanism': 'PLAIN',
    'sasl.username': '<YOUR_CONFLUENT_CLOUD_API_KEY>',      # Replace with your API key
    'sasl.password': '<YOUR_CONFLUENT_CLOUD_API_SECRET>'   # Replace with your API secret
}

producer = Producer(conf)

def delivery_report(err, msg):
    """ Called once for each message produced to indicate delivery result.
        Triggered by poll(). """
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to topic {msg.topic()} [{msg.partition()}] @ offset {msg.offset()}')

def generate_results_array(num_results=9):  # Added num_results parameter for flexibility
    """Generates an array of F1 race result dictionaries."""
    results_array = []
    drivers = ["Max Verstappen", "Charles Leclerc", "Lando Norris", "George Russell", "Carlos Sainz Jr.", "Lewis Hamilton", "Oscar Piastri", "Fernando Alonso", "Lance Stroll", "Yuki Tsunoda"]
    teams = {
        "Max Verstappen": "Oracle Red Bull Racing",
        "Charles Leclerc": "Scuderia Ferrari",
        "Lando Norris": "McLaren F1 Team",
        "George Russell": "Mercedes-AMG Petronas",
        "Carlos Sainz Jr.": "Scuderia Ferrari",
        "Lewis Hamilton": "Mercedes-AMG Petronas",
        "Oscar Piastri": "McLaren F1 Team",
        "Fernando Alonso": "Aston Martin Aramco",
        "Lance Stroll": "Aston Martin Aramco",
        "Yuki Tsunoda": "Visa Cash App RB"
    }
    team_colors = {
        "Oracle Red Bull Racing": "#1E41FF",
        "Scuderia Ferrari": "#DC0000",
        "McLaren F1 Team": "#FF8700",
        "Mercedes-AMG Petronas": "#00A19C",
        "Aston Martin Aramco": "#006F62",
        "Visa Cash App RB": "#469BFF"
    }

    # Ensure num_results doesn't exceed the number of drivers
    num_results = min(num_results, len(drivers))
    
    # Create a shuffled list of drivers to ensure different drivers each time
    available_drivers = drivers[:]  # Create a copy to avoid modifying the original
    random.shuffle(available_drivers)

    for i in range(num_results):
        driver = available_drivers[i] #get driver from shuffled list
        position = i + 1  # Assign position based on loop iteration
        points = max(0, 26 - position)
        interval_seconds = round(random.uniform(0, 5 * (position - 1)), 1) if position > 1 else ""
        interval = f"+{interval_seconds}s" if interval_seconds else ""
        logo_text = "".join([part[0].upper() for part in driver.split()])
        logo_color = team_colors.get(teams.get(driver, "default"), "#808080")
        logo_url = f"https://placehold.co/40x40/{logo_color}/FFFFFF?text={logo_text}"
        team_color = team_colors.get(teams.get(driver, "default"), "#808080")

        result = {
            "driver": driver,
            "team": teams.get(driver, "Unknown Team"),
            "position": position,
            "points": points,
            "interval": interval,
            "logo": logo_url,
            "teamColor": team_color
        }
        results_array.append(result)
    return results_array

if __name__ == '__main__':
    try:
        while True:
            results_array = generate_results_array() #get the array
            producer.produce('f1.leaderboard.results', key="race_results", value=json.dumps(results_array).encode('utf-8'), callback=delivery_report) #send the whole array
            producer.poll(0)
            print(f"Produced: {results_array}") #print array
            time.sleep(5)

    except KeyboardInterrupt:
        print("Shutting down producer...")
    finally:
        producer.flush()
