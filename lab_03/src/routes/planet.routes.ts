import { Router, Request, Response } from "express";
import {PlanetStorage} from "../storage/planet.storage";
import { validate } from "../middleware/validate.middleware";
import { createPlanetSchema, updatePlanetSchema} from "../schemas/planet.schema";

const router = Router();

// Завдання 3.7 специфічний маршрут важкі планети
router.get('/heavy', (req: Request, res: Response) => {
    const heavyPlanets = PlanetStorage.getAll({minMassEarth: 10});
    res.status(200).json(heavyPlanets);
})
// всі планети
router.get('/', (req: Request, res: Response) => {
    const {type,minMassEarth} = req.query;

    const planets = PlanetStorage.getAll({
        type: type as string,
        minMassEarth: minMassEarth ? Number(minMassEarth) : undefined,
    });

    res.status(200).json(planets);
})
// по айді
router.get('/:id', (req: Request<{id: string}>, res: Response) => {
    const planet = PlanetStorage.getById(req.params.id);

    if (!planet) {
        res.status(404).json({
            message: 'Планету не знайдено',
        })
    }

    res.status(200).json(planet);
})
// створити нову планету
router.post('/', validate(createPlanetSchema), (req: Request, res: Response) => {
    const newPlanet = PlanetStorage.create(req.body);
    res.status(201).json(newPlanet);
});
//оновити планету
router.patch('/:id', validate(updatePlanetSchema), (req: Request<{id: string}>, res: Response) => {
    const updatedPlanet = PlanetStorage.update(req.params.id, req.body);

    if (!updatedPlanet) {
        return res.status(404).json({ message: 'Планету не знайдено' });
    }

    res.status(200).json(updatedPlanet);
});
// видалити
router.delete('/:id', (req: Request<{id: string}>, res: Response) => {
    const isDeleted = PlanetStorage.delete(req.params.id);

    if (!isDeleted) {
        return res.status(404).json({ message: 'Планету не знайдено' });
    }

    res.status(204).send();
});

export default router;