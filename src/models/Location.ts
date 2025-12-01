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
	tableName: "location",
	modelName: "Location",
	timestamps: true,
	updatedAt: false,
	paranoid: true,
})
export class Location extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@AllowNull(true)
	@Column(DataType.STRING)
	description?: string;
}

export default Location;
