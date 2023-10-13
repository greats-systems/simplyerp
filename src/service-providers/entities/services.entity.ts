import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from "typeorm";
import { Catalog } from "./catalog.entity";
import { OrderLine } from "src/sales-orders/entities/order.entity";

@Entity()
export class BeautyService {
    @PrimaryGeneratedColumn('uuid')
    id :  string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({nullable: true})
    name:string 
    @Column({nullable: true})
    price : string;
    @Column({nullable: true})
    description : string; 
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
    @ManyToOne(() => Catalog, (catalog: Catalog) => catalog.services)
    catalog: Catalog;
    @OneToMany(() => OrderLine, (order: OrderLine) => order.service)
    orders: OrderLine[];
    @OneToMany(() => BeautyProductServiceImage, (images: BeautyProductServiceImage) => images.service)
    images: BeautyProductServiceImage[];
    
}

@Entity()
export class BeautyProduct {
    @PrimaryGeneratedColumn('uuid')
    id :  string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({nullable: true})
    name:string 
    @Column({nullable: true})
    quantity : string;
    @Column({nullable: true})
    weight: number;
    @Column({nullable: true})
    price : number;
    @Column({nullable: true})
    description : string; 
    @Column({nullable: true})
    category:string 
    @Column({nullable: true})
    catalogID :  string;
    @Column({nullable: true})
    catalogName :  string;
    @Column({nullable: true})
    tradeStatus : string; 
    @ManyToOne(() => Catalog, (catalog: Catalog) => catalog.products)
    catalog: Catalog;

    @OneToMany(() => BeautyProductServiceImage, (images: BeautyProductServiceImage) => images.product)
    images: BeautyProductServiceImage[];
    
}

@Entity()
export class BeautyProductServiceImage {
  @PrimaryGeneratedColumn('uuid')
  imageID :  string;
  @Column()
  filename: string;
  @Column()
  path: string;
  @Column()
  mimetype: string;
  @ManyToOne(() => BeautyProduct, (product: BeautyProduct) => product.images)
  public product: BeautyProduct;
  @ManyToOne(() => BeautyService, (service: BeautyService) => service.images)
  public service: BeautyService;
}