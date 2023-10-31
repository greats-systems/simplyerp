import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Question, Questionnaire, QuestionnaireSection } from "./questionaire.entity";
import { Editor } from "./beetroot-service.entity";
import { ApiProperty } from '@nestjs/swagger';

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
    @OneToMany(() => QuestionnaireSection, (questionnaireSections) => questionnaireSections.exhibits)
    questionnaireSections: QuestionnaireSection[];
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




@Entity()
export class QuestionAnswer {
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
    questionner: User
    @Column({ nullable: true })
    question: string;
    @OneToMany(() => Responses, (response) => response.question)
    responses: Responses[];
}

@Entity()
export class Responses {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @Column({ nullable: true })
    comment: string;
    @OneToOne(() => User,{ nullable: true})
    commenter: User;
    @ManyToOne(() => QuestionAnswer, (question) => question.responses)
    @JoinTable()
    question: QuestionAnswer[];
}
