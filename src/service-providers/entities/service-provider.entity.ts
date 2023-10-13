import { Subscription, User } from "src/users/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, OneToOne, Column, OneToMany, ManyToOne } from "typeorm";
import { Catalog } from "./catalog.entity";
import { Order } from "src/sales-orders/entities/order.entity";

@Entity()
export class ServiceProvider {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({ nullable: true })
    email?: string;
    @Column({ nullable: true })
    phone: string;
    @Column({ nullable: true })
    city: string;
    @Column({ nullable: true })
    country: string;
    @Column({ nullable: true })
    streetAddress: string;
    @Column({ nullable: true })
    portfolioUrl: string;
    @Column({ nullable: true })
    facebookUrl: string;
    @Column({ nullable: true })
    xUrl: string;
    @Column({ nullable: true })
    linkedInUrl: string;
    @Column({ nullable: true })
    instagramUrl: string;
    @JoinColumn({ name: 'id' })
    @OneToOne(() => User)
    user: User
    @Column({ nullable: true })
    adminUserID: string;
    @Column({ nullable: true })
    accountType: string;
    @Column({ nullable: true })
    specialization: string;
    @Column({ nullable: true })
    motto: string;
    @Column({ nullable: true })
    serviceType: string;
    @Column({ nullable: true })
    tradingName: string;
    @Column({ nullable: true })
    businessDescription: string;
    @Column({ nullable: true })
    shortTermGoals: string;
    @Column({ nullable: true })
    longTermGoals: string;
    @Column({ nullable: true })
    businessStage: string;
    @Column({ nullable: true })
    businessRegistrationNumber: string;
    @Column({ nullable: true })
    targetMarketCountry: string;
    @OneToMany(() => Order, (order: Order) => order.provider)
    orders: Order[];
    @OneToMany(() => Catalog, (catalog: Catalog) => catalog.manager)
    catalogs: Catalog[];
    @OneToMany(() => ProfessionalService, (service: ProfessionalService) => service.provider)
    services: ProfessionalService[];
    @OneToMany(() => Subscription, (subscription: Subscription) => subscription.profile)
    subscriptions: Subscription[];
  }

  @Entity()
  export class ProfessionalService {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({nullable: true})
    category:string 
    @Column({nullable: true})
    providerID :  string;
    @Column({nullable: true})
    catalogID :  string;
    @Column({nullable: true})
    catalogName :  string;
    @Column({nullable: true})
    tradeStatus : string;
    @Column({nullable: true})
    description : string;  
    @ManyToOne(() => ServiceProvider)
    @JoinColumn()
    provider: ServiceProvider
    @Column({ nullable: true })
    name: string;
    @Column({ nullable: true })
    price: string;
    @ManyToOne(() => Catalog, (catalog: Catalog) => catalog.services)
    catalog: Catalog;
    @OneToMany(() => Order, (order: Order) => order.customer)
    orders: Order[];
    @OneToMany(() => Subscription, (subscription: Subscription) => subscription.profile)
    subscriptions: Subscription[];
    @OneToMany(() => ProfessionalServiceImage, (images: ProfessionalServiceImage) => images.service)
    images: ProfessionalServiceImage[];
  }
  @Entity()
export class ProfessionalServiceImage {
  @PrimaryGeneratedColumn('uuid')
  imageID :  string;
  @Column()
  filename: string;
  @Column()
  path: string;
  @Column()
  mimetype: string;
  @ManyToOne(() => ProfessionalService, (service: ProfessionalService) => service.images)
  public service: ProfessionalService;
}
  @Entity()
  export class Employee {
    @PrimaryGeneratedColumn('uuid')
    employeeID: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @ManyToOne(() => ServiceProvider)
    @JoinColumn()
    employeer: ServiceProvider
    @OneToOne(() => User)
    @JoinColumn()
    profile: User
    @Column({ nullable: true })
    role: string;
    @Column({ nullable: true })
    specialization: string;
    @Column({ nullable: true })
    onlineStatus: boolean;
    @Column({ nullable: true })
    department: string;
    @Column({nullable: true , default: '0' })
    salary : string
    @Column({ nullable: true })
    deploymentStatus: string;
    @Column({ nullable: true })
    jobRole: string;
    @OneToMany(() => EmployeeJobs, (performedAssignments: EmployeeJobs) => performedAssignments.employee)
    performedAssignments: EmployeeJobs[];
  
  }
  
  @Entity()
  export class EmployeeJobs {
    @PrimaryGeneratedColumn('uuid')
    userID: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @OneToOne(() => ServiceProvider)
    @JoinColumn()
    employee: ServiceProvider
    @OneToOne(() => User)
    @JoinColumn()
    supervisor: User
    @Column({ nullable: true })
    taskName: string;
    @Column({ nullable: true })
    timeTaken: string;
    @Column({ nullable: true })
    department: string;
    @Column({nullable: true , default: '0' })
    hourlyRate : string
    @OneToMany(() => Order, (order: Order) => order.provider)
    performedAssignments: Order[];
  
  }