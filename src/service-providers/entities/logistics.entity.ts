import { User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from "typeorm";
import { Employee } from "./service-provider.entity";
import { Order } from "src/sales-orders/entities/order.entity";


@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  vehicleID :  string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({nullable: true})
  vehicleClass: string;
  @Column({nullable: true})
  manufacturer: string;
  @Column({nullable: true})
  carryingWeightMax: string;
  @Column({nullable: true})
  carryingWeightMin: string;
  @Column({nullable: true})
  engineNumber: string;
  @Column({nullable: true})
  gvtRegNumber: string;
  @Column({nullable: true})
  description: string;
  @Column({nullable: true})
  routesActive: boolean;
  @Column({nullable: true})
  onSale :  boolean;
  @OneToMany(() => TransportOrder, (orders: TransportOrder) => orders.assignedVehicle)
  orders: TransportOrder[];
  @OneToMany(() => VehicleImage, (image: VehicleImage) => image.vehicle)
  images: VehicleImage[];
}
@Entity()
export class VehicleImage {
  @PrimaryGeneratedColumn('uuid')
  imageID :  string;

  @Column()
  filename: string;
 
  @Column()
  path: string;
 
  @Column()
  mimetype: string;
  
  @ManyToOne(() => Vehicle, (vehicle: Vehicle) => vehicle.images)
  public vehicle: Vehicle;
}
@Entity()
export class VehicleDriver {
  @PrimaryGeneratedColumn('uuid')
  vehicleID :  string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @JoinColumn({ name: 'userID' })
  @OneToOne(() => Employee,{ nullable: true})
  driver: Employee;
  @JoinColumn({ name: 'vehicleID' })
  @OneToOne(() => Vehicle,{ nullable: true})
  vehicle: Vehicle;
}


@Entity()
export class TransportOrder {
  @PrimaryGeneratedColumn('uuid')
  transportOrderID: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @ManyToOne(() => Vehicle,(assignedVehicle: Vehicle) => assignedVehicle.orders)
  assignedVehicle: Vehicle[];
  @JoinColumn({ name: 'orderID' })
  @OneToOne(() => Order, { nullable: true })
  public deliveryOrder?: Order;
}
