import { Response } from "express";
import { validationResult } from "express-validator";
import { Op } from "sequelize";
import Asset from "../models/Asset";
import { ChangeLog, ChangeType } from "../models/ChangeLog";
import Location from "../models/Location";
import Type from "../models/Type";
import User from "../models/User";
import { AuthenticatedRequest } from "../middlewares/authentication";
import * as Excel from "exceljs";

const includeInAsset = {
	include: [
		{
			model: Location,
			attributes: ["id", "name"],
		},
		{
			model: Type,
			attributes: ["id", "name", "category"],
		},
		{
			model: User,
			as: "responsible",
			attributes: ["id", "first_name", "last_name"],
		},
	],
	attributes: {
		exclude: ["createdAt", "deletedAt"],
	},
};

export const getAssets = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const {
			name,
			serial_number,
			type_id,
			description,
			responsible_id,
			location_id,
			status,
			cost,
			acquisition_date,
			page,
			limit,
		} = req.query;

		const pageNumber = Number(page) || 1;
		const limitNumber = Number(limit) || 10;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { count, rows: assets } = await Asset.findAndCountAll({
			where: {
				...(name && { name: { [Op.iLike]: `%${name}%` } }),
				...(serial_number && {
					serial_number: { [Op.iLike]: `%${serial_number}%` },
				}),
				...(type_id && { type_id }),
				...(description && { description: { [Op.iLike]: `%${description}%` } }),
				...(responsible_id && { responsible_id }),
				...(location_id && { location_id }),
				...(status && { status }),
				...(cost && { cost }),
				...(acquisition_date && { acquisition_date }),
			},
			limit: limitNumber,
			offset: (pageNumber - 1) * limitNumber,
			order: [["id", "DESC"]],
			...includeInAsset,
		});
		const activeAssets = await Asset.count({
			where: { status: "active" },
		});
		const inactiveAssets = await Asset.count({
			where: { status: "inactive" },
		});
		const decommissionedAssets = await Asset.count({
			where: { status: "decommissioned" },
		});

		res.status(200).json({
			assets,
			total: count,
			activeAssets,
			inactiveAssets,
			decommissionedAssets,
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

export const getAssetsStats = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const active = await Asset.count({
			where: { status: "active" },
		});
		const inactive = await Asset.count({
			where: { status: "inactive" },
		});
		const cost = await Asset.sum("cost", {
			where: {
				[Op.or]: [{ status: "inactive" }, { status: "active" }],
			},
		});

		res.status(200).json({
			active,
			inactive,
			cost,
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};

export const getAssetChangelog = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const { id } = req.params;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const changelog = await ChangeLog.findAll({
			where: { asset_id: id },
			order: [["createdAt", "DESC"]],
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "first_name", "last_name"],
				},
			],
		});

		res.status(200).json({ changelog });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};

