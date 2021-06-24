import { controller, httpGet } from "inversify-express-utils";
import { AccessBaseController } from "./AccessBaseController";

@controller("/userchurch")
export class UserChurchController extends AccessBaseController {

    @httpGet("/test")
    public test () {
        return { "works": "right?" }
    }

}