// Create clients and set shared const values outside of the handler.

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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
  const id = body.id;
  const deviceId = body.device_id;
  const macAddress = body.mac_address;
  const ipAddress = body.ip_address;
  const soilPH = body.soil_ph;
  const soilMoisture = body.soil_moisture;
  const humidityLevel = body.humidity_level;
  const uvIndex = body.uv_index;
  const temperature = body.temperature;
  const lightIntensity = body.light_intensity;
  const happenedAt = body.happened_at;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  var params = {
    TableName: tableName,
    Item: {
      id: id,
      device_id: deviceId,
      mac_address: macAddress,
      ip_address: ipAddress,
      soil_ph: soilPH,
      humidity_level: humidityLevel,
      temperature: temperature,
      lightIntensity: lightIntensity,
      soil_moisture: soilMoisture,
      uv_index: uvIndex,
      happened_at: happenedAt,
    },
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
  } catch (err) {
    console.log("Error", err.stack);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
