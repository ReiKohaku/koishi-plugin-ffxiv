import levelup from "levelup";
import leveldown from "leveldown";

export class LevelDB {
    private readonly db;

    constructor(path) {
        this.db = levelup(leveldown(path));
    }

    public put(key: string, value: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.put(key, value, function (error) {
                if (error) reject(error);
                else resolve(void 0);
            })
        })
    }

    public get<T>(key: string): Promise<T> {
        return new Promise((resolve, reject) => {
            this.db.get(key, function (error, value) {
                if (error && error.type === "NotFoundError") resolve(null);
                else if (error) reject(error);
                else resolve(value as T);
            })
        })
    }
}
