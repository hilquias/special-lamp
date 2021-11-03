export type Account = {
    accountType: 'Account' | 'Group',
    parentAccount: string,
    accountKey: string,
    accountName: string,
}

export function Account(account: any): Account {
    const {
        accountType, parentAccount, accountKey, accountName
    } = account;

    if (accountType !== 'Account' && accountType !== 'Group') {
        throw new Error(`Unsupported account type: ${accountType}`);
    }

    if (parentAccount.trim() === '') {
        throw new Error('Parent account is required');
    }

    if (accountKey.trim() === '') {
        throw new Error('Account key is required');
    }

    if (accountName.trim() === '') {
        throw new Error('Account name is required');
    }

    const accountKeyLevel = parentAccount.split('.').length + 1;

    if (accountType === 'Account' && accountKeyLevel !== 4) {
        throw new Error('Account key must be 4 levels deep');
    }

    if (accountType === 'Group' && accountKeyLevel > 3) {
        throw new Error('Account key must be 3 levels deep or less');
    }

    return {
        accountType,
        parentAccount,
        accountKey,
        accountName,
    }
}
