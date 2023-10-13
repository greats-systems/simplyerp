import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import LocalFile from 'src/files/localFile.entity';
import { Wallet } from './wallet.entity';
import { Order } from 'src/sales-orders/entities/order.entity';
import { Exclude } from 'class-transformer';



@Entity()
export class ConnectedUser {
  @PrimaryGeneratedColumn('uuid')
  connectionID: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  userID?: string;
  @Column({ nullable: true })
  socketID?: string;
  @Column({ nullable: true })
  currentConnectionStatus: string;
  @Column({ default: false })
  isOnline: boolean;
}



@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userID: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  firstName?: string;
  @Column({ nullable: true })
  lastName?: string; 
  @Column({ nullable: true })
  displayName?: string;
  @Column({ nullable: true })
  firebaseAuthID: string;
  @Column({ nullable: true })
  emailVerified: string;
  @Column({ nullable: true })
  isAnonymous: string;
  @Column({ nullable: true })
  selfDescription?: string;
  @Column({ nullable: true })
  tradeInterest?: string;
  @Column({ nullable: true })
  email?: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  city: string;
  @Column({ nullable: true })
  gender: string;
  @Column({ nullable: true })
  age: string;
  @Column({ nullable: true })
  country: string;
  @Column({ nullable: true })
  streetAddress: string;
  @Column({ nullable: true })
  portfolioUrl: string;
  @Column({ nullable: true })
  @Exclude()
  public password: string;
  @Column({ nullable: true })
  role: string;
  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  neighbourhood: string;
  @Column({ nullable: true })
  walletAddress: string;
  @Column({ nullable: true })
  onlineStatus: boolean;
  @Column({ nullable: true })
  facebookUrl: string;
  @Column({ nullable: true })
  xUrl: string;
  @Column({ nullable: true })
  linkedInUrl: string;
  @Column({ nullable: true })
  instagramUrl: string;
  @Column({ nullable: true })
  accountType: string;
  @Column({ nullable: true })
  specialization: string;
  @Column({ nullable: true })
  specialSkills?: string;
  @Column({ nullable: true })
  tradingAs: string;
  @JoinColumn({ name: 'walletID' })
  @OneToOne(() => Wallet)
  wallet: Wallet
  @JoinColumn({ name: 'avatarId' })
  @OneToOne(() => LocalFile,{nullable: true})
  public avatar?: LocalFile;
  @Column({ nullable: true })
  public avatarId?: string;
  @OneToMany(() => Order, (order: Order) => order.customer)
  orders: Order[];
  @OneToMany(() => Subscription, (subscription: Subscription) => subscription.profile)
  subscriptions: Subscription[];
}


@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  subscriptionsID: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @OneToOne(() => User)
  @JoinColumn()
  profile: User
  @OneToMany(() => User, (subscriber: User) => subscriber.subscriptions)
  subscribers: User[];
}



