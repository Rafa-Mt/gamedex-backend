

export interface ApiResponse {
    data: any[]
}

export interface ApiResult<T extends ApiData> {
    count: number,
    next: string | null,
    previous: string | null,
    results: T[] ;
}

export interface ApiData {
    id: number,
    name: string,
    slug: string
}

export interface ApiGameSearch extends ApiData {
    platforms: {platform: ApiData}[]
    // stores: {store: ApiData}[] // Won't be used
    released: string // Need formatting
    // tba: stirng // Won't be used
    background_image: string | null
    // rating: number // Won't be used
    esrb_rating: ApiData | null
    genres: ApiData[]
}

export interface ApiGameDetails extends ApiGameSearch {
    description: string
    website: string
    reddit_url: string
    metacritic_url: string
    developers: ApiData[]
    genres: ApiData[]
    publishers: ApiData[]
}

