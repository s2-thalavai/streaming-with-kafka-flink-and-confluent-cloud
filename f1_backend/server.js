// Filename: server.js
// To run: node server.js
// Ensure you have express, cors, ioredis, and node-rdkafka installed:
// npm install express cors ioredis node-rdkafka

const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const Kafka = require('node-rdkafka'); // Import node-rdkafka

const app = express();
const PORT = 9000;

// --- Redis Configuration ---
const redis = new Redis(); // Default connection to 127.0.0.1:6379
const REDIS_LEADERBOARD_KEY = 'f1_leaderboard_data';

// --- Kafka Configuration for Confluent Kafka ---
// ** IMPORTANT: Replace placeholders with your Confluent Cloud credentials and broker list **
const KAFKA_BROKERS = '<CONFLUENT_CLOUD_CLUSTER_URL>'; // e.g., 'pkc-xxxx.region.provider.confluent.cloud:9092'
const KAFKA_API_KEY =  '<CONFLUENT_CLOUD_API_KEY';
const KAFKA_API_SECRET = '<CONFLUENT_CLOUD_API_SECRET>';

const KAFKA_TOPIC = 'f1.leaderboard.results'; // The Kafka topic to consume from
const KAFKA_GROUP_ID = 'f1-leaderboard-consumer-group';

const consumer = new Kafka.KafkaConsumer({
  'bootstrap.servers': KAFKA_BROKERS,
  'group.id': KAFKA_GROUP_ID,
  'security.protocol': 'SASL_SSL',
  'sasl.mechanisms': 'PLAIN',
  'sasl.username': KAFKA_API_KEY,
  'sasl.password': KAFKA_API_SECRET,
  'socket.keepalive.enable': true,
  'debug': 'consumer,cgrp,topic,fetch' // Optional: for more detailed logs
}, {
  // Topic-specific configuration
  'auto.offset.reset': 'earliest' // Start from the earliest message if no offset is stored
});

// Middleware
app.use(cors());

// --- Kafka Consumer Logic ---
function connectKafkaConsumer() {
  consumer.connect();

  consumer.on('ready', () => {
    console.log('Kafka consumer connected and ready.');
    consumer.subscribe([KAFKA_TOPIC]);
    // Start consuming messages
    consumer.consume();
  });

  consumer.on('data', async (message) => {
    console.log(`Received message from Kafka topic ${KAFKA_TOPIC}, partition ${message.partition}, offset ${message.offset}`);
    try {
      if (message.value) {
        const messageValue = message.value.toString();
        const newLeaderboardData = JSON.parse(messageValue);

        // Basic validation: Ensure the data is an array
        // if (!Array.isArray(newLeaderboardData)) {
        //   console.error('Received Kafka message is not a valid JSON array. Skipping update.');
        //   console.error('Message value:', messageValue);
        //   return;
        // }

        // The data from Kafka is assumed to be the complete, sorted leaderboard.
        // It should contain all necessary fields (pos, name, team, logo, teamColor, points, interval).
        // Overwrite the previous state in Redis.
        await redis.set(REDIS_LEADERBOARD_KEY, JSON.stringify(newLeaderboardData));
        console.log('Leaderboard data updated in Redis from Kafka message.');
      } else {
        console.warn('Received Kafka message with empty value.');
      }
    } catch (parseError) {
      console.error('Error parsing Kafka message JSON:', parseError);
      if (message && message.value) {
        console.error('Received message value:', message.value.toString());
      }
    }
  });

  consumer.on('event.error', (err) => {
    console.error('Error from Kafka consumer:', err);
  });

  consumer.on('event.log', (log) => {
    // console.log('Kafka consumer event.log:', log); // Very verbose, enable if needed for deep debugging
  });

  consumer.on('disconnected', () => {
    console.log('Kafka consumer disconnected. Attempting to reconnect...');
    // Implement reconnection logic if needed, though node-rdkafka handles some of this.
    // For robust applications, consider a more sophisticated reconnection strategy.
    setTimeout(() => {
        if (!consumer.isConnected()) {
            consumer.connect();
        }
    }, 5000); // Try to reconnect after 5 seconds
  });
}


// API endpoint to get the current leaderboard from Redis
app.get('/api/leaderboard', async (req, res) => {
    console.log("request received");
  try {
    const leaderboardDataString = await redis.get(REDIS_LEADERBOARD_KEY);
    console.log("Returning Data");
    console.log(leaderboardDataString);
    if (leaderboardDataString) {
      const leaderboardData = JSON.parse(leaderboardDataString);
      console.log("Final Data");
      console.log(leaderboardData);
      res.json(leaderboardData);
    } else {
      // If no data in Redis (e.g., Kafka consumer hasn't received messages yet or topic is empty)
      console.log('API: No data currently in Redis. Waiting for Kafka messages.');
      res.json("No data received in the backend!"); // Return an empty array
    }
  } catch (error) {
    console.error('API Error fetching leaderboard from Redis:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});


app.get('/api/test', (req, res) => {
    // Your API logic here
    const data = { message: 'Hello from the server!' };
    res.json(data); // Sending a JSON response
    // OR
    // res.send('Success!'); // Sending a text response
    // OR
    // res.status(200).end(); // Sending a status code with no body
  });

// Start the server
app.listen(PORT, async () => {
  console.log(`F1 Leaderboard backend server running on http://localhost:${PORT}`);

  // Check Redis connection
  redis.on('connect', () => {
    console.log('Connected to Redis successfully!');
  });
  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
    console.error('Please ensure Redis server is running and accessible.');
  });

  // Connect the Kafka consumer
  connectKafkaConsumer();
});

// Graceful shutdown
const signals = {
  'SIGHUP': 1,
  'SIGINT': 2,
  'SIGTERM': 15
};

const shutdown = (signal, value) => {
  console.log(`Received signal: ${signal}. Shutting down...`);
  consumer.disconnect((disconnectErr) => {
    if (disconnectErr) {
      console.error('Error disconnecting Kafka consumer:', disconnectErr);
    } else {
      console.log('Kafka consumer disconnected successfully.');
    }
    redis.quit(() => {
        console.log('Redis client disconnected.');
        process.exit(128 + value);
    });
  });
};

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => {
    shutdown(signal, signals[signal]);
  });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Perform cleanup and attempt graceful shutdown
    shutdown('uncaughtException', 99);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Perform cleanup and attempt graceful shutdown
    shutdown('unhandledRejection', 98);
});
