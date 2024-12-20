import { NextResponse } from "next/server";
import mqtt from "mqtt";

// MQTT broker configuration
const brokerUrl = process.env.MQTT_BROKER_URL;
const options = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

// Store messages per device serial number
let mqttData = {};
let subscribedTopics = new Set();

// Function to dynamically generate the MQTT topic based on the serial number
const generateMqttTopic = (serialId) => {
  const prefix = serialId.slice(0, 3); // e.g., "AX3"
  const suffix = serialId.slice(3, 5); // e.g., "03"
  return `${prefix}/${suffix}/OUTPUT`; // e.g., "AX3/03/OUTPUT"
};

// Establish connection to the MQTT broker
const client = mqtt.connect(brokerUrl, options);

client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

client.on("message", (topic, message) => {
  try {
    const messageString = message.toString();

    const parsedMessage = JSON.parse(messageString);
    const fullSerialId = topic.split("/")[0] + topic.split("/")[1]; // e.g., AX303

    if (!mqttData[fullSerialId]) {
      mqttData[fullSerialId] = [];
    }
    mqttData[fullSerialId].push(parsedMessage);

    // Keep only the latest 10 messages for each serialId
    if (mqttData[fullSerialId].length > 1) {
      mqttData[fullSerialId].shift();
    }
  } catch (error) {
    console.error("Failed to parse MQTT message:", error);
    console.error("Original message:", message.toString());
  }
});

client.on("error", (err) => {
  console.error("Connection error:", err);
});

// Subscribe to a dynamically generated topic based on the serial number
const subscribeToTopic = async (serialId) => {
  const topic = generateMqttTopic(serialId);
  if (!subscribedTopics.has(topic)) {
    return new Promise((resolve, reject) => {
      client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
          reject(err);
        } else {
          console.log(`Subscribed to ${topic}`);
          subscribedTopics.add(topic);
          resolve();
        }
      });
    });
  }
};

// Unsubscribe from a topic based on serial number
const unsubscribeFromTopic = (serialId) => {
  const topic = generateMqttTopic(serialId);
  if (subscribedTopics.has(topic)) {
    client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to unsubscribe from ${topic}:`, err);
      } else {
        console.log(`Unsubscribed from ${topic}`);
        subscribedTopics.delete(topic);
      }
    });
  }
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const serialId = searchParams.get("serialId");

  if (!serialId) {
    console.log("serialId parameter is missing");
    return NextResponse.json(
      { error: "serialId parameter is required" },
      { status: 400 }
    );
  }

  try {
    await subscribeToTopic(serialId);
    console.log(`Subscribed to topic for serialId: ${serialId}`);

    // Wait for a short period to allow subscription and message reception
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const data = mqttData[serialId] || [];
    console.log("Data received for serialId:", serialId, "Data:", data);

    const readings = data.length > 0 ? data[data.length - 1] : {};
    const result = {
      RawCH1: readings.RawCH1,
      RawCH2: readings.RawCH2,
      RawCH3: readings.RawCH3,
      RawCH4: readings.RawCH4,
      RawCH5: readings.RawCH5,
      RawCH6: readings.RawCH6,
    };

    console.log("Returned readings for serialId:", serialId, "Data:", result);

    // Unsubscribe after fetching data
    unsubscribeFromTopic(serialId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
