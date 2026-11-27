import { v4 as uuid } from 'uuid';
import type { Role, Status } from './types.js';

export interface StoredUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  status: Status;
  created_at: string;
  password: string;
}

export interface StoredInvitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  expires_at: string;
  used: boolean;
  revoked: boolean;
}

export interface StoredRefreshToken {
  token: string;
  user_id: string;
  expires_at: number;
  used: boolean;
  family: string;
}

const firstNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Karen', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zach', 'Amber', 'Blake', 'Clara', 'Derek',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson',
];

function createDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function seedUsers(): StoredUser[] {
  const users: StoredUser[] = [];

  users.push({
    id: uuid(),
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@nfolks.dev',
    role: 'admin',
    status: 'active',
    created_at: createDate(90),
    password: 'Admin123',
  });

  users.push({
    id: uuid(),
    first_name: 'Admin',
    last_name: 'Two',
    email: 'admin2@nfolks.dev',
    role: 'admin',
    status: 'active',
    created_at: createDate(85),
    password: 'Admin123',
  });

  for (let i = 0; i < 30; i++) {
    const isDeactivated = i >= 25;
    users.push({
      id: uuid(),
      first_name: firstNames[i],
      last_name: lastNames[i],
      email: `member${i + 1}@nfolks.dev`,
      role: 'member',
      status: isDeactivated ? 'deactivated' : 'active',
      created_at: createDate(80 - i * 2),
      password: 'Member123',
    });
  }

  return users;
}

export const users: StoredUser[] = seedUsers();
export const refreshTokens: StoredRefreshToken[] = [];
export const invitations: StoredInvitation[] = [];
