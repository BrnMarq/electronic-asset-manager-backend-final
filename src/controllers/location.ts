import { Request, Response } from "express";
import { validationResult } from "express-validator";
import Location from "../models/Location";
import Asset from "../models/Asset";

export const getLocations = async (_: Request, res: Response) => {
	try {
		const locations = await Location.findAll();
		res.status(200).json(locations);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getLocationById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const location = await Location.findByPk(id);
		if (!location) {
			return res.status(404).json({ message: "Location not found" });
		}
		res.status(200).json(location);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createLocation = async (req: Request, res: Response) => {
	try {
		const { name, description } = req.body;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const location = await Location.create({ name, description });
		res
			.status(201)
			.json({ location, message: "Location created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const updateLocation = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, description } = req.body;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		const location = await Location.findByPk(id);
		if (!location) {
			return res.status(404).json({ message: "Location not found" });
		}

		location.name = name ?? location.name;
		location.description = description ?? location.description;

		await location.save();
		res
			.status(200)
			.json({ location, message: "Location updated successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteLocation = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const location = await Location.findByPk(id);
		if (!location) {
			return res.status(404).json({ message: "Location not found" });
		}

		const associatedAssets = await Asset.count({ where: { location_id: id } });
		if (associatedAssets > 0) {
			return res.status(400).json({
				message:
					"No se puede eliminar la ubicación porque tiene activos asignados.",
			});
		}

		await location.destroy();
		res.status(200).json({ message: "Location deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
