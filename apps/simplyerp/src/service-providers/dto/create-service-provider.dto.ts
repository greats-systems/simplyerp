import { User } from "../../users/entities/user.entity";

export class CreateServiceProviderDto {
    userID: User; 
    motto: string;
    name: string
    price: string;
    description: string;
    category: string
    tradeStatus: string;
    trendingStatus: string;
    publishStatus: string;
    
}