export const createAsset = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const {
			name,
			serial_number,
			type_id,
			description,
			responsible_id,
			location_id,
			status,
			cost,
			acquisition_date,
		} = req.body;
		const { user } = req;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const created_asset = await Asset.create({
			name,
			serial_number,
			type_id,
			description,
			responsible_id,
			location_id,
			status,
			cost,
			acquisition_date,
			created_by: user.id,
		});
		const asset = await Asset.findByPk(created_asset.id, includeInAsset);
		res
			.status(201)
			.json({ asset: asset.toJSON(), message: "Asset created successfully" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};

export const deleteAsset = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const { user } = req;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const asset = await Asset.findByPk(id);
		if (!asset) {
			return res.status(404).json({ message: "Asset not found" });
		}

		await asset.destroy({
			audit: { changed_by: user.id, action: ChangeType.DELETE },
		} as any);
		res.status(200).json({ message: "Asset deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};

export const updateAsset = async (req: AuthenticatedRequest, res: Response) => {
	try {
		const { id } = req.params;
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const asset = await Asset.findByPk(id, includeInAsset);
		if (!asset) {
			return res.status(404).json({ message: "Asset not found" });
		}

		const {
			name,
			serial_number,
			type_id,
			description,
			responsible_id,
			location_id,
			status,
			cost,
			acquisition_date,
			change_reason,
		} = req.body;
		const { user } = req;

		const newAssetData = {
			name,
			serial_number,
			type_id,
			description,
			responsible_id,
			location_id,
			status,
			cost,
			acquisition_date,
		};

		for (const key in newAssetData) {
			if (newAssetData[key as keyof typeof newAssetData] === undefined) {
				delete newAssetData[key as keyof typeof newAssetData];
			}
		}

		if (
			newAssetData.location_id !== undefined &&
			Number(newAssetData.location_id) !== asset.location_id
		) {
			if (user.role !== "manager") {
				return res.status(403).json({
					message: `Acceso Denegado. Rol '${user.role}' no autorizado para reubicar activos.`,
				});
			}
		}

		if (
			newAssetData.status !== undefined &&
			newAssetData.status !== asset.status
		) {
			if (user.role !== "admin") {
				return res.status(403).json({
					message: `Acceso Denegado. Rol '${user.role}' no autorizado para modificar el estado.`,
				});
			}
		}

		asset.set(newAssetData);

		if (!asset.changed()) {
			return res
				.status(400)
				.json({ message: "No changes were made to the asset." });
		}

		await asset.save({
			audit: {
				changed_by: user.id,
				action: ChangeType.UPDATE,
				reason: change_reason,
			},
		} as any);

		await asset.reload(includeInAsset);

		res.status(200).json({
			message: "Asset updated successfully",
			asset: asset.toJSON(),
		});
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};

export const exportAssets = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		const {
			name,
			serial_number,
			type_id,
			description,
			responsible_id,
			location_id,
			status,
			cost,
			acquisition_date,
			//page,
			//limit,
		} = req.query;

		//const pageNumber = Number(page) || 1;
		//const limitNumber = Number(limit) || 10;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const includeInExcel = [
			{
				model: Location,
				as: "location",
				attributes: ["name"],
			},
			{
				model: Type,
				as: "type",
				attributes: ["name"],
			},
			{
				model: User,
				as: "responsible",
				attributes: ["first_name", "last_name"],
			},
		];

		const assets = await Asset.findAll({
			attributes: [
				"id",
				"name",
				"serial_number",
				"description",
				"status",
				"cost",
				"acquisition_date",
			],
			where: {
				...(name && { name: { [Op.iLike]: `%${name}%` } }),
				...(serial_number && {
					serial_number: { [Op.iLike]: `%${serial_number}%` },
				}),
				...(type_id && { type_id }),
				...(description && { description: { [Op.iLike]: `%${description}%` } }),
				...(responsible_id && { responsible_id }),
				...(location_id && { location_id }),
				...(status && { status }),
				...(cost && { cost }),
				...(acquisition_date && { acquisition_date }),
			},
			//limit: limitNumber,
			//offset: (pageNumber - 1) * limitNumber,
			order: [["id", "ASC"]],
			include: includeInExcel,
		});

		const workbook = new Excel.Workbook();
		const worksheet = workbook.addWorksheet("Inventario de Activos");

		worksheet.columns = [
			{ header: "ID", key: "id" },
			{ header: "Nombre", key: "name" },
			{ header: "N° de Serie", key: "serial_number" },
			{ header: "Tipo", key: "type" },
			{ header: "Descripción", key: "description" },
			{ header: "Responsable", key: "responsible" },
			{ header: "Ubicación", key: "location" },
			{ header: "Estado", key: "status" },
			{ header: "Costo", key: "cost" },
			{ header: "Fecha de Adquisición", key: "acquisition_date" },
		];

		worksheet.addRows(
			assets.map((asset) => {
				const assetJson = asset.toJSON();
				return {
					...assetJson,

					type: assetJson.type ? assetJson.type.name : null,
					location: assetJson.location ? assetJson.location.name : null,
					responsible: assetJson.responsible
						? `${assetJson.responsible.first_name} ${assetJson.responsible.last_name}`
						: null,
				};
			})
		);

		const buffer = await workbook.xlsx.writeBuffer();

		res.setHeader(
			"Content-Type",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		);
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=Inventario_Activos_${Date.now()}.xlsx`
		);
		return res.status(200).send(buffer);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
