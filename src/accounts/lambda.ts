import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { docClient } from '../common/dynamodb';
import { Account } from './model';

const PK = '1';

type DbAccount = Account & {
    PK: string,
    SK: string,
};

function toDbAccount(account: Account): DbAccount {
    const {
        accountType, parentAccount, accountKey, accountName
    } = account;

    const SK = `${accountType}:${parentAccount}.${accountKey}`;

    return {
        PK,
        SK,
        accountType,
        parentAccount,
        accountKey,
        accountName,
    };
}

function fromDbAccount(account: DbAccount): Account {
    return account;
}

async function getAccountFromDb(id: string): Promise<DbAccount> {
    const data = await docClient.get({
        TableName: 'Accounts', Key: { PK, SK: id }
    });
    if (!data.Item) {
        throw new Error(`Resource not found: ${id}`);
    }
    return data.Item as DbAccount;
}

async function getAccountsFromDb(): Promise<DbAccount[]> {
    const data = await docClient.scan({
        TableName: 'Accounts'
    });
    return data.Items as DbAccount[];
}

async function saveAccountToDb(account: DbAccount): Promise<DbAccount> {
    await docClient.put({
        TableName: 'Accounts', Item: account
    });
    return account;
}

async function deleteAccountFromDb(account: DbAccount): Promise<undefined> {
    await docClient.delete({
        TableName: 'Accounts', Key: { PK, SK: account.SK }
    });
    return;
}

function parseRequestBody(event: APIGatewayProxyEventV2): any {
    return JSON.parse(event?.body || '{}');
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    let body;

    let statusCode = 200;

    try {
        switch (event.routeKey) {
            case 'GET /accounts':
                body = await getAccountsFromDb();
                break;
            case 'POST /accounts':
                const createAccountParams = parseRequestBody(event);
                const accountToCreate = Account(createAccountParams);
                body = await saveAccountToDb(toDbAccount(accountToCreate));
                break;
            case 'PUT /accounts/<id>':
                const updateAccountId = event.pathParameters?.id || '';
                const updateAccountParams = parseRequestBody(event);
                const accountToUpdate = await getAccountFromDb(updateAccountId).then(fromDbAccount);
                body = await saveAccountToDb(toDbAccount({
                    ...accountToUpdate, ...updateAccountParams
                }));
                break;
            case 'DELETE /accounts/<id>':
                const deleteAccountId = event.pathParameters?.id || '';
                const accountToDelete = await getAccountFromDb(deleteAccountId);
                await deleteAccountFromDb(accountToDelete);
                body = {};
                break;
            default:
                throw new Error(`Unsupported route: '${event.routeKey}'`);
        }
    } catch (err) {
        statusCode = 400;
        body = { message: (err as Error).toString() };
    } finally {
        body = JSON.stringify(body);
    }

    return { statusCode, body };
}
