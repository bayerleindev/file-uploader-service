import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should call UsersService.create with correct parameters and return user id', async () => {
      const user = { username: 'testuser', password: 'testpass' };
      const result = { id: 1 };
      jest.spyOn(usersService, 'create').mockResolvedValue(result);

      const response = await usersController.createUser(user);

      expect(usersService.create).toHaveBeenCalledWith(user);
      expect(response).toEqual(result);
    });

    it('should throw an error if UsersService.create fails', async () => {
      const user = { username: 'testuser', password: 'testpass' };
      const errorMessage = 'Error creating user';
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new Error(errorMessage));

      await expect(usersController.createUser(user)).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
