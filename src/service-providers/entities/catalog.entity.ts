import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { BeautyProduct, BeautyService } from './services.entity';
import { ProfessionalService, ServiceProvider } from './service-provider.entity';

@Entity()
export class Catalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  catalogType: string;
  @Column({ nullable: true })
  name: string;
  @Column({ nullable: true })
  description: string;
  @ManyToOne(() => ServiceProvider, (provider: ServiceProvider) => provider.orders)
  manager: ServiceProvider;
  @OneToMany(() => ProfessionalService, (service: ProfessionalService) => service.catalog)
  professionalServices: ProfessionalService[];
  @OneToMany(() => BeautyService, (service: BeautyService) => service.catalog)
  services: BeautyService[];
  @OneToMany(() => BeautyProduct, (products: BeautyProduct) => products.catalog)
  products: BeautyProduct[];

}




