import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import LocalFile from '../../files/localFile.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;
  @ManyToOne(() => User)
  @JoinColumn()
  recipient: User;
  @Column({ nullable: true })
  status: string;
  @OneToMany(() => Message, (message: Message) => message.chat)
  messages: Message[];
}


@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @Column({ nullable: true })
  message: string;
  @Column({ nullable: true })
  senderID: string;
  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;
  @Column({ nullable: true })
  recipientID: string;
  @ManyToOne(() => User)
  @JoinColumn()
  recipient: User;
  @Column({ nullable: true })
  time: string;
  @Column({ nullable: true })
  role: string;
  @Column({ nullable: true })
  status: string;
  @Column({ nullable: true })
  read: string;
  @ManyToOne(() => User)
  @JoinColumn()
  contactName: User;
  @Column({ nullable: true })
  type: string;
  @ManyToOne(() => Chat, (chat: Chat) => chat.messages)
  @JoinColumn()
  chat: Chat;
  @JoinColumn({ name: 'imageID' })
  @OneToOne(() => LocalFile,{nullable: true})
  public image?: LocalFile;
  constructor(chat?: Partial<Message>) {
    Object.assign(this, chat);
  }
}

