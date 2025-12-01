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
	BeforeUpdate,
	BeforeDestroy,
} from "sequelize-typescript";
import { Type } from "../models/Type";
import { User } from "../models/User";
import { Location } from "../models/Location";
import { ChangeLog, ChangeLogMetadata, ChangeType } from "./ChangeLog";

export enum AssetStatus {
	DECOMISSIONED = "decommissioned",
	ACTIVE = "active",
	INACTIVE = "inactive",
}

const logChanges = async (asset: Asset, options: ChangeLogMetadata) => {
	if (!options?.action || !options?.changed_by)
		throw new Error("Action and changed_by are required on audit options.");

	const current = asset.toJSON() as any;
	
	const prev = (key: string) =>
		typeof asset.previous === "function"
			? asset.previous(key) ?? current[key]
			: current[key];

	let changesList: any[] = [];
	
	if (options.action === ChangeType.UPDATE) {
		const changedFields = asset.changed(); 
		
		if (changedFields && Array.isArray(changedFields)) {
			changesList = changedFields
				.filter(field => !['updatedAt', 'audit'].includes(field))
				.map(field => {
					return {
						field: field,
						oldValue: asset.previous(field),
						newValue: asset.getDataValue(field)
					};
				});
		}
	}

	await ChangeLog.create({
		asset_id: current.id,
		user_id: options.changed_by,
		change_type: options.action,
		change_reason: options?.reason ?? "No reason provided",
		
		changes: changesList,

		old_name: prev("name"),
		old_serial_number: prev("serial_number"),
		old_type_id: prev("type_id"),
		old_description: prev("description") || "",
		old_responsible_id: prev("responsible_id"),
		old_location_id: prev("location_id"),
		old_cost: prev("cost"),
		old_status: prev("status"),
		old_acquisition_date: prev("acquisition_date"),
	});
};

@Table({
	tableName: "asset",
	modelName: "Asset",
	timestamps: true,
	updatedAt: false,
	paranoid: true,
})
export class Asset extends Model {
	@PrimaryKey
	@AutoIncrement
	@Column(DataType.INTEGER)
	id!: number;

	@AllowNull(false)
	@Column(DataType.STRING)
	name!: string;

	@AllowNull(false)
	@Column(DataType.INTEGER)
	serial_number!: number;

	@AllowNull(false)
	@ForeignKey(() => Type)
	@Column(DataType.INTEGER)
	type_id!: number;

	@BelongsTo(() => Type)
	type!: Type;

	@AllowNull(true)
	@Column(DataType.STRING)
	description?: string;

	@AllowNull(false)
	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	responsible_id!: number;

	@BelongsTo(() => User, "responsible_id")
	responsible!: User;

	@AllowNull(false)
	@ForeignKey(() => Location)
	@Column(DataType.INTEGER)
	location_id!: number;

	@BelongsTo(() => Location)
	location!: Location;

	@AllowNull(false)
	@Column({
		type: DataType.ENUM,
		values: Object.values(AssetStatus),
		defaultValue: AssetStatus.ACTIVE,
	})
	status!: string;

	@AllowNull(false)
	@Column(DataType.DOUBLE)
	cost!: number;

	@AllowNull(false)
	@Column(DataType.DATE)
	acquisition_date!: Date;

	@AllowNull(false)
	@ForeignKey(() => User)
	@Column(DataType.INTEGER)
	created_by!: number;

	@BelongsTo(() => User, "created_by")
	creator!: User;

	@BeforeUpdate
	@BeforeDestroy
	static async logUpdate(instance: Asset, options: any) {
		if (!options?.audit)
			throw new Error("Audit options are required on update or delete.");
		await logChanges(instance, options.audit);
	}
}

export default Asset;