// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SENSORS_DATA_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const putItemHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);

  let id = null;

  if (body.id) {
    id = body.id;
  } else {
    id = uuidv4();
  }

  const deviceId = body.device_id;
  const macAddress = body.mac_address;
  const ipAddress = body.ip_address;
  const soilPH = body.soil_ph;
  const soilMoisture = body.soil_moisture;
  const humidityLevel = body.humidity_level;
  const uvIndex = body.uv_index;
  const temperature = body.temperature;
  const lightIntensity = body.light_intensity;
  let happenedAt = body.happened_at;

  if (happenedAt) {
    happenedAt = new Date(happenedAt).toISOString();
  }

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  const params = {
    TableName: tableName,
    Item: {
      id: id,
      device_id: deviceId,
      mac_address: macAddress,
      ip_address: ipAddress,
      humidity_level: humidityLevel,
      temperature: temperature,
      light_intensity: lightIntensity,
      soil_moisture: soilMoisture,
      happened_at: happenedAt,
      created_at: new Date().toISOString(),
    },
  };

  if (uvIndex) {
    params.Item.uv_index = uvIndex;
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
  } catch (err) {
    response.statusCode = 400;
    response.body = (err.message || err.stack).toString();
    console.log("Error", err.stack);
  }

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
