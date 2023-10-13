import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { AuthService } from 'src/common/auth/auth.service';
import LocalFilesService from 'src/files/localFiles.service';
import { CreateUserDTO } from './dto/create-user.input';
import { WalletRegistrationRequest } from './dto/wallet-create.dto';
import { JwtService } from '@nestjs/jwt';
import { UserWalletsService } from 'src/user-wallets/user-wallets.service';
import { CreateFirebaseAuthUserDTO } from 'src/service-providers/dto/firebase-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private localFilesService: LocalFilesService,
    private readonly userWalletsService: UserWalletsService,
    private jwtTokenService: JwtService,
  ) {}

  async generateUserCredentials(user: User) {
    // console.log(user)
    return  this.authService.generateUserCredentials(user)
  }
  async fetchUserDataByFirebaseAuthID(uid: string): Promise<User> {
    // console.log('@firebaseAuthUser user', uid)
    
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    // Join with the Customer and Vendor relations
    const firebaseUserID = uid
    queryBuilder
      .leftJoinAndSelect('user.wallet', 'wallet')
    // Use OR to match either customer or provider userID
    queryBuilder.where('user.firebaseAuthID = :firebaseUserID', { firebaseUserID });
    // Execute the query and return the results
    const user = await queryBuilder.getOne();
    // console.log('@getAccount user', user)
    // if(!user){
    //   const newUser= await this.registerFirebaseUser(firebaseAuthUser)
    //   console.log('newUser firebaseAuthUser',newUser)

    //   return newUser;
    // }
    // console.log('old firebaseAuthUser',user)

    return user;
  }
  async registerFirebaseUser(firebaseAuthUser: CreateFirebaseAuthUserDTO) {
    try {
      console.log('create User AccountDTO');
      console.log(firebaseAuthUser);
      const fullName = firebaseAuthUser.displayName.split(' ');
      try {
        const newUserDTA = new User()
        newUserDTA.email = firebaseAuthUser.email
        newUserDTA.firstName = fullName[0]
        newUserDTA.lastName = fullName[1]
        newUserDTA.firebaseAuthID = firebaseAuthUser.uid
        newUserDTA.gender = firebaseAuthUser.gender
        newUserDTA.age = firebaseAuthUser.age
        newUserDTA.displayName = firebaseAuthUser.displayName
        newUserDTA.profileImage = firebaseAuthUser.photoURL
        newUserDTA.emailVerified = firebaseAuthUser.emailVerified
        newUserDTA.isAnonymous = firebaseAuthUser.isAnonymous
        const userSchema = this.userRepository.create(newUserDTA);
        const newUser = await this.userRepository.save(userSchema);
        if (newUser) {
          console.log('registered newUser', newUser);
          await this.generateWalletAccount(newUser);
          return this.findOneByUserID(newUser.userID);
        }
      } catch (error) {
        return null;
      }
    } catch (error) {
      console.log('error exists', error);
      return null
    }
    return null;
  }
  async getUserFromAuthToken(authToken: string) {
    if (authToken) {
      const authUser = await this.decodeUserToken(authToken.toString());
      if (authUser) {
        let newUser = await this.getUserByID(authUser.userID);
        return newUser;
      }
      return null;
    }
    return null;
  }
  async generateWalletAccount(newUser: User) {
    // generate wallet account
    const walletSchema: WalletRegistrationRequest = {
      userID: newUser.userID,
      initialBalance: 0,
    };

    try {
      const walletAccount = await this.userWalletsService.registerWallet(
        walletSchema,
      );
      console.log('registered walletAccount', walletAccount);
      if (walletAccount) {
        const walletAddress = walletAccount.walletAddress.toString();
        newUser.walletAddress = walletAddress;
        newUser.wallet = walletAccount;
        await this.userRepository.update(newUser.userID, newUser);
        const updatedUser = await this.userRepository.findOne({
          where: { userID: newUser.userID },
          relations: { wallet: true },
        });
        console.log('User', updatedUser);
      }
    } catch (error) {
      console.log('wallet creation eerr', error);
    }
  }

  async register(createUserDTO: CreateUserDTO) {
    try {
      console.log('create User AccountDTO');
      console.log(createUserDTO);

      try {
        const userSchema = this.userRepository.create(createUserDTO);
        const newUser = await this.userRepository.save(userSchema);
        if (newUser) {
          console.log('registered newUser', newUser);
          await this.generateWalletAccount(newUser);
          return this.findOneByUserID(newUser.userID);
        }
      } catch (error) {
        return null;
      }
    } catch (error) {
      console.log('error exists', error);
      return null
    }
    return null;
  }
  async getServiceProviders(filter: any): Promise<any> {
    console.log('getAllAuctionFloors serviceCategory');
    console.log(filter.serviceCategory);

    try {
      let providers = await this.userRepository.find({
        where: { accountType: filter.serviceInRequest },
      });
      console.log('providers');
      console.log(providers);

      if (providers.length === 0) {
        return {
          status: 404,
          error: 'providers not found',
          data: null,
          message: `providers not found`,
        };
      }

      return {
        status: 200,
        error: null,
        data: providers,
        message: '',
      };
    } catch (error) {
      return {
        status: 305,
        error: 'providers fetching fialed',
        data: null,
        message: 'providers fetching fialed',
      };
    }
  }

  async getVendors(filter: any): Promise<any> {
    console.log('getVendors');
    console.log(filter.accountType);

    try {
      let accounts = await this.userRepository.find({
        where: { accountType: filter.accountType },
      });
      if (accounts.length === 0) {
        return {
          status: 404,
          error: 'accounts not found',
          data: null,
          message: `accounts not found`,
        };
      }

      return {
        status: 200,
        error: null,
        data: accounts,
        message: '',
      };
    } catch (error) {
      return {
        status: 305,
        error: 'accounts fetching fialed',
        data: null,
        message: 'accounts fetching fialed',
      };
    }
  }
  async getAllClients(): Promise<Array<User>> {
    let clients = await this.userRepository.find();

    if (!clients) {
      throw new NotFoundException(`Clients not found`);
    } else {
      console.log('clients');
      console.log(clients);
    }
    return clients;
  }

  async getAllEmployees() {
    let employees = await this.userRepository.find({
      where: { accountType: 'employee' },
    });

    if (!employees) {
      throw new NotFoundException(`Employees not found`);
    } else {
      console.log('employees');
      console.log(employees);
      return {
        status: 200,
        error: null,
        data: JSON.stringify(employees),
        message: '',
      };
    }
  }

  async update(
    userID: string,
    updateUserInput: UpdateUserInput,
  ): Promise<User> {
    console.log(updateUserInput);
    const user = await this.userRepository.preload({
      userID: userID,
      ...updateUserInput,
    });

    if (!user) {
      throw new NotFoundException(`User #${userID} not found`);
    }
    return this.userRepository.save(user);
  }

  // get all entity objects
  async findAll(): Promise<Array<User>> {
    return await this.userRepository.find({
      relations: { wallet: true },
    });
  }
