import crypto from "crypto";
import {PlanetEntity, CreatePlanetInput, UpdatePlanetInput} from "../schemas/planet.schema";
import {type} from "node:os";
const now = new Date();
export interface PlanetFilters {
    type?: string,
    minMassEarth?: number,
}

let storage = new Map<string, PlanetEntity>();

export const PlanetStorage = {
    getAll(filters?: PlanetFilters): PlanetEntity[] {
        let planets = Array.from(storage.values());
        if (filters?.type) {
            planets = planets.filter(p => p.type === filters.type);
        }
        if (filters?.minMassEarth !== undefined) {
            planets = planets.filter(p => p.massEarth >= Number(filters.minMassEarth));
        }
        return planets;
    },
    getById(id: string): PlanetEntity | undefined {
        return storage.get(id);
    },
    create( data: CreatePlanetInput): PlanetEntity {
        const id = crypto.randomUUID()
        const now = new Date();

        const newPlanet = {
            ...data,
            id: id,
            createdAt: now,
            updatedAt: now,
        }
        storage.set(id, newPlanet);
        return newPlanet;
    },
    update(id: string, data: UpdatePlanetInput): PlanetEntity | null {
        const existing = storage.get(id);
        if (!existing){
            return null;
        }
        const updatedPlanet = {
            ...existing,
            ...data,
            updatedAt: new Date(),
        }
        storage.set(id, updatedPlanet);
        return updatedPlanet;
    },

    delete(id: string): boolean {
        return storage.delete(id);
    },
    reset(): void {
        storage.clear();
    }
}