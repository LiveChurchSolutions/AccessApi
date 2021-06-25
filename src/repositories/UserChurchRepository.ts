import { DB } from '../apiBase/db';
import { UserChurch } from '../models';
import { UniqueIdHelper } from '../helpers';

export class UserChurchRepository {

    public save(userChurch: UserChurch) {
        return userChurch.id ? this.update(userChurch) : this.create(userChurch);
    }

    private async create(userChurch: UserChurch) {
        userChurch.id = UniqueIdHelper.shortId();
        const { id, userId, churchId, personId } = userChurch;
        const sql = "INSERT INTO userChurches (id, userId, churchId, personId) values (?, ?, ?, ?)";
        const params = [id, userId, churchId, personId];
        await DB.query(sql, params);
        return userChurch;
    }

    private async update(userChurch: UserChurch) {
        const { id, userId, churchId, personId } = userChurch;
        const sql = "UPDATE userChurches SET userId=?, churchId=?, personId=? WHERE id=?;";
        const params = [userId, churchId, personId, id];
        await DB.query(sql, params);
        return userChurch;
    }

    public loadByUserIdAndChurchId(userId: string, churchId: string) {
        console.log(userId, churchId);
        const sql = "SELECT * FROM userChurches WHERE userId=? AND churchId=?";
        const params = [userId, churchId];
        return DB.query(sql, params);
    }

}