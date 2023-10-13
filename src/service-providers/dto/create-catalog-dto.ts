export class CreateCatalogDTO{
    authToken: string;
    catalogType?: string;
    name?: string;
    description?: string;
    managerUserID: string;
}
export class CreatePortfolioDTO{
    authToken: string;
    portfolioType?: string;
    name?: string;
    description?: string;
    managerUserID: string;
}