import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async create(user: {
    username: string;
    password: string;
  }): Promise<{ id: number }> {
    const newUser = new User();
    newUser.username = user.username;
    newUser.password = await bcrypt.hash(user.password, 10);

    const savedUser = await this.usersRepository.save(newUser);
    return { id: savedUser.id };
  }
}
