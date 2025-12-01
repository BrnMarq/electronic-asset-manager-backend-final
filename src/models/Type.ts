import {
	Table,
	Column,
	Model,
	DataType,
	PrimaryKey,
	AutoIncrement,
	AllowNull,
	ForeignKey,
	BelongsTo,
	Default,
} from "sequelize-typescript";

@Table({
	tableName: "type",
	modelName: "Type",
	timestamps: true,
	updatedAt: false,
	paranoid: true
})
export class Type extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@AllowNull(false)
	@Column(DataType.STRING)
	category!: string;

	@AllowNull(true)
	@Column(DataType.STRING)
	description?: string;

	@ForeignKey(() => Type)
	@Column(DataType.INTEGER)
	parent_id?: number;

	@BelongsTo(() => Type)
	parent?: Type;
}

export default Type;
