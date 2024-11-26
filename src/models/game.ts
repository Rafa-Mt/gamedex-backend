import { Model, model, Schema } from "mongoose";
import { GameSearchQuery, IGame, IGamePrimitive, Sites } from "../types/types";
import { ApiGameDetails } from "../types/apitypes";
import { Platform } from "./platform";
import { Developer } from "./developer";
import { Genre } from "./genre";
import { AgeRating } from "./age_rating";
import { Publisher } from "./publisher";

export const gameSchema = new Schema<IGame>({
    api_id: {type: Number, required: true},
    title: {type: String, required: true},
    slug: {type: String},
    imageUrl: { type: String },
    description: { type: String },
    criticScore: { type: Number, default: 0 },
    userScore: { type: Number, default: 0 },
    platforms: [{ type: Schema.Types.ObjectId, ref: 'platform' }],
    developers: [{ type: Schema.Types.ObjectId, ref: 'developer' }],
    publishers: [{ type: Schema.Types.ObjectId, ref: 'publisher' }],
    genres: [{ type: Schema.Types.ObjectId, ref: 'genre' }],
    ageRating: { type: Schema.Types.ObjectId, ref: 'age_rating' },
    releaseDate: { type: Date },
    sites: { 
        website: {type: String},
        reddit: {type: String},
        metacritic: {type: String}
    }
}, {
    statics: {
        getByApiId: async function (api_id: number): Promise<IGame | null> {
            return await this.findOne({ api_id })
                .populate(['genres', 'platforms', 'publishers', 'developers', 'ageRating'])
        },
        createFromApiResponse: async function (data: ApiGameDetails): Promise<IGame> {

            const game = new Game();
            game.api_id = data.id;
            game.title = data.name;
            game.slug = data.slug
            game.imageUrl = Boolean(data.background_image) ? data.background_image as string : 'https://wallpapercave.com/wp/wp12044994.jpg';
            game.description = Boolean(data.description) ? data.description_raw as string : data.description_raw as string;
            game.releaseDate = data.released ? new Date(data.released) : new Date();
            game.platforms = await Promise.all(data.platforms.map(
                async (platform: any) => {
                    const found = await Platform.findOne({ api_id: platform.id });
                    if (found)
                        return found._id as Schema.Types.ObjectId;

                    const created = new Platform();
                    created.api_id = platform.id
                    created.name = platform.name
                    created.slug = platform.slug
                    await created.save();
                    return created._id as Schema.Types.ObjectId
                }
            ));
            game.developers = await Promise.all(data.developers.map(
                async (developer) => {
                    const found = await Developer.findOne({ api_id: developer.id });
                    // console.log(developer.id, found)
                    if (found) {
                        return found._id as Schema.Types.ObjectId;
                    }
                    // console.log('first')
                    const created = new Developer();
                    created.api_id = developer.id
                    created.name = developer.name
                    created.slug = developer.slug
                    await created.save();
                    return created._id as Schema.Types.ObjectId
                }
            ));

            game.publishers = await Promise.all(data.publishers.map(
                async (publisher) => {
                    const found = await Publisher.findOne({ api_id: publisher.id });
                    if (found)
                        return found._id as Schema.Types.ObjectId;

                    const created = new Publisher();
                    created.api_id = publisher.id
                    created.name = publisher.name
                    created.slug = publisher.slug
                    await created.save();
                    return created._id as Schema.Types.ObjectId
                }
            ));

            game.genres = await Promise.all(data.genres.map(
                async (genre) => {
                    const found = await Genre.findOne({ api_id: genre.id });
                    if (found)
                        return found._id as Schema.Types.ObjectId;

                    const created = new Genre();
                    created.api_id = genre.id
                    created.name = genre.name
                    created.slug = genre.slug
                    await created.save();
                    return created._id as Schema.Types.ObjectId
                }
            ));
            // console.log(data.esrb_rating)
            if (data.esrb_rating) {
                const foundEsrbRating = await AgeRating.findOne({ api_id: data.esrb_rating?.id })
                if (foundEsrbRating)
                    game.ageRating = foundEsrbRating._id as Schema.Types.ObjectId;

                else {
                    const createdESRB = new AgeRating();
                    createdESRB.api_id = data.esrb_rating.id
                    createdESRB.name = data.esrb_rating.name
                    createdESRB.slug = data.esrb_rating.slug
                    await createdESRB.save()
                    game.ageRating = createdESRB._id as  Schema.Types.ObjectId;
                }
            }
            
            game.sites = {
                website: data.website,
                reddit: data.reddit_url,
                metacritic: data.metacritic_url
            }

            await game.save();
            return game.populate(['genres', 'platforms', 'publishers', 'developers', 'ageRating']);
        }
    }
})

interface IGameWithMethods extends Model<IGame> {
    // getBySlug: (slug: string) => Promise<IGame | null>;
   search: (query: GameSearchQuery) => Promise<IGamePrimitive[] | null>;
   createFromApiResponse: (data: ApiGameDetails) => Promise<IGame>
   getDetails: (api_id: number) => Promise<IGame | null>;
   getByApiId: (api_id: number) => Promise<IGame | null>;
}

export const Game = model<IGame, IGameWithMethods>('game', gameSchema);
