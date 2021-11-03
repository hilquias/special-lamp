import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { handler } from './lambda';

describe('Test accounts handler', () => {
    let scanSpy: any;

    beforeAll(() => {
        scanSpy = jest.spyOn(DynamoDBDocument.prototype, 'scan');
    });

    afterAll(() => {
        scanSpy.mockRestore();
    });

    it('should return list of accounts', async () => {
        const items = [
            { SK: 'Group:1', accountName: 'Ativo', PK: '1' },
            { SK: 'Group:1.1', accountName: 'Circulante', PK: '1' },
            { SK: 'Group:1.1.1', accountName: 'Disponivel', PK: '1' },
            { SK: 'Account:1.1.1.1', accountName: 'Caixa', PK: '1' },
            { SK: 'Account:1.1.1.2', accountName: 'Banco conta Movimento', PK: '1' }
        ];

        scanSpy.mockReturnValue({ Items: items });

        const event = {
            routeKey: 'GET /accounts'
        } as any;

        const result = await handler(event);

        const expectedResult = {
            statusCode: 200,
            body: JSON.stringify(items),
        };

        expect(result).toEqual(expectedResult);
    });
});
