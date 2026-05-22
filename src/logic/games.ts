import { RESOURCE } from "../views/games"
import {addPlayersFilter, initializeGame} from "../backend/games.ts";

export const GamesLogic: any = {
    resource: RESOURCE,
    afterCreate: [],
    afterDelete: [],
    afterDeleteMany: [],
    afterGetList: [],
    afterGetMany: [],
    afterGetManyReference: [],
    afterGetOne: [],
    afterUpdate: [],
    afterUpdateMany: [],
    beforeCreate: [initializeGame],
    beforeDelete: [],
    beforeDeleteMany: [],
    beforeGetList: [addPlayersFilter],
    beforeGetMany: [],
    beforeGetManyReference: [],
    beforeGetOne: [],
    beforeUpdate: [],
    beforeUpdateMany: [],
    beforeSave: [],
    afterRead: [],
    afterSave: [],
}