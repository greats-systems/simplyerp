import { User } from "../../users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { ProfessionalService, ServiceProvider } from "../../service-providers/entities/service-provider.entity";

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  orderDate: Date;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  orderTrackerHash: string;
  @Column({ nullable: true })
  orderStatus: string; // service specific status
  @Column({ nullable: true })
  orderType: string; // service specific status
  @Column({ nullable: true })
  updatedStatus: string;
  @Column({ nullable: true })
  updatedStatusMessage: string; // service specific status
  @Column({ nullable: true })
  providerID: string; // service
  @ManyToOne(() => ServiceProvider, (provider: ServiceProvider) => provider.orders)
  provider: ServiceProvider;
  @ManyToOne(() => User, (customer: User) => customer.orders)
  customer: User;
  @OneToMany(() => OrderLine, (orderLines: OrderLine) => orderLines.order)
  orderLines: OrderLine[];
}
@Entity()
export class OrderLine {
  @PrimaryGeneratedColumn('uuid')
  orderLineID: string;
  @CreateDateColumn()
  orderDate: Date;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @ManyToOne(() => Order, (order: Order) => order.orderLines)
  order: Order;
  @ManyToOne(() => ProfessionalService, (service: ProfessionalService) => service.orders)
  service: ProfessionalService;
  @Column({ nullable: true, default: 0 })
  quantity: string;
  @Column({ nullable: true, default: 0 })
  weight: string;
  @Column({ nullable: true, default: 0 })
  discount: string;
  @Column({ nullable: true, default: 0 })
  vat: string;
  @Column({ nullable: true, default: 0 })
  amount: string;
  @Column({ nullable: true, default: 0 })
  total: string;
}