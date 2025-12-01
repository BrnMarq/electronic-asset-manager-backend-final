import {
	Table,
	Column,
	Model,
	DataType,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	Unique,
	ForeignKey,
	BelongsTo,
} from "sequelize-typescript";
import { Role } from "../models/Role";

@Table({
	tableName: "users",
	modelName: "User",
	timestamps: true,
	updatedAt: false,
	paranoid: true,
})
export class User extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(false)
	@Unique
	@Column(DataType.STRING)
	username!: string;

	@AllowNull(false)
	@Unique
	@Column(DataType.STRING)
	email!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	first_name!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	last_name!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	salt!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	hashed_password!: string;

	@ForeignKey(() => Role)
	@Column(DataType.INTEGER)
	role_id?: number;

	@BelongsTo(() => Role)
	role?: Role;
}

export default User;
