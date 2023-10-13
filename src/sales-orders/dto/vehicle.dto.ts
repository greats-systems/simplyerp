import { User } from "src/users/entities/user.entity";
import { Vehicle, VehicleImage } from "../../service-providers/entities/logistics.entity";
import { Order } from "../entities/order.entity";

export class VehicleDTO {
    authToken: string;
    vehicleClass: string;
    manufacturer: string;
    carryingWeightMax: string;
    carryingWeightMin: string;
    engineNumber: string;
    gvtRegNumber: string;
    description: string;
    routesActive: boolean;
    provider: User;
    driver: User;
    orders: Order[];
    images: VehicleImage[];
}

export class VehicleDriverDTO {
    driver?: User;
    vehicle?: Vehicle;
}
