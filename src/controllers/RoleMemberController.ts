import { controller, httpPost, httpGet, httpDelete, requestParam } from "inversify-express-utils";
import { RoleMember, User } from "../models";
import express from "express";
import { AuthenticatedUser } from '../auth';
import { AccessBaseController } from "./AccessBaseController"

@controller("/rolemembers")
export class RoleMemberController extends AccessBaseController {


    @httpGet("/roles/:id")
    public async loadByRole(@requestParam("id") id: number, req: express.Request<{}, {}, []>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            const members = await this.repositories.roleMember.loadByRoleId(id, au.churchId);
            const hasAccess = await this.checkAccess(members, "RoleMembers", "View", au);
            if (!hasAccess) return this.json({}, 401);
            else {
                if (this.include(req, "users")) {
                    const userIds: number[] = [];
                    members.forEach(m => { if (userIds.indexOf(m.userId) === -1) userIds.push(m.userId); });
                    if (userIds.length > 0) {
                        const users = await this.repositories.user.loadByIds(userIds);
                        users.forEach(u => {
                            u.password = null;
                            u.registrationDate = null;
                            u.lastLogin = null;
                            members.forEach(m => {
                                if (m.userId === u.id) m.user = u;
                            });
                        });
                    }
                }
                return this.json(members, 200);
            }
        });
    }

    @httpPost("/")
    public async save(req: express.Request<{}, {}, RoleMember[]>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            let members: RoleMember[] = req.body;
            const hasAccess = await this.checkAccess(members, "RoleMembers", "Edit", au);
            if (!hasAccess) return this.json({}, 401);
            else {
                const promises: Promise<RoleMember>[] = [];
                for (const member of members) {
                    member.churchId = au.churchId;
                    if (member.addedBy === undefined || member.addedBy === null) member.addedBy = au.id;
                    if (member.userId === undefined || member.userId === null || member.userId === 0) member.userId = await this.getUserId(member.user);
                    promises.push(this.repositories.roleMember.save(member));
                }
                members = await Promise.all(promises);
                return this.json(members, 200);
            }

        });
    }

    private async getUserId(user: User) {
        let u: User = await this.repositories.user.loadByEmail(user.email);
        if (u !== null) return u.id;
        else {
            user.lastLogin = new Date();
            user.password = (Math.random() * 9999999999).toString();
            user.registrationDate = new Date();
            u = await this.repositories.user.save(user);
            return u.id;
        }
    }


    @httpDelete("/:id")
    public async delete(@requestParam("id") id: number, req: express.Request<{}, {}, []>, res: express.Response): Promise<any> {
        return this.actionWrapper(req, res, async (au) => {
            const member = await this.repositories.roleMember.loadById(id, au.churchId);
            const hasAccess = await this.checkAccess([member], "RoleMembers", "View", au);
            if (!hasAccess) return this.json({}, 401);
            else {
                await this.repositories.roleMember.delete(id, au.churchId);
                return this.json([], 200);
            }
        });
    }

    private async checkAccess(members: RoleMember[], contentType: string, action: string, au: AuthenticatedUser) {
        const hasAccess = au.checkAccess(contentType, action);
        /*
        if (hasAccess && au.apiName !== "AccessManagement") {
            const roleIds: number[] = [];
            members.forEach(m => { if (roleIds.indexOf(m.roleId) === -1) roleIds.push(m.roleId); })
            if (roleIds.length > 0) {
                const roles = await this.repositories.role.loadByIds(roleIds);
                roles.forEach(r => { if (r.appName !== au.appName) hasAccess = false; })
            }
        }*/
        return hasAccess;
    }

}