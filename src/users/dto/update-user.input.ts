import { PartialType } from '@nestjs/mapped-types';


export class UpdateUserInput{
  userID?: string;
  uid?: string;
  accountType?:string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  email?: string;
  city?: string;
  country?: string;
  streetAddress?: string;
  portfolioUrl?: string;
  selfDescription?: string;
  facebookUrl?: string;
  xUrl?: string;
  linkedInUrl?: string;
  instagramUrl?: string;
  specialization?: string;
  specialSkills?: string;
  tradeInterest?: string;
}
