import type { Db } from "../../db/connection.js";

export interface User {
	id: string;
	email: string;
	name: string;
}

export interface UserWithPassword extends User {
	passwordHash: string;
}

export interface NewUser {
	email: string;
	name: string;
	passwordHash: string;
}

export interface UserRepository {
	findById(id: string): User | undefined;
	findByEmailWithPassword(email: string): UserWithPassword | undefined;
	create(user: NewUser): User;
	count(): number;
}

interface UserRow {
	id: string;
	email: string;
	name: string;
	password_hash: string;
}

export function createUserRepository(db: Db): UserRepository {
	const findByIdStmt = db.prepare<[string], UserRow>("SELECT * FROM users WHERE id = ?");
	const findByEmailStmt = db.prepare<[string], UserRow>("SELECT * FROM users WHERE email = ?");
	const insertStmt = db.prepare<[string, string, string, string, string]>(
		"INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
	);
	const countStmt = db.prepare<[], { count: number }>("SELECT COUNT(*) AS count FROM users");

	const toUser = (row: UserRow): User => ({ id: row.id, email: row.email, name: row.name });

	return {
		findById(id) {
			const row = findByIdStmt.get(id);
			return row && toUser(row);
		},
		findByEmailWithPassword(email) {
			const row = findByEmailStmt.get(email);
			return row && { ...toUser(row), passwordHash: row.password_hash };
		},
		create({ email, name, passwordHash }) {
			const user: User = { id: crypto.randomUUID(), email, name };
			insertStmt.run(user.id, email, name, passwordHash, new Date().toISOString());
			return user;
		},
		count() {
			return countStmt.get()?.count ?? 0;
		}
	};
}