async updateUserProrfileByID(UpdateUserInput: UpdateUserInput ): Promise<User> {
  if (UpdateUserInput) {
    try {
      const user = await this.userRepository.findOne({
        where: { firebaseAuthID: UpdateUserInput.uid },
      });
      console.log('updateUserProrfileByID user', user)
      user.tradeInterest= UpdateUserInput.tradeInterest;
      user.firstName = UpdateUserInput.firstName,
      user.lastName = UpdateUserInput.lastName,
      user.displayName = UpdateUserInput.displayName,
      user.phone = UpdateUserInput.phone,
      user.email = UpdateUserInput.email,
      user.city = UpdateUserInput.city,
      user.country = UpdateUserInput.country,
      user.streetAddress = UpdateUserInput.streetAddress,
      user.portfolioUrl = UpdateUserInput.portfolioUrl,
      user.selfDescription = UpdateUserInput.selfDescription,
      user.facebookUrl = UpdateUserInput.facebookUrl,
      user.xUrl = UpdateUserInput.xUrl,
      user.linkedInUrl = UpdateUserInput.linkedInUrl,
      user.instagramUrl = UpdateUserInput.instagramUrl,
      user.specialization = UpdateUserInput.specialization,
      user.specialSkills = UpdateUserInput.specialSkills,
      user.tradeInterest = UpdateUserInput.tradeInterest
      
      const userUpdate = await this.userRepository.update(user.userID, user)
      console.log('userUpdate user', userUpdate)
      console.log(userUpdate)
      console.log('updateUserProrfileByID firebaseAuthID', user.firebaseAuthID)

      const person = await this.fetchUserDataByFirebaseAuthID(user.firebaseAuthID)
      return person;
    } catch (error) {
      console.log('error', error);
    }
  }
  
}
  async getUserByID(userID: string): Promise<User> {
    if (userID == 'admin') {
      try {
        const user = await this.userRepository.findOne({
          where: { accountType: 'admin' },
        });
        return user;
      } catch (error) {
        console.log('error', error);
      }
    }
    const user = await this.userRepository.findOne({
      where: { userID: userID },
    });
    if(user){
      const wallet = await this.userWalletsService.findWallet(user.userID);
      user['wallet'] = wallet;
      return user;
    }else{return}
  }
  async findOne(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      throw new NotFoundException(`User #${email} not found`);
    }
    const wallet = await this.userWalletsService.findWallet(user.userID);
    user['wallet'] = wallet;
    return user;
  }

  async getUserProfile(token: string): Promise<User> {
    const decodedser = await this.decodeUserToken(token);
    let user;
    if (decodedser) {
      user = await this.userRepository.findOne({
        where: { userID: decodedser.sub },
        relations: { wallet: true },
      });
      console.log('getUserProfile');
      console.log(decodedser.sub);
    } else {
      throw new NotFoundException(`User token #${token} not valid`);
    }

    if (!user) {
      throw new NotFoundException(`User #${decodedser.sub} not found`);
    }
    const wallet = await this.userWalletsService.findWallet(user.userID);
    user['wallet'] = wallet;
    return user;
  }

  async findOneByUserID(userID: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userID: userID },
      relations: {
        wallet: true,
        orders: true,
      },
    });
    if (!user || user === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    return user;
  }

  async findOneByPhone(phone: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { phone: phone },
      relations: {
        wallet: true,
        orders: true,
      },
    });
    if (!user || user === null) {
      // throw new NotFoundException(`User #${phone} not found`);
      return null;
    }
    const wallet = await this.userWalletsService.findWallet(user.userID);
    user['wallet'] = wallet;
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email: email },
      relations: {
        wallet: true,
        orders: true,
      },
    });
    if (!user || user === null) {
      return null;
      // throw new NotFoundException(`User with ${email} not found`);
    }
    const wallet = await this.userWalletsService.findWallet(user.userID);
    user['wallet'] = wallet;
    return user;
  }

  async updateUser(userData) {
    console.log('usr', userData);
    try {
      const user = await this.userRepository.findOne({
        where: { userID: userData.userID },
      });
      user.accountType = userData.accountType;
      user.role = userData.role;
      const data = await this.userRepository.update(user.userID, user);
      return {
        status: 200,
        error: null,
        data: data,
        message: '',
      };
    } catch (error) {}
  }

  async remove(userID: string): Promise<boolean> {
    const user = await this.getUserByID(userID);
    await this.userRepository.remove(user);
    return true;
  }
  async addAvatar(userId: string, fileData: LocalFileDto) {
    const avatar = await this.localFilesService.saveLocalFileData(fileData);
    console.log('avatar', avatar);
    const notUpdatedUser = await this.userRepository.findOne({
      where: { userID: userId },
    });
    notUpdatedUser.avatarId = avatar.id;
    notUpdatedUser.onlineStatus = true;
    notUpdatedUser.password = null;
    notUpdatedUser.email = null;
    (notUpdatedUser.profileImage = avatar.filename),
      (notUpdatedUser.deletedDate = null);
    notUpdatedUser.role = null;
    console.log('notUpdatedUser', notUpdatedUser);

    const updateUser = await this.userRepository.update(
      notUpdatedUser.userID,
      notUpdatedUser,
    );

    const updatedUser = await this.userRepository.findOne({
      where: { userID: userId },
    });
    console.log('updateUser', updateUser);
    return {
      status: 200,
      data: JSON.stringify(updatedUser),
      error: null,
      errorMessage: null,
      successMessage: 'success',
    };
  }

  async onHandleSignUp(createUserDTO: CreateUserDTO) {
    try {
      const checkUser = await this.findOneByPhone(createUserDTO.phone);
      if (!checkUser) {
        console.log('adding new user');
        const req = await this.register(createUserDTO);
        if (req) {
          const user = await this.findOneByUserID(req.userID);
          const token = await this.authService.generateUserCredentials(req)
          user['token'] = token['access_token']
          console.log('token', user);
          return {
            status: 200,
            data: JSON.stringify(user),
            error: null,
            errorMessage: null,
            successMessage: 'success',
          };
        } else {
          return {
            status: 500,
            data: '',
            error: true,
            errorMessage: 'user could not be added, try again.',
            successMessage: null,
          };
        }
      } else {
        console.log('user already exists');
        return null;
      }
    } catch (error) {
      console.log('error exists', error);
      return {
        status: 404,
        data: '',
        error: true,
        errorMessage: 'User #00000 not found',
        successMessage: null,
      };
    }
  }

  async decodeUserToken(token: string): Promise<any> {
    if (token == 'admin') {
      try {
        const user = await this.getUserByID('admin');
        return user;
      } catch (error) {
        console.log('error', error);
      }
    } else {
      const user = this.jwtTokenService.decode(token);
      if (user) {
        // console.log(user)
        return user;
      }
    }
  }
}
