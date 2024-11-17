import { Model, model, Schema } from "mongoose";
import { IGame } from "../types/types";

export const gameSchema = new Schema<IGame>({
    
}, {
    
})

interface IGameWithMethods extends Model<IGame> {
    getBySlug: (slug: string) => Promise<IGame | null>;
    getByReleaseYear: (releaseYear: number) => Promise<IGame | null>;
}

export const game = model<IGame, IGameWithMethods>('game', gameSchema);
