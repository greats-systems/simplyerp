import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Exhibit } from "./exhibit.entity";
import { Questionnaire } from "./questionaire.entity";

export class BeetrootService {}

@Entity()
export class Editor {
  @PrimaryGeneratedColumn('uuid')
  employeeID: string;
  @CreateDateColumn()
  createdDate: Date;
  @UpdateDateColumn()
  updatedDate: Date;
  @DeleteDateColumn()
  deletedDate: Date;
  @OneToOne(() => User)
  @JoinColumn({ name: 'id_user' })
  user: User
  @OneToMany(() => Exhibit, (exhibit: Exhibit) => exhibit.editor)
  exhibits: Exhibit[];
  @OneToMany(() => Questionnaire, (questionnaire: Questionnaire) => questionnaire.editor)
  questionnaire: Questionnaire[];
}
