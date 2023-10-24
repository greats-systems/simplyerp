export interface OfferItemSearchBody {
    itemID: string,
    itemName: string,
    itemCategory: string,
    city: string,
    neighbourhood: string,
    providerID: string
  }

export interface OfferItemSearchResult {
    hits: {
      total: number;
      hits: Array<{
        _source: OfferItemSearchBody;
      }>;
    };
  }
  export interface ProfessionalServiceSearchBody {
    id: string,
    name: string,
    category: string,
    city: string,
    country: string,
    providerID: string
  }
  export interface BeautyProductServiceSearchBody {
    id: string,
    name: string,
    category: string,
    city: string,
    neighbourhood: string,
    providerID: string
  }

export interface BeautyProductServiceSearchResult {
    hits: {
      total: number;
      hits: Array<{
        _source: BeautyProductServiceSearchBody;
      }>;
    };
  }