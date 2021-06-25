import { controller, httpGet, httpPost } from "inversify-express-utils";
import express from "express";
import { AccessBaseController } from "./AccessBaseController";
import { UserChurch } from "../models";

@controller("/userchurch")
export class UserChurchController extends AccessBaseController {

    private async doesRecordExist(userId: string, churchId: string): Promise<boolean> {
        const data = await this.repositories.userChurch.loadByUserIdAndChurchId(userId, churchId);
        return data.length > 0;
    }

    @httpPost("/")
    public async save(req: express.Request<{}, {}, UserChurch>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async ({id, churchId}) => {
            if (await this.doesRecordExist(id, churchId)) return this.json({ message: 'User already has a linked person record' }, 400);
            const userChurch: UserChurch = {
                userId: id,
                churchId,
                personId: req.body.personId
            }

            const result = await this.repositories.userChurch.save(userChurch);
            return result;
        })
    }

}