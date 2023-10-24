import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Question, Questionnaire } from "./questionaire.entity";
import { Editor } from "./beetroot-service.entity";

@Entity()
export class Exhibit {
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
    client: User
    @ManyToOne(() => Editor)
    @JoinColumn()
    editor: Editor
    @ManyToOne(() => Questionnaire, (questionnaire: Questionnaire) => questionnaire.exhibits)
    questionnaire: Questionnaire;
    @OneToMany(() => Question, (question) => question.exhibits)
    questions: Question[];
}

@Entity()
export class Dialogue {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({ nullable: true })
    category: string;
    @Column({ nullable: true })
    searchTerms: string;
    @Column({ nullable: true })
    question: string;
    @Column({ nullable: true })
    answer: string;
    @Column({ nullable: true })
    meta: string;
    @OneToOne(() => User,{ nullable: true})
    responder: User;

    @ManyToMany(() => Exhibit, (exhibit) => exhibit.questions)
    @JoinTable()
    exhibits: Exhibit[];

}




