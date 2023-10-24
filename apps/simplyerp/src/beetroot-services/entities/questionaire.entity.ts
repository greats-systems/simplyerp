import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ServiceProvider } from "../../service-providers/entities/service-provider.entity";
import { User } from "../../users/entities/user.entity";
import { Exhibit } from "./exhibit.entity";
import { Editor } from "./beetroot-service.entity";

@Entity()
export class Questionnaire {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column({ nullable: true })
    isExhibit: boolean;
    @CreateDateColumn()
    createdDate: Date;
    @UpdateDateColumn()
    updatedDate: Date;
    @DeleteDateColumn()
    deletedDate: Date;
    @OneToOne(() => User,{ nullable: true})
    responder: User;
    @Column({ nullable: true })
    category: string;
    @Column({ nullable: true })
    searchTerms: string;
    @Column({ nullable: true })
    title: string;
    @Column({ nullable: true })
    body: string;
    @ManyToOne(() => Editor, (editor: Editor) => editor.questionnaire)
    editor: Editor;
    @OneToMany(() => Exhibit, (exhibit) => exhibit.questionnaire)
    @JoinTable()
    exhibits: Exhibit[];
    @ManyToMany(() => Question, (question) => question.questionnaires)
    @JoinTable()
    questions: Question[];
    @OneToMany(() => ExhibitImage, (images: ExhibitImage) => images.questionnaire)
    images: ExhibitImage[];
}
@Entity()
export class ExhibitImage {
  @PrimaryGeneratedColumn('uuid')
  imageID :  string;
  @Column()
  filename: string;
  @Column()
  path: string;
  @Column()
  mimetype: string;
  @ManyToOne(() => Questionnaire, (service: Questionnaire) => service.images)
  public questionnaire: Questionnaire;
}
@Entity()
export class Question {
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
    @OneToOne(() => User,{ nullable: true})
    responder: User;
    @ManyToOne(() => ServiceProvider, (provider: ServiceProvider) => provider.orders)
    publisher: User;
    @ManyToMany(() => Questionnaire, (questionnaire) => questionnaire.questions)
    @JoinTable()
    questionnaires: Questionnaire[];
    @ManyToOne(() => Exhibit, (exhibit) => exhibit.questions)
    @JoinTable()
    exhibits: Exhibit[];
    @Column({ nullable: true })
    meta: string;

}




