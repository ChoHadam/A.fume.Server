import { logger } from '@modules/winston';

import { IngredientCategoryDTO } from '@src/data/dto';

const { IngredientCategories } = require('@sequelize');

const LOG_TAG: string = '[IngredientCategory/DAO]';

class IngredientCategoryDao {
    /**
     * 재료 카테고리 조회
     *
     * @param {IngredientDTO} where
     * @return {Promise<ListAndCountDTO>} listAndCountDTO
     * @throws {NotMatchedError} if there is no ingredient
     */
    async readAll(where: any): Promise<IngredientCategoryDTO[]> {
        logger.debug(`${LOG_TAG} readAll(where = ${JSON.stringify(where)})`);
        const result = await IngredientCategories.findAll({
            where,
            nest: true,
            raw: true,
        });
        return result.map((it: any) => IngredientCategoryDTO.createByJson(it));
    }
}

export default IngredientCategoryDao;
