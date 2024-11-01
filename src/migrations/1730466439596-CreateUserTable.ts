import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserTable1730466439596 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true, // Auto-increment
          },
          {
            name: 'username',
            type: 'varchar',
            isUnique: true, // Unique username
            length: '50',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '100', // Store hashed passwords
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the users table
    await queryRunner.dropTable('users');
  }
}
