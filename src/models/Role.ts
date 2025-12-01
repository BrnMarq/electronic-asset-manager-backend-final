import {
	Table,
	Column,
	Model,
	DataType,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
} from "sequelize-typescript";

@Table({
	tableName: "roles",
	modelName: "Role",
	timestamps: false,
})
export class Role extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@AllowNull(true)
	@Column(DataType.JSON)
	permissions?: object;
}

export default Role;
