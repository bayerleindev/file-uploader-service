import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './user.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      jest
        .spyOn(usersRepository, 'findOneBy')
        .mockResolvedValue(mockUser as User);

      const user = await usersService.findOne('testuser');

      expect(user).toEqual(mockUser);
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        username: 'testuser',
      });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersRepository, 'findOneBy').mockResolvedValue(null);

      const user = await usersService.findOne('nonexistentuser');

      expect(user).toBeNull();
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        username: 'nonexistentuser',
      });
    });
  });

  describe('create', () => {
    it('should create a new user and return the user id', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpassword');
      jest.spyOn(usersRepository, 'save').mockResolvedValue(mockUser as User);

      const result = await usersService.create({
        username: 'testuser',
        password: 'password',
      });

      expect(result).toEqual({ id: mockUser.id });
      expect(usersRepository.save).toHaveBeenCalled();
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          password: 'hashedpassword',
        }),
      );
    });
  });
});
