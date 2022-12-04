export const extensionRegex = (assetsList: string[]) => new RegExp(`\\.(${assetsList.join('|')})$`);
