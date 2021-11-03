import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

let region = process.env.AWS_REGION || 'us-west-2';

let options: DynamoDBClientConfig = { region };

if (process.env.AWS_SAM_LOCAL) {
    options.region = 'localhost';
    options.endpoint = 'http://dynamodb:8000';
}

export const ddbClient = new DynamoDBClient(options);

export const docClient = DynamoDBDocument.from(ddbClient);
